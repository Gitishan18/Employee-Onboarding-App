import { LightningElement, wire, track } from 'lwc';
import getOnboardingSummary from '@salesforce/apex/OnboardingDashboardController.getOnboardingSummary';

export default class OnboardingSummary extends LightningElement {
    @track summary = {};
    @track error;
    @track isLoading = true;

    @wire(getOnboardingSummary)
    wiredSummary({ data, error }) {
        if (data) {
            this.summary = data;
            this.isLoading = false;
        } else if (error) {
            console.error('Error fetching summary:', error);
            this.error = error;
            this.isLoading = false;
        }
    }

    get totalEmployees() {
        return this.summary.totalEmployees || 0;
    }

    get pendingBgChecks() {
        return this.summary.pendingBgChecks || 0;
    }

    get completedEmployees() {
        return this.summary.completedEmployees || 0;
    }

    get onboardingCompletion() {
        return this.summary.onboardingCompletion || 0;
    }

    get progressStyle() {
        const percent = this.onboardingCompletion;
        const angle = (percent / 100) * 360;
        return `background: conic-gradient(#28a745 ${angle}deg, #e0e0e0 ${angle}deg);`;
    }
}
