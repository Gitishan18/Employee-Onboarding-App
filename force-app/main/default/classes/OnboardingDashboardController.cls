public with sharing class OnboardingDashboardController {
    @AuraEnabled(cacheable=true)
    public static List<Onboarding_Task__c> getEmployeeOnboardingData() {
        // Query tasks with all necessary related data
        return [
            SELECT 
                Id, 
                Name,
                Status__c,
                Priority__c,
                Due_Date__c,
                Task_Category__c,
                Description__c,
                Employee__r.Name,
                Employee__r.Department__c,
                Employee__r.Email__c,
                Employee__r.Joining_Date__c,
                Employee__r.Manager__r.Name,
                Training_Program__r.Name,
                Training_Program__r.Meeting_Link__c
            FROM Onboarding_Task__c
            ORDER BY Due_Date__c ASC NULLS LAST
        ];
    }

    @AuraEnabled
    public static void updateTaskStatus(Id taskId, String status) {
        // Validate the status value
        Set<String> validStatuses = new Set<String>{'Not Started', 'In Progress', 'Completed'};
        if (!validStatuses.contains(status)) {
            throw new AuraHandledException('Invalid status value');
        }

        try {
            Onboarding_Task__c task = new Onboarding_Task__c(
                Id = taskId,
                Status__c = status
            );
            update task;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating task status: ' + e.getMessage());
        }
    }
}
