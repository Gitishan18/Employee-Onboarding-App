import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import getEmployeeOnboardingData from '@salesforce/apex/OnboardingDashboardController.getEmployeeOnboardingData';
import updateTaskStatus from '@salesforce/apex/OnboardingDashboardController.updateTaskStatus';

export default class EmployeeDashboard extends NavigationMixin(LightningElement) {
    employees = [];
    wiredResult;

    @wire(getEmployeeOnboardingData)
    wiredTasks(result) {
        this.wiredResult = result;
        const { data, error } = result;
        if (data) this.employees = this.transformData(data);
        else if (error) this.showToast('Error', 'Could not load data', 'error');
    }

    transformData(data) {
        const empMap = {};
        data.forEach(task => {
            const emp = task.Employee__r || {};
            const name = emp.Name || 'Unknown';
            if (!empMap[name]) empMap[name] = { 
                name, 
                department: emp.Department__c, 
                startDate: this.formatDate(emp.Joining_Date__c), 
                tasks: [] 
            };
            empMap[name].tasks.push({
                id: task.Id,
                name: task.Name,
                status: task.Status__c,
                category: task.Task_Category__c,
                dueDate: this.formatDate(task.Due_Date__c),
                hasDueDate: !!task.Due_Date__c,
                trainingLink: task.Training_Program__r?.Meeting_Link__c,
                showComplete: task.Status__c === 'In Progress'
            });
        });

        const colors = ['blue', 'green', 'purple', 'orange', 'teal'];
        return Object.values(empMap).map((emp, i) => ({
            ...emp,
            colorClass: `emp-card-${colors[i % colors.length]}`,
            ...this.calculateMetrics(emp.tasks)
        }));
    }

    calculateMetrics(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'Completed').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const progress = total ? Math.round((completed / total) * 100) : 0;
        return {
            completedTasks: completed,
            pendingTasks: inProgress,
            progress,
            progressVariant: progress === 100 ? 'success' : progress >= 60 ? 'info' : 'warning'
        };
    }

    async handleComplete(event) {
        try {
            await updateTaskStatus({ taskId: event.currentTarget.dataset.taskId, status: 'Completed' });
            await refreshApex(this.wiredResult);
            this.showToast('Success', 'Task marked as completed', 'success');
        } catch {
            this.showToast('Error', 'Update failed', 'error');
        }
    }

    handleTrainingClick(event) {
        const url = event.currentTarget.dataset.url;
        if (url) this[NavigationMixin.Navigate]({ type: 'standard__webPage', attributes: { url } });
    }

    showToast(title, message, variant = 'info') {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    formatDate(dateStr) {
        return dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    }

    get displayEmployees() {
        return this.employees;
    }
}
