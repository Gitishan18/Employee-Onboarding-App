public class BulkOnboardingQueueable implements Queueable {

    public void execute(QueueableContext context) {
        // Fetch employees whose background verification is 'In Progress'
        List<Employee__c> employeesInProgress = [
            SELECT Id, Name 
            FROM Employee__c 
            WHERE Onboarding_Status__c = 'In Progress'AND
             Background_Check_Status__c = 'Cleared'
        ];

        if (employeesInProgress.isEmpty()) return;

        List<Onboarding_Task__c> tasksToInsert = new List<Onboarding_Task__c>();
        List<String> taskNames = new List<String>{
            'Email Account Creation',
            'Equipment Allocation',
            'Workspace Assignment',
            'Introduction Meeting'
        };

        // Query existing tasks for these employees
        Map<Id, Set<String>> existingTasksMap = new Map<Id, Set<String>>();
        for (Onboarding_Task__c t : [
            SELECT Id, Name, Employee__c 
            FROM Onboarding_Task__c 
            WHERE Employee__c IN :employeesInProgress
        ]) {
            if (!existingTasksMap.containsKey(t.Employee__c)) {
                existingTasksMap.put(t.Employee__c, new Set<String>());
            }
            existingTasksMap.get(t.Employee__c).add(t.Name);
        }

        // Loop through employees and create tasks if they don't already exist
        for (Employee__c emp : employeesInProgress) {
            Set<String> existingTasks = existingTasksMap.containsKey(emp.Id) ? existingTasksMap.get(emp.Id) : new Set<String>();
            for (String taskName : taskNames) {
                if (!existingTasks.contains(taskName)) {
                    tasksToInsert.add(new Onboarding_Task__c(
                        Name = taskName,
                        Employee__c = emp.Id,
                        Status__c = 'In Progress'
                    ));
                }
            }
        }

        if (!tasksToInsert.isEmpty()) {
            insert tasksToInsert;
            System.debug('Inserted ' + tasksToInsert.size() + ' new onboarding tasks.');
        } else {
            System.debug('No new tasks to insert. All tasks already exist.');
        }
    }
}