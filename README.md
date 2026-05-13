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
