# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack web application for an ice cream production facility called "Sweet Swirls Operations App". The system consists of a Spring Boot 3.4.4 REST API backend and a React TypeScript frontend, managing inventory items and production batches for ice cream operations.

### Architecture
- **Backend**: Spring Boot 3.4.4 REST API (Java 21, Spring Data JPA, PostgreSQL/H2)
- **Frontend**: React 19 + TypeScript with mobile-first design
- **Authentication**: JWT-based with role-based access control
- **Styling**: CSS Modules with comprehensive design system

## Build and Development Commands

- **Build the project**: `./gradlew build`
- **Run the application**: `./gradlew bootRun` 
- **Run tests**: `./gradlew test`
- **Clean build**: `./gradlew clean build`

The application runs on the default Spring Boot port (8080).

## Architecture

The application follows a standard Spring Boot layered architecture with two main domain modules:

### Inventory Module (`com.iowaicecreamconcepts.api.inventory`)
- **Model**: `InventoryItem` - JPA entity for inventory items with stock levels, location, and supplier info
- **Controller**: REST endpoints at `/api/inventory` for CRUD operations
- **Service**: Business logic for inventory management
- **Repository**: JPA repository extending default Spring Data methods
- **DTO**: `InventoryItemRequest` for API requests

### Production Module (`com.iowaicecreamconcepts.api.production`)
- **Model**: `ProductionBatch` - JPA entity tracking ice cream batch lifecycle (REQUESTED → PRODUCED → DEPLETED/DISCARDED)
- **Controller**: REST endpoints at `/api/production` for batch management
- **Service**: Business logic for production workflows
- **Repository**: JPA repository for production data
- **DTO**: Request objects for batch operations

## Key Technologies

- **Framework**: Spring Boot 3.4.4 with Spring Data JPA, Validation, and Web
- **Database**: PostgreSQL (production), H2 (development/testing)
- **Java**: Version 21 with Lombok for boilerplate reduction
- **Testing**: JUnit 5 with Spring Boot Test and Mockito
- **Build**: Gradle with wrapper

## Database Configuration

The application uses profile-based configuration:
- Default: Basic Spring application settings
- Local: Development profile configuration
- Test: Testing environment settings

Both inventory items and production batches use auto-generated IDs and timestamp tracking.

## Requirements

# Sweet Swirls Operations App — Software Requirements Specification (SRS)

*Last updated: Aug 21, 2025*

## 0) Executive Summary

Sweet Swirls needs a lightweight, mobile‑friendly web app to manage inventory and production for scooped and rolled ice cream, 
plus workflow for the store and truck. Additional modules may be needed in the future and the application should be built with this in mind. 
This document defines clear, testable requirements your dev team can pick up now.

---

## 1) Goals & Non‑Goals

**Goals**

* Track inventory accurately across shop and mobile units with history and par levels.
* Plan and record production batches end‑to‑end (request → made → consumed/waste).
* Provide at‑a‑glance dashboards for shift leads (today’s priorities, low stock, open production requests).
* Fit existing stack: **React frontend**, **Java Spring Boot** API, **PostgreSQL**.

**Non‑Goals (Phase 1)**

* Full accounting, payroll, or HR features.
* Support truck bookings operationally (simple calendar & prep list).
* Complex recipe costing or vendor management.
* Deep POS replacement; we will integrate with POS for sales data when available.

---

## 2) Users & Roles (RBAC)

* **Owner/Admin**: all permissions, settings, user management.
* **Production Lead**: create/approve production requests, record batches, manage recipes.
* **Shift Lead**: take inventory, view/resolve low‑stock alerts, close production tasks.
* **Team Member (Scooper)**: view tasks, log counts on assigned items.

**Permissions Matrix (summary)**

* Inventory Items: Admin R/W/D; Lead R/W; Member R.
* Inventory Sessions: Admin/Lead create/close; Member contribute line counts.
* Production Batches: Admin/Prod Lead R/W; Shift Lead R/W; Member R.

---

## 3) Scope & Features

### 3.1 Inventory Management

**3.1.1 Item Library (CRUD)**

* Fields: `id`, `name` (unique per org), `category` (base, mix‑in, packaging, beverage), `unit` (e.g., lbs, pints, tubs), `parStockLevel` (int/decimal), `location` (shop, truck1, truck2, freezerA…), `isActive` (bool), `sku` (optional), `notes`.
* Validation: name required; unit required; par >= 0.
* Bulk import/export CSV.

**3.1.2 Inventory Sessions ("Take Inventory")**

* Start session with: `location`, `startedBy`, `timestamp`.
* Add line items: `itemId`, `count`, `unit`, optional `note`, photo upload (optional).
* Save as Draft; Submit to Close session; immutable after close.
* Auto-calc deltas vs last session and vs par; show variance.

**3.1.3 Current Inventory View**

