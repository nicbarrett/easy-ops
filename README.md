# EasyOps

Requirement spec for EasyOps application

## Features

Feature sets are divided into modules

### Core Module

#### Admin
- User
    - First
    - Last
    - Email
    - Password
    - Phone
    - Locations
    - Roles
- Role
    - Name
    - Rights
- Location
    - Name
    - Type (Physical | Online | Mobile)
- Right (Enum)
    - admin:user:r
    - admin:user:rw
    - admin:role:r
    - admin:role:rw
    - admin:location:r
    - admin:location:rw
    - operations:input:r
    - operations:input:rw
    - operations:inventory:r
    - operations:inventory:rw
    - operations:tasks:r
    - operations:tasks:rw
    - production:output:r
    - production:output:rw
    - production:request:r
    - production:request:rw
    - tasks:

#### Operations

- Item
    - Input
        - Supplier
        - Cost
        - Unit
        - Par Level
        - Restock Level
        - Locations
        - Notes
- Inventory
    - Location
    - User
    - Start Date
    - End Date
    - Due Date
    - Scheduled Date
    - Inventory Items
        - Item
        - Quantity
    - Notes
- Task Manager
    - Task
        - Name
        - Description
        - User
        - Notes
        - Start Date
        - End Date
        - Due Date
        - Scheuled Date

### Production Module
- Item
    - Output
        - Recipe
        - Cost
        - Unit
        - Par Level
        - Restock Level
    - Request
        - Item
        - Start (DateTime)
        - End (DateTime)
        - Due (DateTime)
        - Scheduled (DateTime)
        - Quantity
        - Priority
        - Notes

## Personas

### Owner
- All rights
- All locations

### General Manager
- All rights
- Specific location

### Shift Lead
- All read rights
- Specific location(s)

### Crew
- Task read rights
- Production read rights
- Specific locations(s)

## User Stories

### Core

As a [general manager](#general-manager),  
I want to be able to invite a new [crew](#crew) member to EasyOps  
so they can access the app

As an [owner](#owner),  
I want to be able to define a new role  
so that I can give the right people access to the right parts of the system  

As an [owner](#owner),  
I want to create a new location  
so that I can manage everything I need for that location  

As a [general manager](#general-manager)  
I want to be able to create an inventory request  
so that inventory can be done  

As a [shift lead](#shift-lead) working at a location  
I want to be able to view open inventory requests  
so that I can complete inventory  

As a [general manager](#general-manager)  
I want to be able to create a new task  
so that it can be done during the next shift  

As a [shift lead](#shift-lead) or [crew](#crew) member  
I want to be able to view open tasks  
so that I can complete them  

### Production

As a [general manager](#general-manager)  
I want to be able to request an output be made  
so that a user at the production location can produce the output  

As a [shift lead](#shift-lead) working at a production facility  
I want to be able to view open production requests  
so that I can complete them  