# Discord Event Management System
## Overview
This project is a Discord-based Event Management System built using JavaScript and the Discord.js library. The bot automates event organization, verification, ticket systems, RSVP management, and role-based permissions inside a Discord server.
The system allows users to verify themselves, apply for Event Manager access, create and manage events, RSVP to events, receive reminders, and participate in event Q&A channels.
All event and RSVP data is automatically saved locally using JSON storage so progress is not lost if the bot restarts.

---

## Features
User Verification System
* Verification tickets
* Admin verification option
* Username validation
* Email validation
* Automatic Authenticated role assignment
* Ticket transcript generation
  
Event Manager Applications
* Apply for Event Manager role
* Admin approval/denial system
* Temporary private ticket channels
* Role assignment automation
  
Event Management
* Add events
* Delete events
* View all events
* Search events by keyword
* Event preview system
* Event Q&A channels
* Automatic event archiving
  
RSVP System
* Register for events
* Cancel registration
* RSVP count tracking
* Event reminders
* Start notifications
* Automatic RSVP closing after event ends
  
Input Validation
* Email validation (@ and . required)
* Date validation (MM-DD-YYYY)
* Time validation (HH:MM AM/PM)
* URL validation (http:// or https://)
* Username validation
* Password length validation
  
Data Persistence
* Automatic saving using events.json
* Event data preserved after restart
* RSVP data preserved after restart
* Manual deletion required to remove events
  
Navigation Features
* Back button support
* Restart event creation
* Close ticket option

---

## Project Structure
```
.
├── bot.js                # Main Discord bot file
├── auth.json             # Bot token configuration
├── events.json           # Automatically saved event data
├── package.json          # Node dependencies
├── package-lock.json
└── README.md             # Project documentation
```

---

## Functional Requirements
User Verification

* The bot allows users to verify themselves, creates a private verification ticket, and supports admin-pass verification.

Ticket Management

* The bot must create private ticket channels and temporary ticket roles. The bot should also generate ticket transcripts and archive them when it’s closed.

Event Creation

* The bot allows Event Managers to create events. It also collects information about the event that was created.

---

## Non-functional Requirements
Security

* Verified users are the only ones that should RSVP. Event Managers are also the only ones that can create events.

Reliability

* The bot should handle invalid input without crashing and recover from Discord API errors.

Performance

* Button interactions should respond quickly, and event reminders should be executed within a minute.

---

## Methodology
The Requirement Engineering Process helped ensure that the Discord event management bot was properly planned, organized, and implemented. The requirements were gathered from user and administrator needs and analyzed for security and usability. It was also designed into structured workflows and implemented using Discord.js and JavaScript. This process resulted in a functional, secure, and user-friendly event management application.

The tools we used was Discord to run the application. Our Programming Language was JavaScript. We also used Java to create a prototype of our bot before deciding on coding it using only JavaScript.

Our application communicates both success and failure messages to users throughout the system. This is done by the Discord bot providing feedback after almost every action so users know whether an operation was completed successfully or if an error occurred.

---

## Testing Methods
Functional testing: Making sure each feature works as expected

User Acceptance Testing: Testing to see that users can use the application without any issues.

Security Testing: Making sure users can’t access things they’re not supposed to have access for.