* Aggregates latest closed session for each `itemId+location` as current on‑hand.
* Badges for **Below Par**, **Critical (<50% par)**.
* Quick actions: create production request, add purchase note (Phase 2: PO).

**3.1.4 Inventory History**

* Session list with: date, location, user, #lines, below‑par count.
* Drill‑in to a session to see all line items and photos.

### 3.2 Production Tracking

**3.2.1 Production Requests**

* Create request: `requestedBy`, `location`, `neededBy` (date/time), `product` (sku/recipe), `targetQuantity` (units), `priority` (Normal/High), `reason` (below par, seasonal, event).
* Status flow: **Open → In‑Progress → Completed → Archived**.
* Link to originating below‑par items (if created from inventory).

**3.2.2 Batches**

* Record batch made: `batchId`, `product`, `quantityMade`, `madeBy`, `startedAt/finishedAt`, `storageLocation`, `lotCode` (auto: yyyymmdd‑seq), `notes`.
* Actions: **Run Out**, **Waste**.
* Waste logging requires `wasteReason` (spoilage/temp excursion/QA fail/accident) and `quantity`.
* Maintain stock impact: batch completion increases on‑hand for `product` at `storageLocation`; run‑out decreases; waste decreases.

**3.2.3 Production Dashboard**

* Kanban: Requests grouped by status.
* Today widget: due/overdue requests; low‑stock items.
* Filters: location, category, due window.

### 3.4 Alerts & Notifications

* Low‑stock alert when `current < parStockLevel` after session close.
* Overdue production requests alert.

### 3.5 Settings & Admin

* Manage users & roles.
* Manage locations (shop, trucks, freezers).
* Categories, units, waste reasons, priorities, recipes (Phase 2: full recipe mgmt).

---

## 4) Integrations (Stubs for Phase 1)

* **POS (Square)**: (Phase 2) nightly sales import by item to refine par logic.
* **Delivery (DoorDash/Uber Eats)**: (Phase 2) aggregate item‑level sales if available.
* **Auth**: Email+password with JWT; optional Google OAuth (Phase 2).

---

## 5) Non‑Functional Requirements

* **Mobile‑first** UI; works well on 360–1280px.
* **Performance**: dashboard loads < 2s with 1k items.
* **Reliability**: optimistic UI for session lines; retry on flaky networks.
* **Auditability**: immutable closed sessions & batch records; who/when tracked.
* **Security**: role‑based authorization; server‑side validation; OWASP top‑10 aware.
* **Privacy**: minimal PII (staff names/emails only); backups daily.

---

## 6) Data Model (Conceptual)

### 6.1 Entities

* `InventoryItem(id, name, category, unit, parStockLevel, location(default?), sku, isActive, notes, createdAt, updatedAt)`
* `InventorySession(id, locationId, startedBy, startedAt, closedBy, closedAt, status)`
* `InventorySessionLine(id, sessionId, itemId, count, unit, note, photoUrl)`
* `ProductionRequest(id, productItemId, locationId, requestedBy, neededBy, priority, reason, status, createdAt)`
* `Batch(id, productItemId, quantityMade, unit, storageLocationId, madeBy, startedAt, finishedAt, lotCode, notes, status)`
* `WasteEvent(id, batchId, itemId, quantity, unit, reason, recordedBy, recordedAt)`
* `User(id, name, email, role)`
* `Location(id, name, type, parentId)`

**Derived**: `CurrentStock(itemId, locationId, quantity)` (materialized view updated on session close & batch events).

---

## 7) API Contracts (Sample)

**Base URL**: `/api`

### Inventory Items

* `GET /inventory/items?active=true&location=shop`
* `POST /inventory/items` → `{name, unit, parStockLevel, location, ...}`
* `PUT /inventory/items/{id}`
* `DELETE /inventory/items/{id}` (soft‑delete)

### Inventory Sessions

* `POST /inventory/sessions` → `{locationId}` returns `{id, status:"DRAFT"}`
* `POST /inventory/sessions/{id}/lines` (batch add supported)
* `POST /inventory/sessions/{id}/close` → locks session
* `GET /inventory/sessions?locationId=...`
* `GET /inventory/current?locationId=...`

### Production

* `POST /production/requests`
* `GET /production/requests?status=OPEN`
* `PATCH /production/requests/{id}` (status transitions)
* `POST /production/batches` → creates batch, updates stock
* `POST /production/batches/{id}/runout`
* `POST /production/batches/{id}/waste`

**Auth**

* `POST /auth/login` → JWT; roles encoded in token.

---

## 8) UI/UX Requirements

**8.1 Global**

* Top nav: Dashboard, Inventory, Production, Truck, Admin.
* Location switcher in header.
* Toasts for success/error; unsaved changes warning.

**8.2 Inventory**

* Item Library table: searchable, filter by category/location/status; inline edit par.
* Take Inventory flow: scan or search item → enter count → add note/photo → save; progress bar; submit.
* Current Stock: cards or table with sort by **Below Par first**; Quick action “Create Prod Request”.

