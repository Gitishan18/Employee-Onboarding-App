public class EmployeeDocumentVerificationService {

    // Your MockAPI endpoint
    private static final String MOCK_API_URL = 'https://68fb441894ec960660255dbe.mockapi.io/api/v1/pan';

    public static void verifyEmployeePANsViaAPI() {

        // 1. Call the MockAPI endpoint
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

        // 2. Parse JSON into map of name -> PAN
        List<Object> mockList = (List<Object>) JSON.deserializeUntyped(res.getBody());
        Map<String,String> mockMap = new Map<String,String>();
        for(Object o : mockList) {
            Map<String,Object> m = (Map<String,Object>) o;
            String name = (String) m.get('name');
            String pan  = (String) m.get('pan');
            if(name != null && pan != null) {
                mockMap.put(name, pan);
            }
        }

        // 3. Query Employee Documents with Pending status and Employee lookup
        List<Employee_Document__c> docs = [
            SELECT Id, PAN_Number__c, Status__c, Notes__c, Employee__r.Name
            FROM Employee_Document__c
            WHERE Status__c = 'Pending'
        ];

        // 4. Compare and update each record
        for(Employee_Document__c doc : docs) {
            String empName = doc.Employee__r != null ? doc.Employee__r.Name : null;
            String expectedPAN = empName != null ? mockMap.get(empName) : null;

            if(expectedPAN != null && expectedPAN == doc.PAN_Number__c) {
                doc.Status__c = 'Verified';
                doc.Notes__c = (doc.Notes__c != null ? doc.Notes__c + '\n' : '') +
                    'PAN and name matched. Verified via API.';
            } else {
                doc.Status__c = 'Rejected';
                doc.Notes__c = (doc.Notes__c != null ? doc.Notes__c + '\n' : '') +
                    'PAN and name mismatch. Rejected via API.';
            }
        }

        // 5. Bulk update
        if(!docs.isEmpty()) {
            update docs;
            System.debug(docs.size() + ' Employee Document records processed.');
        }
    }
}