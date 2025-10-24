import { LightningElement, track } from 'lwc';
import submitDocument from '@salesforce/apex/EmployeeDocumentController.submitDocument';
import getEmployeeName from '@salesforce/apex/EmployeeDocumentController.getEmployeeName';

export default class EmployeeDocumentForm extends LightningElement {
    @track employeeId = '';
    @track employeeName = '';
    @track aadhaar = '';
    @track pan = '';
    @track passport = '';
    @track addressProof = '';
    @track bankAccount = '';
    @track drivingLicense = '';
    @track voterId = '';

    @track documentUrl = '';

    connectedCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        this.employeeId = urlParams.get('empId');
        if (this.employeeId) {
            this.loadEmployeeName();
            this.getEmployeeDetails();
        }
    }

    getEmployeeDetails() {
        getEmployeeInfo({ employeeId: this.employeeId })
            .then(result => {
                if (result) {
                    this.employeeName = result.Name;
                }
            })
            .catch(error => {
                console.error('Error fetching employee details:', error);
            });
    }

    handleChange(event){
        const field = event.target.dataset.id;
        this[field] = event.target.value;
    }

    validateFields() {
        // Aadhaar: 12 digits
        if (!/^\d{12}$/.test(this.aadhaar)) {
            alert('Aadhaar must be 12 digits');
            return false;
        }

        // PAN: 10 alphanumeric
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(this.pan)) {
            alert('PAN must be 10 characters in format: AAAAA9999A');
            return false;
        }

        // Passport: 6-9 alphanumeric
        if (this.passport && !/^[A-Z0-9]{6,9}$/i.test(this.passport)) {
            alert('Passport number must be 6-9 characters');
            return false;
        }

        // Bank account: 9-20 digits
        if (this.bankAccount && !/^\d{9,20}$/.test(this.bankAccount)) {
            alert('Bank Account must be 9-20 digits');
            return false;
        }

        // Driving license: optional 15 chars
        if (this.drivingLicense && this.drivingLicense.length > 15) {
            alert('Driving License max 15 characters');
            return false;
        }

        // Voter ID: optional 15 chars
        if (this.voterId && this.voterId.length > 15) {
            alert('Voter ID max 15 characters');
            return false;
        }

        // Document URL: optional, must be URL format
        if (this.documentUrl && !/^(https?:\/\/[^\s]+)$/.test(this.documentUrl)) {
            alert('Document URL must be valid');
            return false;
        }

        return true;
    }

    handleSubmit(){
        if(!this.employeeId){
            alert('Employee Id is missing in URL');
            return;
        }

        if(!this.validateFields()){
            return; // Stop submission if validation fails
        }

        submitDocument({
            employeeId: this.employeeId,
            aadhaar: this.aadhaar,
            pan: this.pan,
            passport: this.passport,
            addressProof: this.addressProof,
            bankAccount: this.bankAccount,
            drivingLicense: this.drivingLicense,
            voterId: this.voterId,
           
            documentUrl: this.documentUrl
        })
        .then(result => {
            alert(result);
            this.resetFields();
        })
        .catch(error => {
            console.error(error);
            alert('Error submitting document');
        });
    }

    resetFields(){
        this.aadhaar = '';
        this.pan = '';
        this.passport = '';
        this.addressProof = '';
        this.bankAccount = '';
        this.drivingLicense = '';
        this.voterId = '';
       
        this.documentUrl = '';
    }

    loadEmployeeName() {
        getEmployeeName({ employeeId: this.employeeId })
            .then(result => {
                this.employeeName = result || 'Unknown Employee';
            })
            .catch(error => {
                console.error('Error loading employee name:', error);
                this.employeeName = 'Unknown Employee';
            });
    }
}
