# Employee Onboarding App

## Overview
The **Employee Onboarding App** is a Salesforce-based solution designed to streamline the onboarding process of new employees. It provides automation, verification, and tracking of employee documents and tasks, making onboarding efficient and transparent.

---

## Features

### 1. Data Modeling
- Custom objects:
  - **Employee**
  - **Employee Document**
  - **Onboarding Task**
  -  **Trainning Program**
- Relationships:
  - Employee → Employee Documents
  - Employee → Onboarding Tasks

### 2. Automation
- Salesforce Flows to assign onboarding tasks automatically.
- Update task status based on user actions.
- flow for changing employee bg status
- flow for Creating autoamted Hr policy once documented cerification completed

### 3. Apex Services
- **EmployeeDocumentVerificationService**:  
  - Verifies employee PAN numbers against a mock API.
  - Updates the document status (`Verified` / `Rejected`) and adds notes automatically.
- Bulk-onboaridng task when hr policy task completed
- onboardingDashboardController for featching all important data

### 4. Lightning Web Components (LWC)
- Dashboard to track ongoing onboarding tasks.
- Displays progress and status for each employee.

### 5. Integration
- Calls external APIs (e.g., PAN verification) for employee document validation.

### 6. Reports 
for showing the Onboarding employee by Department
---

## Tech Stack
- **Salesforce Platform**
  - Apex
  - Flows
  - LWC (Lightning Web Components)
  - Custom Objects
- **External APIs**
  - Mock API used for document verification as https://mockapi.io/projects/68fb441894ec960660255dbf
- **Version Control**
  - Git/GitHub

---
Screenshots Of Interfaces::

Employee Dashboards:
<img width="1905" height="977" alt="image" src="https://github.com/user-attachments/assets/e5cf4203-d803-4e08-a40f-f99e23b16e84" />

Employee Documents Form--
<img width="1847" height="971" alt="image" src="https://github.com/user-attachments/assets/44fffed6-2a48-44c6-a9d1-27fc308870a9" />

Employee Page
<img width="1914" height="906" alt="image" src="https://github.com/user-attachments/assets/08797cfd-0fee-4bfc-947b-3f3ae38cb68e" />

Onboarding Task Page--
<img width="1902" height="959" alt="image" src="https://github.com/user-attachments/assets/e1c4f674-dde3-4ca7-989c-6d9d10dc23bb" />

Employee Documents Page --
<img width="1918" height="629" alt="image" src="https://github.com/user-attachments/assets/25cbe626-6bb8-4c4b-9c7b-a12c124e100b" />







