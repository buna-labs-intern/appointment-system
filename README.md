# Clinic Appointment Management System

## Project Overview

The goal of this project is to build a web application that helps a small clinic manage doctors, patients, and appointments.

This project is designed to help interns learn software engineering by building a real-world business application. Throughout the project, you will practice planning, database design, backend development, frontend development, authentication, authorization, validation, teamwork, version control, and problem solving.

The focus of this project is to build a clean, maintainable, and reliable application that satisfies the business requirements.

This is **not** an Electronic Medical Record (EMR) system. It does not manage diagnoses, prescriptions, laboratory results, billing, insurance, payments, or patient medical history.

---

# Business Overview

The clinic has receptionists who register patients and schedule appointments with doctors.

Doctors do not log into the system. They are simply resources that can be assigned to appointments.

The clinic operates during fixed working hours.

- Morning Session: **09:00 AM – 12:00 PM**
- Lunch Break: **12:00 PM – 01:00 PM**
- Afternoon Session: **01:00 PM – 05:00 PM**

Appointments can only be scheduled during the clinic's operating hours.

---

# Users

## Administrator

The administrator is responsible for managing the system.

The administrator can:

- Create receptionist accounts
- Update receptionist accounts
- Activate or deactivate receptionist accounts
- Manage doctors
- View the dashboard

---

## Receptionist

The receptionist manages the daily operations of the clinic.

The receptionist can:

- Register patients
- Update patient information
- Search patients
- Schedule appointments
- Reschedule appointments
- Cancel appointments
- Check patients in
- Mark appointments as completed
- View appointment schedules

---

## Doctor

Doctors are not system users.

Doctors do not log into the application.

They are registered by the administrator or receptionist and are assigned to appointments.

---

# Doctor Management

Each doctor should contain the following information:

- Full name
- Specialty
- Phone number
- Active / Inactive status

Inactive doctors cannot receive new appointments.

Receptionists and administrators should be able to:

- Register doctors
- Update doctor information
- Activate doctors
- Deactivate doctors
- View doctor details
- Search doctors

---

# Patient Management

Each patient should contain the following information:

- Full name
- Phone number
- Gender
- Date of birth
- Address (optional)
- Notes (optional)

Receptionists should be able to:

- Register patients
- Update patient information
- View patient details
- Search patients

The system should allow receptionists to quickly find an existing patient before creating a new one.

---

# Service Management

The clinic offers different medical services.

Each service should contain:

- Service name
- Description (optional)
- Active / Inactive status

Example services:

- General Consultation
- Follow-up Consultation
- Pediatrics Consultation
- Medical Certificate
- Blood Pressure Check

Services are used to categorize appointments and generate reports.

Inactive services cannot be assigned to new appointments.

Receptionists and administrators should be able to:

- Create services
- Update services
- Activate services
- Deactivate services
- Search services

---

# Appointment Management

An appointment connects a patient with a doctor for a specific service.

Each appointment should contain:

- Patient
- Doctor
- Service
- Appointment date
- Start time
- End time
- Reason for visit (optional)
- Notes (optional)
- Status

Receptionists should be able to:

- Create appointments
- Update appointments
- Cancel appointments
- View appointment details
- Search appointments

---

# Appointment Status

Appointments move through different stages during their lifecycle.

The normal flow is:

```text
Scheduled
    ↓
Checked In
    ↓
Completed
```

Alternative outcomes:

```text
Scheduled
    ↓
Cancelled
```

```text
Scheduled
    ↓
No Show
```

Each appointment should always have one valid status.

---

# Dashboard

The dashboard provides a quick overview of clinic activity.

It should display information such as:

- Total doctors
- Total patients
- Today's appointments
- Scheduled appointments
- Completed appointments
- Cancelled appointments

The dashboard should also display a list of recent appointments.

---

# Search

The application should provide search functionality for common records.

Appointments should be searchable by:

- Patient name
- Patient phone number
- Doctor
- Service
- Appointment date
- Appointment status

Patients should be searchable by:

- Name
- Phone number

Doctors should be searchable by:

- Name
- Specialty

Services should be searchable by:

- Service name

---

# Business Rules

The system must enforce the following business rules.

---

## Doctor Status

Only active doctors can receive new appointments.

Inactive doctors should not appear as available options when creating appointments.

---

## Past Appointments

Appointments cannot be created in the past.

The appointment start time must always be later than the current date and time.

---

## Valid Time Range

Every appointment must have a valid time range.

The appointment end time must always be later than the appointment start time.

Examples:

Valid:

- 09:00 → 09:30

Invalid:

- 09:30 → 09:00
- 09:00 → 09:00

---

## Clinic Working Hours

Appointments must be completely inside the clinic's operating hours.

Morning Session:

- 09:00 AM – 12:00 PM

Afternoon Session:

- 01:00 PM – 05:00 PM

Examples:

Valid:

- 09:00 → 09:30
- 10:15 → 11:45
- 01:00 → 02:30
- 04:00 → 05:00

Invalid:

- 08:30 → 09:15
- 04:30 → 05:30

---

## Lunch Break

Appointments cannot overlap the lunch break.

The lunch break is from:

**12:00 PM – 01:00 PM**

Example:

Invalid:

- 11:45 → 01:15

Appointments must either:

- End before 12:00 PM

or

- Start at or after 01:00 PM

---

## Overlapping Appointments

A doctor cannot have more than one appointment during the same time period.

Example:

Existing appointment:

- 09:00 → 09:30

The following appointments are invalid:

- 09:15 → 09:45
- 08:45 → 09:10
- 09:00 → 09:30

The following appointments are valid:

- 08:30 → 09:00
- 09:30 → 10:00

The system must prevent overlapping appointments from being created or updated.

---

## Completed Appointments

Completed appointments cannot be edited.

Once an appointment has been completed, it should become read-only.

---

## Cancelled Appointments

Cancelled appointments no longer reserve the doctor's time.

Once an appointment has been cancelled, another appointment may be created during that same time period.

---

# Technical Requirements

The following requirements are independent of the programming language or framework used.

---

## Authentication

The application should support user authentication.

At minimum, the application should provide:

- Login
- Logout
- Secure password storage using hashing
- Protected pages or routes

---

## Authorization

The application should support role-based authorization.

At minimum, the following roles should exist:

- Administrator
- Receptionist

Users should only be able to access the features they are authorized to use.

---

## Database Design

The application should use a relational database.

Suggested entities include:

- Users
- Doctors
- Patients
- Services
- Appointments

Proper relationships should be created using primary keys and foreign keys.

The database should be normalized where appropriate to reduce duplicated data.

---

## Validation

Validation should exist on both the frontend and the backend.

Frontend validation improves the user experience.

Backend validation protects the application's data integrity.

The backend should never rely solely on frontend validation.

---

## Error Handling

The application should provide meaningful error messages.

Invalid user input should be handled gracefully.

Unexpected errors should not cause the application to crash.

---

## Search

Search should support partial matching whenever appropriate.

Example:

Searching for:

```
Joh
```

should return:

```
John
Johnny
Johnson
```

where appropriate.

---

## Pagination

Lists containing many records should support pagination.

Examples include:

- Patients
- Doctors
- Appointments
- Services

---

## Sorting

Users should be able to sort data by common fields.

Examples include:

- Name
- Date
- Status
- Specialty

---

## Responsive Design

The application should work well on desktop and tablet screen sizes.

Mobile support is encouraged but is not required.

---

## Clean Code

The project should be organized into logical folders and modules.

Developers should:

- Use meaningful names
- Avoid duplicated code
- Keep functions small and focused
- Separate business logic from presentation logic where appropriate

The project should be easy for another developer to understand.

---

## Version Control

The project should use Git throughout development.

Commit changes regularly using meaningful commit messages.

Examples of good commit messages:

- Add patient management
- Implement appointment validation
- Prevent overlapping appointments
- Add doctor search

Avoid commit messages such as:

- update
- fix
- changes

---

## Documentation

The project should include a README file.

The README should explain:

- Project overview
- Team members
- Installation steps
- Environment variables
- Database setup
- How to run the application
- Technology stack used

---

# Recommended Technology Stacks

The following technology stacks are recommendations only.

You are free to use another technology stack if your team prefers.

---

## Recommendation 1

### Frontend

- React
- Tailwind CSS

### Backend

- Express.js

### ORM

- Prisma

### Database

- MySQL or PostgreSQL

### Why these tools?

**React**

React allows you to build reusable user interface components and manage application state efficiently. It is one of the most widely used frontend libraries in modern web development and provides valuable experience for future projects.

**Tailwind CSS**

Tailwind CSS allows you to build responsive and consistent user interfaces quickly without writing large amounts of custom CSS. It encourages reusable designs and speeds up development.

**Express.js**

Express.js is a lightweight backend framework for Node.js. It makes it easy to build REST APIs, organize routes, and implement backend business logic while remaining beginner friendly.

**Prisma**

Prisma simplifies working with relational databases. It provides type-safe database queries, simplifies relationships, and includes a migration system for managing database schema changes.

**MySQL / PostgreSQL**

Both MySQL and PostgreSQL are industry-standard relational database systems. They are excellent choices for learning SQL, relationships, constraints, indexing, and data modeling.

---

## Recommendation 2

### Backend

- Laravel

### Frontend

- Blade
- Alpine.js
- Tailwind CSS

### Database

- MySQL or PostgreSQL

### Why these tools?

**Laravel**

Laravel is a full-featured web framework that includes routing, authentication, validation, database access, and many other features out of the box. It encourages clean project organization and has excellent documentation.

**Blade**

Blade is Laravel's server-side templating engine. It is simple to learn and integrates seamlessly with Laravel, making it a good choice for building dynamic web pages.

**Alpine.js**

Alpine.js adds JavaScript interactivity directly within HTML. It has a small learning curve and is ideal for forms, dropdowns, modals, and other interactive user interface components without requiring a full single-page application.

**Tailwind CSS**

Tailwind CSS enables rapid development of responsive and consistent user interfaces while reducing the need for custom CSS.

**MySQL / PostgreSQL**

Both databases are reliable relational database management systems that provide an excellent foundation for learning SQL, database relationships, constraints, and transactions.