**8.3 Production**

* Kanban board (Open/In‑Progress/Completed) with drag‑drop.
* “Record Batch” modal: product picker, quantity, storage location.
* Waste dialog with required reason and quantity.

**Accessibility**: keyboard‑navigable forms, high‑contrast mode.

---

## 9) Acceptance Criteria (Samples)

**INV‑01 Create Inventory Item**

* *Given* I am Admin on `/inventory/items/new`, *when* I save a valid item, *then* it appears in the list with correct fields and par.
* *And* invalid form shows per‑field errors and prevents save.

**INV‑07 Close Inventory Session**

* *Given* a Draft session with ≥1 line, *when* I click Close, *then* the session status becomes Closed, lines become read‑only, and Current Stock updates accordingly within 5s.

**PROD‑04 Record Waste**

* *Given* a Completed batch, *when* I record waste with reason and quantity, *then* on‑hand decreases and Waste report shows the entry with lotCode.

**TRUCK‑02 Prep Sheet**

* *Given* a truck event exists, *when* I click “Prep Sheet”, *then* a PDF downloads with event details and item checklist.

---

## 10) Reports & Dashboards

* **Today Dashboard**: low‑stock list (sortable), open requests due today/tomorrow
* **Waste Report**: by reason/date/product; export CSV.
* **Production Throughput**: batches per week by product.

---

## 11) Data Validation & Business Rules

* Par cannot be negative.
* `neededBy` cannot be in the past for new requests.
* Closing a session requires at least one line; count must be ≥ 0.
* Waste quantity cannot exceed remaining batch quantity.

---

## 12) Error States & Empty States

* Empty Item Library: CTA to “Add First Item” or “Import CSV”.
* Network error during session line add: local queue + retry; user sees banner.

---

## 13) Migration & Seed Data

* Seed: locations (Shop, Truck 1, Truck 2, Freezer A/B), categories, units, waste reasons.
* Optional CSV import for initial Item Library.

---

## 14) Tech Notes & Conventions

* Frontend: React; styling preference **CSS Modules** (existing decision). Keep components responsive and touch‑friendly.
* API: Spring Boot under package `com.iowaicecreamconcepts.api` with inventory under `…api.inventory` (existing); follow REST naming above.
* DB: PostgreSQL; use UUID primary keys; timestamps in UTC.

---

## 15) Security & Audit

* JWT expiry 7 days; refresh on activity (Phase 2).
* Audit log of: item CRUD, session close, batch create/waste/runout.
* Role checks server‑side; deny by default.

---

## 16) Roadmap & Prioritization

**Phase 1 (MUST)**: Inventory Library, Inventory Sessions, Current Stock, Production Requests & Batches, Waste/Runout, Dashboard basics, RBAC, CSV import/export.

**Phase 2 (SHOULD)**: Shift lead checklists, POS sales import, recipe mgmt, OAuth, analytics charts, notifications via email/SMS.

**Phase 3 (COULD)**: Purchase orders & vendor mgmt, advanced forecasting, offline mode.

---

## 17) Test Plan (QA Outline)

* Unit tests for validators and reducers.
* API integration tests for session close stock math, batch/waste flows.
* E2E happy paths: create item → take inventory → below‑par → create prod request → record batch → run out → waste report.
* Cross‑device manual tests (iPhone SE, Pixel 6, iPad mini).

---

## 18) Open Questions / Assumptions

* Sales item → recipe mapping granularity (1:1 vs many:1) — Phase 2.
* Prep list rules for truck events — start with simple per‑cover defaults, refine later.

---

## 19) Appendices

**A. Example JSON Schemas (abridged)**

```json
{
  "InventoryItem": {
    "id": "uuid",
    "name": "string",
    "category": "string",
    "unit": "string",
    "parStockLevel": 0,
    "location": "string",
    "sku": "string",
    "isActive": true,
    "notes": "string"
  },
  "InventorySession": {
    "id": "uuid",
    "locationId": "uuid",
    "startedBy": "uuid",
    "startedAt": "2025-08-21T20:00:00Z",
    "closedAt": null,
    "status": "DRAFT|CLOSED"
  },
  "ProductionRequest": {
    "id": "uuid",
    "productItemId": "uuid",
    "locationId": "uuid",
    "requestedBy": "uuid",
    "neededBy": "2025-08-22T17:00:00Z",
    "priority": "NORMAL|HIGH",
    "reason": "string",
    "status": "OPEN|IN_PROGRESS|COMPLETED|ARCHIVED"
  }
}
```

**B. Sample User Stories (Jira style)**

* *As a Shift Lead*, I can start a location‑specific inventory session, add counts as I walk the store, and submit to update current stock.
* *As a Production Lead*, I can see all Open requests, record a batch with lot code, and mark run‑out or waste with reason.
* *As a Coordinator*, I can add a truck event and generate a prep sheet with items and quantities.
