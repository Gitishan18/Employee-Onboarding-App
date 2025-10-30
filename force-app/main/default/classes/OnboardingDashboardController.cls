public with sharing class OnboardingDashboardController {

    // 🟢 1. Fetch all employees with onboarding + background info
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getEmployeeOnboardingData() {
        List<Employee__c> employees = [
            SELECT Id, Name, Department__c, Joining_Date__c, Onboarding_Status__c
            FROM Employee__c
            ORDER BY Joining_Date__c ASC
        ];

        Map<Id, String> docMap = new Map<Id, String>();
        for (Employee_Document__c doc : [
            SELECT Employee__c, Status__c
            FROM Employee_Document__c
            WHERE Employee__c IN :employees
        ]) {
            docMap.put(doc.Employee__c, doc.Status__c);
        }

        List<Map<String, Object>> results = new List<Map<String, Object>>();
        for (Employee__c emp : employees) {
            String bgStatus = docMap.containsKey(emp.Id)
                ? docMap.get(emp.Id)
                : 'Pending';

            results.add(new Map<String, Object>{
                'id' => emp.Id,
                'name' => emp.Name,
                'department' => emp.Department__c,
                'joiningDate' => emp.Joining_Date__c,
                'onboardingStatus' => emp.Onboarding_Status__c,
                'backgroundStatus' => bgStatus
            });
        }

        return results;
    }

    // 🟣 2. Onboarding Summary — for summary cards and circular progress
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getOnboardingSummary() {
        Map<String, Object> summary = new Map<String, Object>();

        Integer totalEmployees = [SELECT COUNT() FROM Employee__c];
        Integer pendingBgChecks = [SELECT COUNT() FROM Employee_Document__c WHERE Status__c = 'Pending'];
        Integer completedEmployees = [SELECT COUNT() FROM Employee__c WHERE Onboarding_Status__c = 'Completed'];
        Integer pendingEmployees = [SELECT COUNT() FROM Employee__c WHERE Onboarding_Status__c = 'Pending'];
        Decimal onboardingCompletion = totalEmployees > 0
            ? (Decimal.valueOf(completedEmployees) / totalEmployees) * 100
            : 0;

        summary.put('totalEmployees', totalEmployees);
        summary.put('pendingBgChecks', pendingBgChecks);
        summary.put('completedEmployees', completedEmployees);
        summary.put('pendingEmployees', pendingEmployees);
        summary.put('onboardingCompletion', onboardingCompletion.setScale(0));

        return summary;
    }

    // 🟠 3. Run Background Check API for specific employee

@AuraEnabled
public static String runBackgroundCheckForEmployee(String empName) {
    EmployeeDocumentVerificationService.verifyEmployeePAN(empName);

    // Return latest document status for UI update
    List<Employee_Document__c> docs = [
        SELECT Status__c 
        FROM Employee_Document__c 
        WHERE Employee__r.Name = :empName
        LIMIT 1
    ];

    return (docs.isEmpty()) ? 'Pending' : docs[0].Status__c;
}




    // 🔵 4. Fetch all onboarding tasks for a specific employee
    @AuraEnabled(cacheable=true)
    public static List<Onboarding_Task__c> getEmployeeTasks(Id empId){
        return [
            SELECT Id, Name, Description__c, Due_Date__c, Priority__c, Status__c, 
                   Task_Category__c, Training_Program__c
            FROM Onboarding_Task__c
            WHERE Employee__c = :empId
            ORDER BY Due_Date__c ASC
        ];
    }

    // 🟡 5. Mark single onboarding task as Completed (used by modal component)
    @AuraEnabled
    public static void markTaskAsCompleted(Id taskId) {
        if (taskId == null) {
            throw new AuraHandledException('Task ID is missing.');
        }

        try {
            Onboarding_Task__c taskToUpdate = [
                SELECT Id, Status__c 
                FROM Onboarding_Task__c 
                WHERE Id = :taskId
                LIMIT 1
            ];

            taskToUpdate.Status__c = 'Completed';
            update taskToUpdate;

        } catch (DmlException e) {
            System.debug('⚠️ DML Error in markTaskAsCompleted: ' + e.getMessage());
            throw new AuraHandledException('Error updating task: ' + e.getMessage());
        } catch (Exception e) {
            System.debug('⚠️ General Error in markTaskAsCompleted: ' + e.getMessage());
            throw new AuraHandledException('Error updating task: ' + e.getMessage());
        }
    }
}