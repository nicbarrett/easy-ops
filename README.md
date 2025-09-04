# EasyOps - Business Requirements Document

Business requirements specification for the EasyOps operations management application.

## Executive Summary

EasyOps is a mobile-first web application designed to manage inventory and production operations for Sweet Swirls facilities. The system tracks ingredients, manages production batches, and coordinates operations across multiple locations including the main shop, mobile trucks, and storage facilities.

The application supports ice cream production as well as complementary items like baked goods and prepared components that may be used as ingredients or sold independently.

> **Technical Implementation**: For technical architecture, setup instructions, and implementation details, see [TECHNICAL.md](TECHNICAL.md)

## Core Features

The application is organized into three main modules:

### 1. Administration Module

Provides core system configuration and user management capabilities.

**User Management**
- User Profile: First Name, Last Name, Email, Password, Phone
- Location Assignments: Users can be assigned to specific locations
- Role Management: Flexible role-based permission system

**Role System**
- Role Definition: Name and associated permissions/scopes
- Granular Permissions: Read (r) and Read/Write (rw) access levels

**Location Management**
- Location Types: Physical facilities, Online systems, Mobile units
- Hierarchical Structure: Support for parent-child location relationships

**Permission Scopes**
- `admin:user:r` / `admin:user:rw` - User management
- `admin:role:r` / `admin:role:rw` - Role management  
- `admin:location:r` / `admin:location:rw` - Location management
- `inventory:item:r` / `inventory:item:rw` - Inventory item management
- `inventory:session:r` / `inventory:session:rw` - Inventory sessions
- `production:batch:r` / `production:batch:rw` - Production batches
- `production:request:r` / `production:request:rw` - Production requests

### 2. Inventory & Operations Module

Manages inventory items, stock levels, and inventory tracking sessions across all locations.

**Inventory Items**
- **Categories**: Base ingredients, Mix-ins, Packaging, Beverages, Baked goods, Prepared items
- **Core Fields**: Name (unique), Category, Unit of measure, Par stock level, Default location
- **Tracking**: SKU (optional), Supplier information, Cost tracking, Restock levels
- **Status**: Active/Inactive flag for item lifecycle management
- **Notes**: Additional item-specific information

**Inventory Sessions ("Take Inventory")**
- **Session Management**: Location-specific inventory counts with start/end times
- **Line Items**: Item ID, actual count, unit, optional notes, photo upload capability
- **Workflow**: Draft → Submit → Closed (immutable after closure)
- **Analytics**: Auto-calculate variance vs. previous session and par levels

**Current Stock View**
- **Real-time Status**: Aggregated view of current on-hand quantities per location
- **Alert System**: Below par and critical stock level indicators
- **Quick Actions**: Create production requests directly from low stock items

### 3. Production Module

Extends inventory functionality to manage production workflows and batch tracking for all produced items.

**Production Items (Outputs)**
- **Product Definition**: Items that are produced (ice cream, baked goods, prepared components, etc.)
- **Recipe Management**: Input ingredients and quantities required for production
- **Cost Calculation**: Production cost based on ingredient costs and quantities
- **Stock Levels**: Par and restock levels for finished products

**Production Requests**
- **Request Details**: Product, target quantity, priority level, needed-by date
- **Workflow**: Open → In-Progress → Completed → Archived
- **Assignment**: Requested by user, assigned location, reason for request
- **Tracking**: Link to originating inventory shortages when applicable

**Production Batches**
- **Batch Recording**: Quantity made, lot codes, production times, storage location
- **Lifecycle Management**: Production → Active → Run Out / Waste
- **Waste Tracking**: Waste reasons (spoilage, temperature, QA failure, accident) with quantities
- **Stock Impact**: Automatic stock adjustments based on batch events

## User Roles & Personas

### Owner/Admin
- **Permissions**: All rights across all locations
- **Responsibilities**: Strategic oversight, system configuration, user management
- **Access Level**: Complete system access for business decision making

The Owner needs visibility into all aspects of operations across all locations to make informed business decisions and may step into any operational role as needed.

