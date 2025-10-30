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
