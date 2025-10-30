trigger CompleteEmployeeOnboarding on Onboarding_Task__c (after update) {

    // STEP 1: Define key onboarding tasks
    Set<String> keyTasks = new Set<String>{
        'Email Account Creation',
        'Equipment Allocation',
        'Workspace Assignment',
        'Introduction Meeting',
        'Document Verification',
        'HR Policy Training'
    };

    // STEP 2: Employees whose tasks changed
    Set<Id> employeesToCheck = new Set<Id>();
    for (Onboarding_Task__c t : Trigger.new) {
        if (t.Status__c != Trigger.oldMap.get(t.Id).Status__c) {
            employeesToCheck.add(t.Employee__c);
        }
    }

    if (employeesToCheck.isEmpty()) return;

    List<Employee__c> employeesToUpdate = new List<Employee__c>();

    // STEP 3: Check each employee
    for (Id empId : employeesToCheck) {
        // Get all key tasks for this employee
        List<Onboarding_Task__c> tasks = [
            SELECT Name, Status__c
            FROM Onboarding_Task__c
            WHERE Employee__c = :empId
            AND Name IN :keyTasks
        ];

        // Assume onboarding is complete, but verify
        Boolean allCompleted = true;

        // If any key task is missing or not completed, mark allCompleted = false
        Set<String> completedTaskNames = new Set<String>();
        for (Onboarding_Task__c task : tasks) {
            if (task.Status__c == 'Completed') {
                completedTaskNames.add(task.Name);
            }
        }

        // Check if all key tasks are in completedTaskNames
        for (String keyTask : keyTasks) {
            if (!completedTaskNames.contains(keyTask)) {
                allCompleted = false;
                break;
            }
        }

        // If all key tasks are completed, update employee status
        if (allCompleted) {
            employeesToUpdate.add(new Employee__c(
                Id = empId,
                Onboarding_Status__c = 'Completed'
            ));
        }
    }

    if (!employeesToUpdate.isEmpty()) {
        update employeesToUpdate;
    }
}