### General Manager  
- **Permissions**: All rights for assigned location(s)
- **Responsibilities**: Day-to-day location management, staff coordination, operational planning
- **Access Level**: Full control over assigned location operations

The General Manager oversees all aspects of their location's operations, manages staff, creates production and inventory requests, and ensures smooth daily operations.

### Shift Lead
- **Permissions**: Read access to all location data, write access to inventory sessions and production tasks
- **Responsibilities**: Real-time operational management, inventory tracking, task completion
- **Access Level**: Operational control during assigned shifts

The Shift Lead manages moment-to-moment operations, completes inventory sessions, fulfills production requests, and handles basic troubleshooting during their shifts.

### Crew Member (Team Member)
- **Permissions**: Read access to tasks and production status for assigned locations
- **Responsibilities**: Task completion, basic inventory counts, production assistance
- **Access Level**: Task-focused access for shift duties

The Crew Member focuses on completing assigned tasks, contributing to inventory counts, and supporting production operations during their shifts.

## EasyOps - User Stories with Acceptance Criteria and Traceability Matrix

### Administration & Setup

* **User Story:** As an **Owner/Admin**, I want to be able to define new roles so that I can give the right people access to the right parts of the system.
  **Acceptance Criteria:**

    * Given I am logged in as an Owner/Admin, when I navigate to role management, I can create a new role with a name and set permissions.
    * The new role is saved and available for assignment to users.
      **Test Cases:**
    * Verify new role creation with valid fields.
    * Verify permissions are correctly applied when role is assigned.

* **User Story:** As an **Owner/Admin**, I want to create new locations so that I can manage operations across all facilities.
  **Acceptance Criteria:**

    * I can add a new location with required fields (name, type, parent location).
    * The new location appears in the system hierarchy and is selectable for inventory and production.
      **Test Cases:**
    * Verify creation of location with all fields.
    * Verify location hierarchy is displayed correctly.

* **User Story:** As a **General Manager**, I want to be able to invite new Crew Members to EasyOps so they can access the app and complete their duties.
  **Acceptance Criteria:**

    * I can enter an email address and role for the new user.
    * The system sends an invite email with login credentials.
    * The user appears as pending until first login.
      **Test Cases:**
    * Verify invite email is sent with correct details.
    * Verify pending status is updated after first login.

* **User Story:** As an **Owner/Admin**, I want to deactivate users who leave the company so that access is always secure.
  **Acceptance Criteria:**

    * I can deactivate a user account.
    * The user cannot log in after deactivation.
    * Deactivated users remain in history/audit logs.
      **Test Cases:**
    * Verify deactivated users cannot log in.
    * Verify audit log records deactivation.

* **User Story:** As an **Owner/Admin**, I want to clone an existing role so that I can quickly create a new role with similar permissions.
  **Acceptance Criteria:**

    * I can choose an existing role and select “Clone.”
    * A new role form is pre-populated with the same permissions.
      **Test Cases:**
    * Verify cloned role inherits original permissions.
    * Verify cloned role can be modified before saving.

* **User Story:** As a **General Manager**, I want to assign users to multiple locations so that staff who float between facilities can still access the right data.
  **Acceptance Criteria:**

    * I can select multiple locations for a user profile.
    * User access matches all assigned locations.
      **Test Cases:**
    * Verify user access at all assigned locations.
    * Verify restrictions for locations not assigned.

* **User Story:** As an **Owner/Admin**, I want to view an audit log of role/permission changes so that I can track who changed access rights and when.
  **Acceptance Criteria:**

    * Audit log lists date/time, user, change, and affected role.
    * Logs are read-only and filterable by date and user.
      **Test Cases:**
    * Verify audit log entries for role updates.
    * Verify filtering options work as expected.

---

### Inventory Management

* **User Story:** As a **General Manager**, I want to be able to create inventory sessions so that inventory can be tracked and updated.
  **Acceptance Criteria:**

    * I can start a new inventory session for a location.
    * Items are listed with par levels.
    * Session is saved as draft until submission.
      **Test Cases:**
    * Verify session creation with item list.
    * Verify draft and submission states.

