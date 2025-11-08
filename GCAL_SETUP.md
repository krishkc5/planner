# Google Calendar Integration Setup Guide

## Overview

This planner supports two-way integration with Google Calendar:
- **Export**: Push tasks to Google Calendar as events
- **Sync**: Keep tasks and calendar events in sync
- **Color-coded**: Each category gets its own color in Google Calendar

## Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it something like "Task Planner"
4. Click "Create"

### Step 2: Enable Google Calendar API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

### Step 3: Create OAuth Credentials

#### Get API Key:
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API key"
3. Copy the API key
4. Click "Restrict Key" (recommended)
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Calendar API"
   - Save

#### Get OAuth Client ID:
1. Still in "Credentials", click "Create Credentials" → "OAuth client ID"
2. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in app name: "Task Planner"
   - Add your email for support
   - Add your email to test users
   - Save and continue through the steps
3. Back to creating OAuth client ID:
   - Application type: "Web application"
   - Name: "Task Planner Web Client"
   - Authorized JavaScript origins:
     - `http://localhost` (for testing)
     - `https://krishkc5.github.io` (for GitHub Pages)
   - Click "Create"
4. Copy the Client ID

### Step 4: Add Credentials to Your Code

1. Open `gcal.js` in your project
2. Replace the placeholder values:
   ```javascript
   this.CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID_HERE';
   this.API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
   ```

### Step 5: Test Locally

1. Open `index.html` in your browser
2. Click "Connect Google Calendar"
3. Sign in with your Google account
4. Grant permissions
5. Try creating a task with a date - it should appear in your Google Calendar!

### Step 6: Deploy to GitHub Pages

1. Commit your changes (make sure not to commit your credentials publicly - see security note below)
2. Push to GitHub
3. Enable GitHub Pages as described in the main README

## Security Best Practices

### Important: Don't commit credentials to public repos!

Instead of hardcoding credentials in `gcal.js`, you can:

**Option 1: Use environment variables (recommended for production)**
- Use a build tool to inject credentials at build time
- Store credentials in GitHub Secrets

**Option 2: Use a config file (not committed)**
- Create a `config.js` file with your credentials
- Add `config.js` to `.gitignore`
- Load it before `gcal.js` in your HTML

Example `config.js`:
```javascript
window.GCAL_CONFIG = {
    CLIENT_ID: 'your-client-id',
    API_KEY: 'your-api-key'
};
```

Then in `gcal.js`, use:
```javascript
this.CLIENT_ID = window.GCAL_CONFIG?.CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
this.API_KEY = window.GCAL_CONFIG?.API_KEY || 'YOUR_API_KEY_HERE';
```

## Features

Once connected, you can:

1. **Auto-sync new tasks**: Tasks with dates automatically create calendar events
2. **Color-coded categories**:
   - Courses: Blue
   - Work: Red
   - Career: Purple
   - Research: Green
   - Fun: Orange
3. **Sync existing tasks**: Click "Sync with Calendar" to push all dated tasks
4. **Bi-directional updates**: Complete/delete tasks to update calendar
5. **Calendar icon**: Tasks synced to Google Calendar show a 📅 icon

## Troubleshooting

**"Google Calendar API not ready"**
- Check that you've enabled the Calendar API in Google Cloud Console
- Verify your credentials are correctly entered in `gcal.js`

**"401 Unauthorized"**
- Your OAuth consent screen may need to be published
- Check that your origin URLs are correctly added to authorized JavaScript origins

**Tasks not syncing**
- Make sure the task has a date
- Check browser console for errors
- Verify you're signed in (click the sync button)

**Testing on localhost**
- Make sure you've added `http://localhost` to authorized JavaScript origins
- You may need to use `http://127.0.0.1` instead

## Limitations

- Google has daily API quota limits (usually sufficient for personal use)
- OAuth consent screen may show "unverified app" warning (this is normal for personal projects)
- Some features may require additional OAuth scopes

## Need Help?

Check the [Google Calendar API documentation](https://developers.google.com/calendar/api/guides/overview) for more details.
