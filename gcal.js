// Google Calendar Integration Manager
class GoogleCalendarManager {
    constructor() {
        this.CLIENT_ID = '359970247983-es5igmnd0dgv1vpncjivaipp5str241o.apps.googleusercontent.com';
        this.API_KEY = 'AIzaSyBjFp9UpRZCnNi5PQjv2vFPknVI9yeStd4';
        this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
        this.SCOPES = 'https://www.googleapis.com/auth/calendar.events';

        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;

        this.init();
    }

    init() {
        // Load Google API and initialize
        if (typeof gapi !== 'undefined') {
            gapi.load('client', () => this.initializeGapiClient());
        }

        // Initialize Google Identity Services
        this.initializeGis();

        this.attachEventListeners();
    }

    async initializeGapiClient() {
        try {
            await gapi.client.init({
                apiKey: this.API_KEY,
                discoveryDocs: [this.DISCOVERY_DOC],
            });
            this.gapiInited = true;
            this.updateSigninStatus();
        } catch (error) {
            console.error('Error initializing Google API client:', error);
        }
    }

    initializeGis() {
        if (typeof google !== 'undefined' && google.accounts) {
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES,
                callback: (response) => {
                    if (response.error !== undefined) {
                        throw (response);
                    }
                    this.updateSigninStatus();
                },
            });
            this.gisInited = true;
        } else {
            // Google Identity Services not loaded yet, try again
            setTimeout(() => this.initializeGis(), 100);
        }
    }

    attachEventListeners() {
        const authBtn = document.getElementById('gcal-auth-btn');
        const syncBtn = document.getElementById('gcal-sync-btn');

        if (authBtn) {
            authBtn.addEventListener('click', () => this.handleAuthClick());
        }

        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncAllTasks());
        }
    }

    handleAuthClick() {
        if (!this.gapiInited || !this.gisInited) {
            this.updateStatus('Google Calendar API not ready. Please check your credentials.', 'error');
            return;
        }

        if (gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Already signed in
            this.updateStatus('Already connected to Google Calendar', 'success');
        }
    }

    isSignedIn() {
        return gapi && gapi.client && gapi.client.getToken() !== null;
    }

    updateSigninStatus() {
        const authBtn = document.getElementById('gcal-auth-btn');
        const syncBtn = document.getElementById('gcal-sync-btn');

        if (this.isSignedIn()) {
            authBtn.style.display = 'none';
            syncBtn.style.display = 'inline-block';
            this.updateStatus('Connected to Google Calendar', 'success');
        } else {
            authBtn.style.display = 'inline-block';
            syncBtn.style.display = 'none';
            this.updateStatus('Not connected', 'info');
        }
    }

    updateStatus(message, type) {
        const statusEl = document.getElementById('gcal-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.style.color = type === 'error' ? '#f44336' :
                                   type === 'success' ? '#4caf50' : 'white';
        }
    }

    async createEvent(task) {
        if (!this.isSignedIn()) {
            console.log('Not signed in to Google Calendar');
            return null;
        }

        if (!task.date) {
            console.log('Task has no date, skipping calendar event');
            return null;
        }

        try {
            const event = this.taskToGoogleEvent(task);

            const response = await gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': event
            });

            console.log('Event created:', response.result.htmlLink);

            // Update task with event ID
            if (window.taskManager) {
                window.taskManager.updateTaskWithGcalId(task.id, response.result.id);
            }

            this.updateStatus('Task added to Google Calendar', 'success');
            return response.result.id;
        } catch (error) {
            console.error('Error creating calendar event:', error);
            this.updateStatus('Error adding to calendar', 'error');
            return null;
        }
    }

    async updateEvent(task) {
        if (!this.isSignedIn() || !task.gcalEventId) {
            return;
        }

        try {
            const event = this.taskToGoogleEvent(task);

            await gapi.client.calendar.events.update({
                'calendarId': 'primary',
                'eventId': task.gcalEventId,
                'resource': event
            });

            this.updateStatus('Calendar event updated', 'success');
        } catch (error) {
            console.error('Error updating calendar event:', error);
            this.updateStatus('Error updating calendar', 'error');
        }
    }

    async deleteEvent(eventId) {
        if (!this.isSignedIn()) {
            return;
        }

        try {
            await gapi.client.calendar.events.delete({
                'calendarId': 'primary',
                'eventId': eventId
            });

            this.updateStatus('Removed from Google Calendar', 'success');
        } catch (error) {
            console.error('Error deleting calendar event:', error);
            this.updateStatus('Error removing from calendar', 'error');
        }
    }

    async syncAllTasks() {
        if (!this.isSignedIn()) {
            this.updateStatus('Please connect to Google Calendar first', 'error');
            return;
        }

        const tasks = window.taskManager ? window.taskManager.tasks : [];
        let synced = 0;

        for (const task of tasks) {
            if (!task.gcalEventId && task.date && !task.completed) {
                await this.createEvent(task);
                synced++;
            }
        }

        this.updateStatus(`Synced ${synced} tasks to Google Calendar`, 'success');
    }

    taskToGoogleEvent(task) {
        const categoryColors = {
            courses: '1',  // Blue
            work: '11',    // Red
            career: '3',   // Purple
            research: '10', // Green
            fun: '4'       // Orange
        };

        let startDateTime, endDateTime;

        if (task.time) {
            // Task has specific time
            const [hours, minutes] = task.time.split(':');
            const startDate = new Date(task.date);
            startDate.setHours(parseInt(hours), parseInt(minutes), 0);

            const endDate = new Date(startDate);
            endDate.setHours(startDate.getHours() + 1); // Default 1 hour duration

            startDateTime = startDate.toISOString();
            endDateTime = endDate.toISOString();
        } else {
            // All-day event
            startDateTime = task.date;
            const endDate = new Date(task.date);
            endDate.setDate(endDate.getDate() + 1);
            endDateTime = endDate.toISOString().split('T')[0];
        }

        const event = {
            'summary': task.name,
            'description': task.notes || '',
            'colorId': categoryColors[task.category] || '1',
        };

        if (task.time) {
            event.start = {
                'dateTime': startDateTime,
                'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
            };
            event.end = {
                'dateTime': endDateTime,
                'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        } else {
            event.start = { 'date': task.date };
            event.end = { 'date': endDateTime };
        }

        return event;
    }

    async importFromCalendar(startDate, endDate) {
        if (!this.isSignedIn()) {
            this.updateStatus('Please connect to Google Calendar first', 'error');
            return [];
        }

        try {
            const response = await gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': startDate || new Date().toISOString(),
                'timeMax': endDate,
                'showDeleted': false,
                'singleEvents': true,
                'orderBy': 'startTime'
            });

            const events = response.result.items;
            console.log('Imported events:', events);

            // You could convert these to tasks if needed
            return events;
        } catch (error) {
            console.error('Error importing calendar events:', error);
            this.updateStatus('Error importing from calendar', 'error');
            return [];
        }
    }
}

// Initialize Google Calendar Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if credentials are set
    window.gcalManager = new GoogleCalendarManager();
});
