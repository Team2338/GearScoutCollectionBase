# GearScout Collection BASE

A modern, accessible FRC (FIRST Robotics Competition) scouting application for collecting and submitting match data during competitions. Built with React, TypeScript, and offline-first architecture.

**Access the application at: [gearitforward.com](https://gearitforward.com)**

## 👋 Brand-New Programmer Quick Start

If this is your first web app project, do this in order before changing scouting logic.

### Prerequisites

- Install **Node.js LTS** (includes npm)
- Verify install:
   - `node -v`
   - `npm -v`

### Recommended Tools

- **VS Code** for editing, terminal use, and extension support
- Download: [Visual Studio Code](https://code.visualstudio.com/)
- **GitHub Desktop** for beginner-friendly branching, commits, and pull requests
- Download: [GitHub Desktop](https://desktop.github.com/)
- You can use other tools, but this template is easiest to manage with VS Code + GitHub Desktop

### First 10 Minutes Checklist

1. Clone the repository: `git clone https://github.com/Team2338/GearScoutCollectionBase.git`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open `http://localhost:5173`
5. Confirm you can:
   - Reach login page
   - Enter setup values
   - Open data collection form
6. Create a new branch before making changes. Use the format `FirstLast Initial - What you are working on` (for example, `RL-TemplateCreation`).

### Environment Variables Quick Guide

If your deployment uses environment variables, keep them in a local env file (for example `.env.local`) and avoid committing secrets.

Important: Any variable prefixed with `VITE_` is exposed to the browser at runtime. Do not store private secrets in `VITE_` variables.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_CURRENT_GAME_YEAR` | Optional | Sets the current game year shown by the app |
| `VITE_APP_VERSION` | Optional | Version value used by update/service worker logic |
| `VITE_EVENT_CODE_EXAMPLE` | Optional | Example event code text shown to users |
| `VITE_GEARSCOUT_API_BASE_URL` | Optional | Primary API base URL |
| `VITE_API_BASE_URL` | Optional | Fallback API base URL |

Team number, secret code, and TBA key are normally provided by user input or pre-filled URL parameters, not env vars.

### Before You Edit Anything

- Read: `src/config/app.ts` (shared app config)
- Read: `src/model/Models.ts` (data types you must keep in sync)
- Read: `src/pages/DataCollection.tsx` + `src/scripts/data-collection.ts` (UI + behavior)
- Keep season/game-specific values centralized in config and model files when possible

### Safe Beginner Workflow

1. Create a branch for your change
2. Make one focused change at a time
3. Run `npm run build` before opening a PR
4. Test login, form submission, and offline retry flow

### First PR Checklist

- `npm run build` passes locally
- Login page still saves and restores settings correctly
- Submit flow works online
- Offline submission queues and retry button work
- PR description explains what changed and why

### Yearly Update Checklist

- Update shared season config in `src/config/app.ts`
- Update form fields and labels in `src/pages/DataCollection.tsx`
- Update behaviors and payload shaping in `src/scripts/data-collection.ts`
- Update related types in `src/model/Models.ts`
- Update styles for new controls in `src/styles/data-collection.scss`
- Run `npm run build` and smoke test full scouting flow

### Troubleshooting

- **`node -v` fails or shows old Node:** Install or update to current Node.js LTS, then restart your terminal.
- **`npm install` fails:** Delete `node_modules` and `package-lock.json`, then run `npm install` again.
- **`npm run dev` does not start:** Check for a port conflict on `5173`, then restart the dev server.
- **Blank page or stale behavior:** Hard refresh the browser, then stop and restart the dev server.
- **Build errors after edits:** Run `npm run build`, fix reported TypeScript errors first, then re-test login and submit flow.

## 📋 Table of Contents

- [👋 Brand-New Programmer Quick Start](#-brand-new-programmer-quick-start)
- [Overview](#overview)
- [Key Features](#key-features)
- [How to Use](#how-to-use)
  - [Initial Setup](#initial-setup)
  - [Data Collection](#data-collection)
  - [Offline Mode & Pending Matches](#offline-mode--pending-matches)
- [What Data is Collected](#what-data-is-collected)
- [For Developers](#for-developers)
- [Support](#support)
- [License](#license)

## Overview

GearScout Collection BASE is a Progressive Web App (PWA) designed to help FRC teams track and analyze robot performance during competitions. This repository is intended as a reusable template: core architecture stays stable, while season-specific scouting fields are updated each year.

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
3. **Event Code** - The official event code (e.g., "yourEventCode")
4. **Secret Code** - Authentication code provided by your team lead

#### Optional Field:

5. **TBA Code** - The Blue Alliance API key for accessing match schedules
   - Enables automatic team loading based on match number
   - Recommended for faster data entry

#### Quick Setup via URL (Recommended):

Your team lead can provide a pre-configured link like:
```
https://gearitforward.com/?team=2338&event=yourEventCode&secret=yourCode&tba=yourTBAKey
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

#### Auto Period Tracking:

Auto fields are season-specific. Replace this section each year with the current game's autonomous objectives and controls.

Common pattern:

- Track scoring attempts/outcomes
- Track objective completion states
- Track any auto-specific metadata needed by analytics

#### Teleop Period Tracking:

Teleop fields are also season-specific. Replace this section each year with the current game's teleop workflow and controls.

Common pattern:

- Capture repeated scoring/cycle data
- Capture endgame/teleop completion states
- Preserve clear UX for rapid match-to-match entry

#### Submitting Data:

1. Fill out all required fields (match number, team number, alliance color)
2. Record autonomous period data for the current season
3. Record teleop/endgame data for the current season
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
- **Auto period** - Season-specific autonomous metrics
- **Teleop period** - Season-specific teleop/endgame metrics
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

1. Clone the repository: `git clone https://github.com/Team2338/GearScoutCollectionBase.git`
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
│   └── data-collection.ts     # Match data processing
├── service-worker.ts          # PWA offline capability
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

## License

This project is licensed under the terms in [LICENSE](LICENSE).

---

**Version:** Template base  
**Live Application:** [gearitforward.com](https://gearitforward.com)  
**Built with:** React 18 + TypeScript + Vite