* **User Story:** As a **Shift Lead**, I want to be able to view and complete open inventory sessions so that stock levels remain accurate.
  **Acceptance Criteria:**

    * Open sessions show required items.
    * I can enter counts and submit the session.
    * System updates current stock after submission.
      **Test Cases:**
    * Verify submission updates stock.
    * Verify sessions are closed after submission.

* **User Story:** As a **Shift Lead**, I want to attach photos of inventory items during a session so that I can document discrepancies or damaged goods.
  **Acceptance Criteria:**

    * I can upload one or more images per line item.
    * Photos are stored and viewable in session history.
      **Test Cases:**
    * Verify photo upload is possible.
    * Verify uploaded photo is retrievable in history.

* **User Story:** As a **General Manager**, I want to receive alerts when critical items drop below par levels so that I can create production requests or reorders proactively.
  **Acceptance Criteria:**

    * The system highlights items below par.
    * Alerts are sent via dashboard and email.
      **Test Cases:**
    * Verify alert triggers when stock < par.
    * Verify alert email is delivered.

* **User Story:** As a **Crew Member**, I want to scan a barcode during inventory so that I can quickly identify the right item without scrolling.
  **Acceptance Criteria:**

    * Barcode scan pulls up the correct item entry.
    * User can enter counts directly after scan.
      **Test Cases:**
    * Verify barcode scanning identifies item.
    * Verify entry updates correct item count.

* **User Story:** As a **General Manager**, I want to view a historical trend of inventory sessions so that I can identify seasonal usage patterns.
  **Acceptance Criteria:**

    * Reports display inventory variance over time.
    * I can filter by item, location, and date range.
      **Test Cases:**
    * Verify variance report generation.
    * Verify filters adjust report data.

* **User Story:** As a **Shift Lead**, I want to edit a draft inventory session before submission so that mistakes can be corrected.
  **Acceptance Criteria:**

    * Draft sessions can be reopened.
    * Edited counts overwrite previous draft values.
    * Once submitted, sessions cannot be edited.
      **Test Cases:**
    * Verify editing draft works.
    * Verify submission locks session.

---

### Production Operations

* **User Story:** As a **General Manager**, I want to be able to request production of items so that products can be made when needed.
  **Acceptance Criteria:**

    * I can create a production request with product, quantity, and due date.
    * Request status starts as “Open.”
      **Test Cases:**
    * Verify request creation.
    * Verify request appears as open.

* **User Story:** As a **Shift Lead**, I want to be able to view open production requests so that I can prioritize and complete production tasks.
  **Acceptance Criteria:**

    * I see all open requests assigned to my location.
    * I can update status to “In Progress” or “Completed.”
      **Test Cases:**
    * Verify open requests are visible.
    * Verify status updates correctly.

* **User Story:** As a **General Manager**, I want to link production requests directly to low-stock alerts so that I don’t miss critical restocks.
  **Acceptance Criteria:**

    * When an item falls below par, I can create a linked production request from the alert.
    * The request shows its source alert.
      **Test Cases:**
    * Verify link creation from alert.
    * Verify source alert reference is visible.

* **User Story:** As a **Shift Lead**, I want to record batch run-outs in real time so that the system reflects true availability.
  **Acceptance Criteria:**

    * I can select a batch and mark it as “Run Out.”
    * System adjusts stock accordingly.
      **Test Cases:**
    * Verify marking batch run-out adjusts stock.
    * Verify status reflects run-out.

* **User Story:** As a **Shift Lead**, I want to log waste events with a reason so that management can track causes of loss.
  **Acceptance Criteria:**

    * I can mark a batch as “Waste” and select a reason.
    * Waste quantity deducts from stock and logs in reports.
      **Test Cases:**
    * Verify waste deduction from stock.
    * Verify waste reason is recorded in report.

* **User Story:** As a **Crew Member**, I want to see which tasks are part of an active production batch so that I know exactly what needs to be done.
  **Acceptance Criteria:**

    * Assigned tasks display under the batch.
    * Status updates are reflected in real time.
      **Test Cases:**
    * Verify task visibility in batch.
    * Verify task completion updates in real time.

