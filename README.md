# Lakshya Academy Scholarship Test

This is a fully static web application designed for The Lakshya Academy to conduct their online scholarship tests for defense service aspirants.

## Features
- **Frontend Only:** Built with pure HTML5, CSS3, and Vanilla JS.
- **Backend:** Powered entirely by a Google Apps Script Web App interacting with a Google Sheet. No separate database required.
- **Test Engine:** 
  - 100 MCQs categorized into 4 sections.
  - Section-wise navigation and complete Question Palette.
  - Strict 90-minute countdown timer with auto-submit.
  - Anti-cheat mechanism logs tab-switching behavior.
  - Result generation with sectional breakdowns and immediate PDF download capability.

## Project Structure
\`\`\`
lakshya-scholarship-test/
├── index.html              → Landing page
├── login.html              → Student registration form
├── test.html               → Examination interface
├── result.html             → Scorecard display
├── assets/
│   ├── css/style.css       → Global stylesheet
│   ├── js/
│   │   ├── config.js       → Endpoints and configurations
│   │   ├── login.js        → Registration logic
│   │   ├── test.js         → Core examination logic
│   │   ├── result.js       → Score parsing and display
│   │   └── questions.js    → Complete question bank
│   └── img/                → Image assets
└── backend/
    └── Code.gs             → Google Apps Script Web App source
\`\`\`

## Deployment Instructions

### Part A — Google Sheet & Apps Script Backend
1. **Prepare Sheet:**
   - Log into the target Google account.
   - Create a new Google Sheet named `Lakshya Scholarship Test 2026-27`.
   - Copy the **Sheet ID** from its URL (the long string between `/d/` and `/edit`).

2. **Deploy Code:**
   - In the Google Sheet, go to `Extensions` → `Apps Script`.
   - Delete any default code and paste the complete contents of `backend/Code.gs`.
   - Replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` on line 7 with your copied Sheet ID.
   - Save the script.

3. **Initialize Database Structure:**
   - In the Apps Script Editor toolbar, select the `setupSheets` function from the dropdown menu and click **Run**.
   - You will be prompted to grant permissions. Accept all prompts.
   - Return to your Google Sheet to verify that the `Students`, `Responses`, and `AnswerKey` tabs have been generated correctly.

4. **Publish Web App:**
   - Click **Deploy** → **New deployment** at the top right of the Apps Script Editor.
   - **Type:** Select `Web app` (click the gear icon to see types).
   - **Description:** `Scholarship Test API v1`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
   - Click **Deploy**.
   - Copy the resulting **Web app URL**.

### Part B — Frontend Deployment (GitHub Pages)
1. **Configure Frontend:**
   - Open `assets/js/config.js` in your local project folder.
   - Paste the Web app URL you copied in Part A into the `APPS_SCRIPT_URL` variable.

2. **Publish to GitHub:**
   - Create a new public repository on GitHub (e.g., `lakshya-scholarship-test`).
   - Commit and push all files from this project into the repository's `main` branch.

3. **Enable GitHub Pages:**
   - In your GitHub repository, go to **Settings** → **Pages**.
   - Under **Source**, select `Deploy from a branch`.
   - Under **Branch**, select `main` and `/ (root)`.
   - Click **Save**.
   - Your site will be live at `https://<your-username>.github.io/<repo-name>/` within a couple of minutes.

## Important Notes on Security
As this is a statically hosted frontend communicating with an open Apps Script endpoint, stringent exam security is impossible. While measures like right-click disabling and tab-switch monitoring are in place, technical users can bypass them. This solution is designed for scale, ease-of-use, and zero-cost hosting, assuming an honor system for scholarship applicants.
