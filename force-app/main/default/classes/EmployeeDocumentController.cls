public without sharing class EmployeeDocumentController {
    
    @AuraEnabled(cacheable=true)
    public static String getEmployeeName(Id employeeId) {
        try {
            Employee__c emp = [SELECT Name FROM Employee__c WHERE Id = :employeeId LIMIT 1];
            return emp.Name;
        } catch(Exception e) {
            return '';
        }
    }

    @AuraEnabled
    public static String submitDocument(
        Id employeeId,
        String aadhaar,
        String pan,
        String passport,
        String addressProof,
        String bankAccount,
        String drivingLicense,
        String voterId,
      
        String documentUrl
    ) {
        // Check if document already exists
        Integer existingCount = [SELECT COUNT() FROM Employee_Document__c WHERE Employee__c = :employeeId];
        if(existingCount > 0){
            return 'You have already submitted the data.';
        }

        Employee_Document__c doc = new Employee_Document__c();
        doc.Employee__c = employeeId;
        doc.Aadhaar_Number__c = aadhaar;
        doc.PAN_Number__c = pan;
        doc.Passport_Number__c = passport;
        doc.Address_Proof_Number__c = addressProof;
        doc.Bank_Account_Number__c = bankAccount;
        doc.Driving_License_Number__c = drivingLicense;
        doc.Voter_ID_Number__c = voterId;
        doc.Status__c = 'Pending';
       
        doc.Document_Url__c = documentUrl;

        try {
            insert doc;
        } catch (Exception e) {
            return 'Error saving document: ' + e.getMessage();
        }

        return 'Data submitted successfully!';
    }
}