public with sharing class EmployeeDocumentVerificationService {

    private static final String MOCK_API_URL = 'https://68fb441894ec960660255dbe.mockapi.io/api/v1/pan';

    /**
     * Verifies PAN for a single employee
     */
    public static void verifyEmployeePAN(String empName) {
        if(String.isBlank(empName)) return;

        // 1. Call Mock API
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(MOCK_API_URL);
        req.setMethod('GET');
        req.setTimeout(60000);

        HttpResponse res;
        try {
            res = http.send(req);
        } catch(Exception e) {
            System.debug('Callout failed: ' + e.getMessage());
            return;
        }

        if(res.getStatusCode() != 200) {
            System.debug('Mock API returned status: ' + res.getStatusCode());
            return;
        }

        // 2. Parse API response
        List<Object> mockList = (List<Object>) JSON.deserializeUntyped(res.getBody());
        String expectedPAN;
        for(Object o : mockList) {
            Map<String,Object> m = (Map<String,Object>) o;
            if(empName == (String)m.get('name')) {
                expectedPAN = (String)m.get('pan');
                break;
            }
        }

        if(expectedPAN == null) {
            System.debug('No PAN found for employee: ' + empName);
            return;
        }

        // 3. Query only documents for this employee with Pending status
        List<Employee_Document__c> docs = [
            SELECT Id, PAN_Number__c, Status__c, Notes__c, Employee__r.Name
            FROM Employee_Document__c
          WHERE Status__c IN ('Pending', 'Rejected') AND Employee__r.Name = :empName

        ];

        // 4. Compare PAN and update
        for(Employee_Document__c doc : docs) {
            if(expectedPAN == doc.PAN_Number__c) {
                doc.Status__c = 'Verified';
                doc.Notes__c = (doc.Notes__c != null ? doc.Notes__c + '\n' : '') +
                                'PAN matched. Verified via API.';
            } else {
                doc.Status__c = 'Rejected';
                doc.Notes__c = (doc.Notes__c != null ? doc.Notes__c + '\n' : '') +
                                'PAN mismatch. Rejected via API.';
            }
        }

        if(!docs.isEmpty()) update docs;
        System.debug(docs.size() + ' Employee Document records processed for ' + empName);
    }
}