* **User Story:** As a **General Manager**, I want to generate a cost breakdown report for a production batch so that I understand ingredient costs per product.
  **Acceptance Criteria:**

    * Report shows ingredients, quantities, unit cost, and total cost.
    * Exportable to PDF/CSV.
      **Test Cases:**
    * Verify cost report generation.
    * Verify export formats are correct.

---

### Reporting & Analytics

* **User Story:** As an **Owner/Admin**, I want to see dashboards across all locations so that I can spot trends in production and inventory.
  **Acceptance Criteria:**

    * Dashboard aggregates key metrics from all locations.
    * I can filter by date range and location.
      **Test Cases:**
    * Verify dashboard data aggregation.
    * Verify filters change displayed data.

* **User Story:** As a **General Manager**, I want to export inventory variance reports so that I can review them offline or in meetings.
  **Acceptance Criteria:**

    * Report can be exported to Excel/PDF.
    * Export includes all filters applied.
      **Test Cases:**
    * Verify export function produces correct file.
    * Verify exported data matches filtered report.

* **User Story:** As an **Owner/Admin**, I want to compare production output vs. requests so that I can see where demand is being under- or over-fulfilled.
  **Acceptance Criteria:**

    * Report shows requested vs. produced quantities per product.
    * Variances are highlighted.
      **Test Cases:**
    * Verify comparison report generation.
    * Verify variance highlighting.

---

### Operational Efficiency

* **User Story:** As a **Shift Lead**, I want to quickly reassign a production task if a crew member is unavailable so that workflow isn’t interrupted.
  **Acceptance Criteria:**

    * I can select a task and reassign it to another crew member.
    * The reassigned crew member sees the task instantly.
      **Test Cases:**
    * Verify reassignment updates assigned user.
    * Verify new user sees task.

* **User Story:** As a **Crew Member**, I want to mark tasks as complete via mobile so that updates happen in real time.
  **Acceptance Criteria:**

    * I can check off a task from my mobile device.
    * System updates the batch/task status instantly.
      **Test Cases:**
    * Verify task completion via mobile.
    * Verify batch status updates instantly.

* **User Story:** As a **General Manager**, I want to prioritize production requests by urgency so that critical items are produced first.
  **Acceptance Criteria:**

    * I can assign a priority level to requests (low, medium, high).
    * Requests can be sorted by priority in the UI.
      **Test Cases:**
    * Verify priority levels can be assigned.
    * Verify request sorting by priority works.

---

## Traceability Matrix (User Stories → Acceptance Criteria → Test Cases)

**Legend**

* **ID format:** `US-<AREA>-###` for user stories, `AC-<AREA>-###` for acceptance criteria, `TC-<AREA>-###` for test cases.
* **Areas:** ADM = Administration, INV = Inventory, PRO = Production, RPT = Reporting, OPS = Operational Efficiency.

### Matrix Overview

