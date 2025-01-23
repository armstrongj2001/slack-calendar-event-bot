const { google } = require('googleapis');
const { getUserColor, getInspectionColor } = require('./colorManager');

// Create auth client with impersonation
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
  process.env.GOOGLE_WORKSPACE_ADMIN // Email of the admin to impersonate
);

const calendar = google.calendar({ version: 'v3', auth });

async function addToCalendar({ title, start, end, userId, isInspection = false, attendees = [] }) {
  try {
    const event = {
      summary: title,
      start: {
        dateTime: start.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'UTC',
      },
      colorId: isInspection ? getInspectionColor() : getUserColor(userId),
      attendees: attendees.map(email => ({ email }))
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
      sendUpdates: 'all'
    });

    return response.data;
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    throw error;
  }
}

async function addAttendeeToEvent(eventId, email) {
  try {
    // First get the current event
    const event = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId
    });

    // Add the new attendee
    const currentAttendees = event.data.attendees || [];
    const updatedAttendees = [...currentAttendees, { email }];

    // Update the event
    const response = await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId,
      resource: {
        attendees: updatedAttendees
      },
      sendUpdates: 'all'
    });

    return response.data;
  } catch (error) {
    console.error('Error adding attendee to event:', error);
    throw error;
  }
}

module.exports = { addToCalendar, addAttendeeToEvent };