# EPIC: PWA Workout & Habit Bridge - Data-Driven Training Foundation
The "Why": To enable a high-performance, mobile-first training experience that treats health data as a primary asset, providing real-time feedback while ensuring the underlying Google Sheets remain "AI-ready" for future analysis.

## FEATURE 1: Authentication & Data Foundation
### Task 1.1: Google OAuth Integration
- Description: Implement Google OAuth 2.0 flow to secure access to the user's Google Drive and Sheets.
- DoD: User can successfully sign in/out; user session persists across browser refreshes; token is stored securely for API calls.
### Task 1.2: Sheet Selector
- Description: Allow the user to select a Logs and Programs file from their Google Drive.
- DoD: User can successfully navigate their Google Drive to select files. File paths are stored in memory.
### Task 1.3: Sheet Schema Validator
- Description: Create a utility that checks the required headers in the "Metrics," "Programs," and "Logs" sheets upon application load.
- DoD: App displays a "Config Error" UI screen if headers are missing, explicitly naming the missing columns; app proceeds to Home if validation passes.

## FEATURE 2: The "Daily Vitals" Workflow
### Task 2.1: Vitals Input Form
- Description: Create a responsive form for Sleep (hrs), Weight (kg/lbs), and Macros (Protein/Calories).
- DoD: Form fields include basic validation (e.g., positive numbers); UI matches the "Daily Vitals" wireframe.
### Task 2.2: Optimistic Sync with Status Indicator
- Description: Implement an "Optimistic UI" pattern for POST requests to the Metrics sheet. Include an icon that shifts from "Syncing..." to "Synced" (or "Failed").
- DoD: UI updates immediately upon form submission; background sync process confirms status in the header; error state is clearly communicated if the network fails.

## FEATURE 3: The Guided Workout Engine
### Task 3.1: Program Parser Service
- Description: Build a service layer to fetch and parse the relational "Programs," "Workouts," and "Exercises" tabs into a local state object for the app.
- DoD: App successfully navigates the relationship between Program and Exercise; correctly groups exercises by Phase (Warm-up, Main, Cool-down).
### Task 3.2: Workout Navigation UI (Focus Card)
- Description: Develop the "Focus Card" UI that displays one exercise at a time, including inputs for Reps, Weight, and RPE.
- DoD: Users can toggle between "Overview" and individual "Focus Card" views; "Next/Prev" navigation flows correctly based on the parsed sheet data.
### Task 3.3: Finalized Log Push
- Description: Aggregate all session data (Sets/Reps/RPE) and push the entire batch to the "Logs" sheet upon the completion of the Cool-down phase.
- DoD: Full session data is verified in the sheet; status indicator updates upon final success.
