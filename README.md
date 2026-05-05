# GearScout Collection BASE

A modern, accessible FRC (FIRST Robotics Competition) scouting application for collecting and submitting match data during competitions. Built with React, TypeScript, and offline-first architecture.

**Access the application at: [gearitforward.com](https://gearitforward.com)**

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How to Use](#how-to-use)
  - [Initial Setup](#initial-setup)
  - [Data Collection](#data-collection)
  - [Offline Mode & Pending Matches](#offline-mode--pending-matches)
- [For Developers](#for-developers)
- [Support](#support)

## Overview

GearScout Collection BASE is a Progressive Web App (PWA) designed to help FRC teams track and analyze robot performance during competitions. It is intended to be reused from season to season with the same login, offline sync, schedule integration, and accessibility foundations, while the auto and teleop data entry sections can be adjusted for the current game.

## Key Features

✅ **Offline-First Architecture** - Works without internet, syncs when online  
✅ **Progressive Web App** - Installable on any device  
✅ **Automatic Match Retry** - Failed submissions automatically retry  
✅ **The Blue Alliance Integration** - Auto-load team schedules  
✅ **Fully Accessible** - WCAG 2.1 compliant with ARIA labels and keyboard navigation  
✅ **Type-Safe** - Built with TypeScript for reliability  
✅ **Secure** - Input sanitization and route protection

## How to Use

### Initial Setup

When you first visit [gearitforward.com](https://gearitforward.com), you'll see the login page where you configure your scouting session:

#### Required Fields:

1. **Team Number** - Your team's FRC number (e.g., 2338)
2. **Scouter Name** - Your name or identifier
3. **Event Code** - The official event code for the current event
4. **Secret Code** - Authentication code provided by your team lead

#### Optional Field:

5. **TBA Code** - The Blue Alliance API key for accessing match schedules
   - Enables automatic team loading based on match number when schedule data is available
   - Recommended for faster data entry

#### Quick Setup via URL (Recommended):

Your team lead can provide a pre-configured link like:
```
https://gearitforward.com/?team=2338&event=currentEvent&secret=yourCode&tba=yourTBAKey
```

When you visit this link:
- **All matching fields autofill** on the login page (team number, event code, secret code, and TBA code)
- Any parameter can be included or omitted - only provided parameters autofill
- If all required fields are autofilled, the **Submit** button is immediately active and ready to click
- You can submit right away without manually entering anything, or fill in any missing required fields
- Your settings are automatically saved in your browser

### Data Collection

After setup, you'll be on the main data collection page where you record match data:

#### Match Information:

1. **Match Number** - Enter the match number (0-999)
   - After entering, if TBA is configured, the app loads team numbers for that match
   - A loading spinner indicates schedule data is being fetched

2. **Team Number**
   - **With TBA:** Select from dropdown of teams in the match
   - **Without TBA:** Manually enter the team number

3. **Alliance Color** - Click **RED ALLIANCE** or **BLUE ALLIANCE**

#### Season-Specific Scouting Fields:

The base app keeps the same data-collection workflow from year to year, but the scouting fields inside the form are intended to change with the current game. Update those fields as needed for the season without changing the overall login, match, and submission flow.

#### Submitting Data:

1. Fill out all required fields (match number, team number, alliance color)
2. Record the current season's scouting fields
3. Complete any additional season-specific inputs
4. Click the **Submit** button at the bottom
5. If successful:
   - Form resets for the next match
   - You can immediately start scouting the next robot
6. If submission fails (no internet):
   - Data is automatically saved locally
   - You'll see a pending matches indicator

#### Navigation:

- **Back** button - Returns to the login/setup page
- **ANALYTICS** link (header) - Opens [data.gearitforward.com](https://data.gearitforward.com/) to view analytics

### Offline Mode & Pending Matches

The application works offline and stores data when internet is unavailable:

#### How It Works:

- If submission fails (no internet, server issues), matches save automatically to your device
- A **pending matches indicator** appears in the top-right corner
- Shows count like: **"3 pending ↻"**
- Matches are stored with timestamps for later submission

#### Retrying Failed Submissions:

1. Look for the pending indicator in the top-right corner
2. Click the circular arrow **(↻)** button next to the count
3. The app attempts to submit all pending matches
4. Successfully submitted matches are removed from the queue
5. The counter updates to show remaining pending matches

#### Important Notes:

- Pending matches are stored in your browser's local storage
- Data persists even if you close the browser or refresh the page
- You can continue scouting new matches while pending submissions are queued
- The pending count updates automatically every 5 seconds
- Retry submissions when you have stable internet connection

## What Data is Collected

GearScout Collection tracks the following information for each match:

- **Match and team identification** - Match number, team number, alliance color
- **Season-specific scouting fields** - The current game's data entry inputs and values
- **Metadata** - Timestamp of submission and scouter identifier

All data is automatically saved locally if submission fails and retried when internet is available.

## For Developers

### Overview

GearScout Collection is built with modern web technologies and follows best practices for accessibility, type safety, and offline-first PWA development. The codebase is modular, well-tested, and designed to be easy to maintain and extend.

### Tech Stack

- **Frontend:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** SCSS/Sass
- **Hosting:** gearitforward.com

### Getting Started

To run the application locally:

1. Clone the repository: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open `http://localhost:5173` in your browser

### Build and Deployment

- Build for production: `npm run build`
- Output is in the `dist/` directory
- The built app is a static PWA and can be deployed to any web host

### Project Structure

```
src/
├── pages/
│   ├── Login.tsx              # Login/setup page
│   └── DataCollection.tsx     # Main data collection interface
├── components/
│   ├── PendingMatchesIndicator.tsx  # Offline sync indicator
│   ├── ErrorBoundary.tsx            # Error handling
│   └── update-banner/               # PWA update notifications
├── context/
│   └── UserContext.tsx        # User authentication state
├── hooks/
│   └── usePendingMatches.ts   # Offline data management logic
├── model/
│   └── Models.ts              # TypeScript type definitions
├── services/
│   ├── gearscout-services.ts  # API communication
│   ├── matchStorage.ts        # Offline data persistence
│   └── scheduleService.ts     # The Blue Alliance integration
├── scripts/
│   ├── data-collection.ts     # Match data processing
│   └── service-worker.ts      # PWA offline capability
├── styles/                    # SCSS stylesheets
└── utils/                     # Helper functions (validation, sanitization, etc.)
```

### Key Design Patterns

- **Offline-First:** Data is saved locally before submission and synced when online
- **Type Safety:** Full TypeScript coverage for reliability
- **Input Sanitization:** All user inputs are validated and sanitized
- **Route Protection:** Authentication checks prevent unauthorized access
- **Accessibility:** WCAG 2.1 compliant with keyboard navigation and ARIA labels

## Support

### For End Users

- **Event Setup:** Contact your team lead for the pre-configured URL link
- **Secret Codes:** Talk to your scouting coordinator to get the authentication code
- **TBA Keys:** Ask your team lead for The Blue Alliance API key

### For Developers

- Review the TypeScript interfaces in [src/model/Models.ts](src/model/Models.ts)
- Check the API service layer in [src/services/gearscout-services.ts](src/services/gearscout-services.ts)
- Offline storage logic is in [src/services/matchStorage.ts](src/services/matchStorage.ts)

### View Analytics

Scouted match data can be analyzed at [data.gearitforward.com](https://data.gearitforward.com/)

---

**Version:** Current season build  
**Live Application:** [gearitforward.com](https://gearitforward.com)  
**Built with:** React 18 + TypeScript + Vite
