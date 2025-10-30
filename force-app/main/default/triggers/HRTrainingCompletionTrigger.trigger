trigger HRTrainingCompletionTrigger on Onboarding_Task__c (after update) {

    // List to store Employee Ids whose HR Training just got completed
    Set<Id> employeesToProcess = new Set<Id>();

    for (Onboarding_Task__c task : Trigger.new) {
        Onboarding_Task__c oldTask = Trigger.oldMap.get(task.Id);

        // Check if the task is "HR Training" and status changed from not Completed to Completed
        if (task.Name == 'HR Policy Training' && 
            task.Status__c == 'Completed' && 
            oldTask.Status__c != 'Completed' && 
            task.Employee__c != null) {

            employeesToProcess.add(task.Employee__c);
        }
    }

    // For each employee whose HR Training just got completed, call the Queueable
    for (Id empId : employeesToProcess) {
        BulkOnboardingQueueable.assignPostTrainingTasks(empId);
    }
}