| User Story ID | User Story (summary)                 | Acceptance Criteria IDs | E2E Test Case IDs      | Data / Setup        | Notes                         |
| ------------- | ------------------------------------ | ----------------------- | ---------------------- | ------------------- | ----------------------------- |
| US-ADM-001    | Define new roles                     | AC-ADM-001a/b           | TC-ADM-001, TC-ADM-002 | Admin user exists   | Covers create + visibility    |
| US-ADM-002    | Create new locations                 | AC-ADM-002a/b           | TC-ADM-003             | None                | Hierarchy + selectable        |
| US-ADM-003    | Invite crew members                  | AC-ADM-003a/b/c         | TC-ADM-004             | SMTP/mock email     | Pending → first login         |
| US-ADM-004    | Deactivate users                     | AC-ADM-004a/b/c         | TC-ADM-005             | User to deactivate  | Login blocked; audit retained |
| US-ADM-005    | Clone an existing role               | AC-ADM-005a/b           | TC-ADM-006             | Source role exists  | Name uniqueness edge case     |
| US-ADM-006    | Assign users to multiple locations   | AC-ADM-006a/b           | TC-ADM-007             | Multi-location org  | Access scoping checks         |
| US-ADM-007    | View audit log of permission changes | AC-ADM-007a/b           | TC-ADM-008             | Seed changes        | Filters: date, user           |
| US-INV-001    | Create inventory session             | AC-INV-001a/b/c         | TC-INV-001             | Items + pars exist  | Draft state                   |
| US-INV-002    | Complete open inventory session      | AC-INV-002a/b/c         | TC-INV-002, TC-INV-003 | Open session exists | Stock update                  |
| US-INV-003    | Attach photos on line items          | AC-INV-003a/b           | TC-INV-004             | Image storage       | File size/type edge           |
| US-INV-004    | Alerts below par                     | AC-INV-004a/b           | TC-INV-005             | Par thresholds set  | Email + dashboard             |
| US-INV-005    | Barcode/SKU scan                     | AC-INV-005a/b           | TC-INV-006             | Sample barcodes     | Mobile camera path            |
| US-INV-006    | Historical trends                    | AC-INV-006a/b           | TC-INV-007             | Sessions history    | Filters, export hook          |
| US-INV-007    | Edit draft session                   | AC-INV-007a/b/c         | TC-INV-008, TC-INV-009 | Draft exists        | Immutable after submit        |
| US-PRO-001    | Request production                   | AC-PRO-001a/b           | TC-PRO-001             | Products exist      | Open status                   |
| US-PRO-002    | View open production requests        | AC-PRO-002a/b           | TC-PRO-002             | Requests seeded     | Status transitions            |
| US-PRO-003    | Link requests from low-stock alert   | AC-PRO-003a/b           | TC-PRO-003             | Item below par      | Backlink to alert             |
| US-PRO-004    | Record batch run-outs                | AC-PRO-004a/b           | TC-PRO-004             | Active batch        | Stock deduction               |
| US-PRO-005    | Log waste events with reason         | AC-PRO-005a/b           | TC-PRO-005             | Batch + reasons     | Reporting impact              |
| US-PRO-006    | Crew sees tasks in batch             | AC-PRO-006a/b           | TC-PRO-006             | Assigned tasks      | Real-time updates             |
| US-PRO-007    | Batch cost breakdown report          | AC-PRO-007a/b           | TC-PRO-007             | Ingredient costs    | CSV/PDF export                |
| US-RPT-001    | Multi-location dashboards            | AC-RPT-001a/b           | TC-RPT-001             | Multi locations     | Filters                       |
| US-RPT-002    | Export variance reports              | AC-RPT-002a/b           | TC-RPT-002             | Sessions exist      | Export fidelity               |
| US-RPT-003    | Compare output vs requests           | AC-RPT-003a/b           | TC-RPT-003             | Requests + batches  | Variance highlight            |
| US-OPS-001    | Reassign production task             | AC-OPS-001a/b           | TC-OPS-001             | Crew users          | New assignee notified         |
| US-OPS-002    | Mark tasks complete via mobile       | AC-OPS-002a/b           | TC-OPS-002             | Mobile viewport     | Sync state                    |
| US-OPS-003    | Prioritize requests by urgency       | AC-OPS-003a/b           | TC-OPS-003             | Mixed priorities    | Sort order persists           |

> All user stories and ACs correspond 1:1 with the prior sections in this document.

---

### Acceptance Criteria IDs

