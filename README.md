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
<img width="1875" height="1079" alt="image" src="https://github.com/user-attachments/assets/c6014b21-b313-4f3e-a214-69c8c73b5f38" />


Employee Documents Form--
<img width="1847" height="971" alt="image" src="https://github.com/user-attachments/assets/44fffed6-2a48-44c6-a9d1-27fc308870a9" />

Employee Page
<img width="1910" height="1001" alt="image" src="https://github.com/user-attachments/assets/49d1b1be-f405-48a9-b568-b97e74c2b7e6" />


Onboarding Task Page--
<img width="1892" height="1076" alt="image" src="https://github.com/user-attachments/assets/11c9c012-49c1-43b5-9775-559c70994c38" />


Employee Documents Page --
<img width="1876" height="1028" alt="image" src="https://github.com/user-attachments/assets/f2efb3c6-1d86-46ff-8b32-bcd6aa6af747" />








