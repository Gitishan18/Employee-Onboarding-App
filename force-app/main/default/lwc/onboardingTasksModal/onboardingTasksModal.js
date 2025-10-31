import { LightningElement, track, api } from 'lwc';
import getEmployeeTasks from '@salesforce/apex/OnboardingDashboardController.getEmployeeTasks';
import markTaskAsCompleted from '@salesforce/apex/OnboardingDashboardController.markTaskAsCompleted';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class OnboardingTasksModal extends LightningElement {
    @track isOpen = false;
    @track tasks = [];
    @track empId;
    @track empName;
    @track noTasks = false;
    @track isMobile = false; // ✅ Added

    connectedCallback() {
        this.detectDevice();
        // Detect screen size dynamically
        window.addEventListener('resize', this.detectDevice.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.detectDevice.bind(this));
    }

    detectDevice() {
        this.isMobile = window.innerWidth <= 768;
    }

    // ✅ Open modal and load tasks
    @api
    openModal(empId, empName) {
        this.empId = empId;
        this.empName = empName;
        this.isOpen = true;
        this.loadTasks();
    }

    closeModal() {
        this.isOpen = false;
        this.tasks = [];
        this.noTasks = false;
    }

    // ✅ Load tasks for employee
    loadTasks() {
        getEmployeeTasks({ empId: this.empId })
            .then(result => {
                if (!result || result.length === 0) {
                    this.noTasks = true;
                    this.tasks = [];
                } else {
                    this.noTasks = false;
                    this.tasks = result.map(task => ({
                        ...task,
                        isCompleted: task.Status__c === 'Completed'
                    }));
                }
            })
            .catch(error => {
                console.error('❌ Error loading tasks:', error);
                this.showToast('Error', 'Failed to load tasks', 'error');
            });
    }

    // ✅ Handle Mark as Completed button
    markCompleted(event) {
        const taskId = event.target.dataset.id;
        if (!taskId) {
            this.showToast('Error', 'Invalid task ID', 'error');
            return;
        }

        markTaskAsCompleted({ taskId })
            .then(() => {
                this.showToast('Success', 'Task marked as completed', 'success');

                // ✅ Instantly update UI without refresh
                this.tasks = this.tasks.map(task =>
                    task.Id === taskId
                        ? { ...task, Status__c: 'Completed', isCompleted: true }
                        : task
                );
            })
            .catch(error => {
                console.error('❌ Error updating task:', error);
                this.showToast('Error', error.body?.message || 'Failed to update task', 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