* **AC-ADM-001a/b** → From *Define new roles*: (a) create role with name & permissions; (b) role available for assignment.
* **AC-ADM-002a/b** → From *Create new locations*: (a) add location with name/type/parent; (b) appears in hierarchy & selectable.
* **AC-ADM-003a/b/c** → From *Invite crew members*: (a) enter email & role; (b) invite email sent; (c) pending until first login.
* **AC-ADM-004a/b/c** → From *Deactivate users*: (a) deactivate; (b) login blocked; (c) audit retained.
* **AC-ADM-005a/b** → From *Clone role*: (a) choose role and clone; (b) pre-populated permissions.
* **AC-ADM-006a/b** → From *Assign user to multiple locations*: (a) select multiple locations; (b) access matches.
* **AC-ADM-007a/b** → From *Audit log*: (a) change metadata; (b) read-only & filterable.
* **AC-INV-001a/b/c** → From *Create inventory session*: (a) start session; (b) items listed with par; (c) draft until submit.
* **AC-INV-002a/b/c** → From *Complete session*: (a) open sessions visible; (b) enter counts & submit; (c) stock updates.
* **AC-INV-003a/b** → From *Attach photos*: (a) upload images per line; (b) images in history.
* **AC-INV-004a/b** → From *Alerts below par*: (a) below-par highlight; (b) dashboard + email.
* **AC-INV-005a/b** → From *Barcode scan*: (a) match to correct item; (b) enter counts post-scan.
* **AC-INV-006a/b** → From *Trends*: (a) variance over time; (b) filter by item/location/date.
* **AC-INV-007a/b/c** → From *Edit draft*: (a) reopen draft; (b) edits overwrite; (c) immutable after submit.
* **AC-PRO-001a/b** → From *Request production*: (a) create request; (b) status Open.
* **AC-PRO-002a/b** → From *View open requests*: (a) see open requests; (b) update status.
* **AC-PRO-003a/b** → From *Link from alert*: (a) create request from alert; (b) request shows source alert.
* **AC-PRO-004a/b** → From *Run-out*: (a) mark run-out; (b) stock adjusts.
* **AC-PRO-005a/b** → From *Waste logging*: (a) mark waste + reason; (b) deduct & report.
* **AC-PRO-006a/b** → From *Crew tasks in batch*: (a) tasks listed; (b) real-time status.
* **AC-PRO-007a/b** → From *Cost report*: (a) ingredients/qty/unit & total cost; (b) export.
* **AC-RPT-001a/b** → From *Dashboards*: (a) aggregate metrics; (b) filters.
* **AC-RPT-002a/b** → From *Variance export*: (a) export Excel/PDF; (b) respects filters.
* **AC-RPT-003a/b** → From *Output vs requests*: (a) compare quantities; (b) highlight variance.
* **AC-OPS-001a/b** → From *Reassign task*: (a) select & reassign; (b) assignee updated/notified.
* **AC-OPS-002a/b** → From *Mobile complete*: (a) check off on mobile; (b) instant status update.
* **AC-OPS-003a/b** → From *Prioritize*: (a) set priority; (b) sort/persist.

---

### Test Case Catalog (Playwright E2E + API/DB setup)

> Each TC assumes: FE at `/`, BE at `/api`, seeded users/roles, and uses IDs/data-testid. Where needed, direct API calls seed/test data.

**Administration**

* **TC-ADM-001** Create role with permissions
  *Covers:* AC-ADM-001a/b
  *Steps:* Login as Owner → Admin → Roles → New → set name + scopes (e.g., `inventory:item:rw`) → Save.
  *Assert:* Success toast; role appears in list; role assignable to user.

* **TC-ADM-002** Assign role to user
  *Covers:* AC-ADM-001b
  *Steps:* Users → select user → Roles → add created role → Save.
  *Assert:* Role listed on user; permissions effective on next login.

* **TC-ADM-003** Create new location
  *Covers:* AC-ADM-002a/b
  *Steps:* Locations → New → name/type/parent → Save.
  *Assert:* Appears in tree; selectable in inventory/production forms.

* **TC-ADM-004** Invite crew member
  *Covers:* AC-ADM-003a/b/c
  *Setup:* Mail catcher/WireMock SMTP.
  *Steps:* Users → Invite → email+role → Send.
  *Assert:* Invite email captured; user listed as Pending; first login flips to Active.

* **TC-ADM-005** Deactivate user
  *Covers:* AC-ADM-004a/b/c
  *Steps:* Users → select user → Deactivate. Then attempt login.
  *Assert:* Login blocked; user appears with inactive badge; audit shows action.

* **TC-ADM-006** Clone role
  *Covers:* AC-ADM-005a/b
  *Steps:* Roles → pick role → Clone → rename → Save.
  *Assert:* Permissions copied; both roles distinct.

