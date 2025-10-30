import { LightningElement, wire, track } from 'lwc';
import getEmployeeOnboardingData from '@salesforce/apex/OnboardingDashboardController.getEmployeeOnboardingData';
import runBackgroundCheckForEmployee from '@salesforce/apex/OnboardingDashboardController.runBackgroundCheckForEmployee';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class EmployeeDashboard extends LightningElement {
    @track employees = [];
    wiredResult;

    // 🟢 Fetch all employee onboarding data
    @wire(getEmployeeOnboardingData)
    wiredData(result) {
        this.wiredResult = result;
        const { data, error } = result;

        if (data) {
            this.employees = data.map(emp => ({
                id: emp.id,
                name: emp.name,
                department: emp.department,
                joiningDate: this.formatDate(emp.joiningDate),
                onboardingStatus: emp.onboardingStatus || 'Not Started',
                backgroundStatus: emp.backgroundStatus || 'Pending',
                actionLabel: this.getActionLabel(emp.backgroundStatus),
                onboardingBadgeClass: this.getOnboardingBadgeClass(emp.onboardingStatus),
                bgBadgeClass: this.getBgBadgeClass(emp.backgroundStatus)
            }));
        } else if (error) {
            this.showToast('Error', 'Unable to load employee data', 'error');
        }
    }

    // 🟣 Get button label
    getActionLabel(bgStatus) {
        if (bgStatus === 'Verified') return 'Reverify';
        if (bgStatus === 'Rejected') return 'Recheck';
        return 'Run Check';
    }

    // 🟢 Onboarding badge
    getOnboardingBadgeClass(status) {
        switch (status) {
            case 'Completed':
                return 'badge badge-success';
            case 'In Progress':
                return 'badge badge-warning';
            default:
                return 'badge badge-neutral';
        }
    }

    // 🟡 Background badge
    getBgBadgeClass(status) {
        switch (status) {
            case 'Verified':
                return 'badge badge-success';
            case 'Rejected':
                return 'badge badge-error';
            default:
                return 'badge badge-neutral';
        }
    }

    // 🟠 Run background check
    async handleAction(event) {
        const empName = event.currentTarget.dataset.empname;
        this.showToast('Processing', `Running background check for ${empName}...`, 'info');

        try {
            const updatedStatus = await runBackgroundCheckForEmployee({ empName });

            this.showToast('Success', `Background check completed for ${empName}`, 'success');

            // ✅ Update UI instantly
            this.employees = this.employees.map(emp => {
                if (emp.name === empName) {
                    return {
                        ...emp,
                        backgroundStatus: updatedStatus || 'Verified',
                        bgBadgeClass: this.getBgBadgeClass(updatedStatus || 'Verified'),
                        actionLabel: this.getActionLabel(updatedStatus || 'Verified')
                    };
                }
                return emp;
            });

            await refreshApex(this.wiredResult);

        } catch (error) {
            console.error('Error:', error);
            this.showToast('Error', `Failed background check for ${empName}`, 'error');
        }
    }

    // 🔵 Open modal to view tasks
    handleViewTasks(event) {
        const empId = event.currentTarget.dataset.empid;
        const empName = this.employees.find(emp => emp.id === empId).name;

        const modal = this.template.querySelector('c-onboarding-tasks-modal');
        if (modal) {
            modal.openModal(empId, empName);
        }
    }

    // 📅 Format date
    formatDate(dateStr) {
        return dateStr
            ? new Date(dateStr).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
              })
            : '';
    }

    // 🧾 Toast helper
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