* **TC-ADM-007** Assign user to multiple locations
  *Covers:* AC-ADM-006a/b
  *Assert:* User can access data for all assigned locations; cannot access unassigned ones.

* **TC-ADM-008** Audit log filters
  *Covers:* AC-ADM-007a/b
  *Steps:* Make a role change → Audit → filter by user/date.
  *Assert:* Correct entries visible; read-only.

**Inventory**

* **TC-INV-001** Start draft inventory session
  *Covers:* AC-INV-001a/b/c
  *Assert:* Draft saved; items show par.

* **TC-INV-002** Complete inventory session (happy path)
  *Covers:* AC-INV-002a/b/c
  *Assert:* Submitted; stock updated; session state Closed.

* **TC-INV-3** Validation & edit before submit
  *Covers:* AC-INV-007a/b/c
  *Assert:* Edits persist in draft; post-submit locked.

* **TC-INV-004** Attach photos to line items
  *Covers:* AC-INV-003a/b
  *Assert:* Previews visible; photo persists in history.

* **TC-INV-005** Below-par alert surfaces + email
  *Covers:* AC-INV-004a/b
  *Setup:* Item with low count.
  *Assert:* Dashboard badge; email captured.

* **TC-INV-006** Barcode scan to locate item
  *Covers:* AC-INV-005a/b
  *Setup:* SKU/barcode mapping.
  *Assert:* Item auto-focused; counts editable.

* **TC-INV-007** Historical trends filter
  *Covers:* AC-INV-006a/b
  *Assert:* Chart/table reflects filters.

* **TC-INV-008** Immutable after submit guard
  *Covers:* AC-INV-007c
  *Assert:* Edit controls disabled; banner explains lock.

**Production**

* **TC-PRO-001** Create production request
  *Covers:* AC-PRO-001a/b
  *Assert:* Request appears Open with due date.

* **TC-PRO-002** Work & complete a request
  *Covers:* AC-PRO-002a/b
  *Assert:* Status progresses to In Progress → Completed.

* **TC-PRO-003** Create request from low-stock alert
  *Covers:* AC-PRO-003a/b
  *Assert:* Request links back to alert.

* **TC-PRO-004** Mark batch Run Out
  *Covers:* AC-PRO-004a/b
  *Assert:* Stock deduction reflected in Current Stock.

* **TC-PRO-005** Log batch waste with reason
  *Covers:* AC-PRO-005a/b
  *Assert:* Waste appears in report; quantity deducted.

* **TC-PRO-006** Crew task visibility & live updates
  *Covers:* AC-PRO-006a/b
  *Assert:* Task list under batch; status changes propagate.

* **TC-PRO-007** Batch cost breakdown export
  *Covers:* AC-PRO-007a/b
  *Assert:* Totals correct; CSV/PDF downloads.

**Reporting**

* **TC-RPT-001** Multi-location dashboard filters
  *Covers:* AC-RPT-001a/b
  *Assert:* Aggregates; filter by location/date.

* **TC-RPT-002** Export variance report
  *Covers:* AC-RPT-002a/b
  *Assert:* File generated; respects filters.

* **TC-RPT-003** Output vs. requests variance highlight
  *Covers:* AC-RPT-003a/b
  *Assert:* Variances flagged.

**Operational Efficiency**

* **TC-OPS-001** Reassign production task
  *Covers:* AC-OPS-001a/b
  *Assert:* New assignee notified; ownership changes.

* **TC-OPS-002** Complete task via mobile
  *Covers:* AC-OPS-002a/b
  *Assert:* Status syncs instantly.

* **TC-OPS-003** Priority sorting persists
  *Covers:* AC-OPS-003a/b
  *Assert:* Sorted by priority; persists after reload.

---

### Ready-for-QA Checklist

* All user stories mapped to ≥1 AC and ≥1 TC.
* Seed data scripts/utilities ready (users, roles, locations, items, pars, products, batches).
* Playwright test IDs (`data-testid`) present on key interactive elements.
* Email/notification testing supported via mock (e.g., MailHog) or provider sandbox.
* Reports verify both UI rendering and exported file contents.
* Authorization checks validated for role/location scope on all critical flows.
