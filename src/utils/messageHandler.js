const { parseEvent } = require('./eventParser');
const { addToCalendar } = require('./calendar');
const { suggestMeetingTimes, formatSuggestions } = require('./suggestionEngine');
const reminderManager = require('./reminderManager');
const { formatDateTime } = require('./timeUtils');
const { CALENDAR_COLORS, setUserColor, listUserColors } = require('./colorManager');
const { addExternalAttendee, formatAttendeeList } = require('./attendeeManager');

async function handleScheduleCommand(text, say, threadTs, channelId, userId) {
  try {
    console.log('Parsing event text:', text);
    const isInspection = text.toLowerCase().includes('inspection');
    const eventDetails = parseEvent(text);
    
    if (!eventDetails) {
      console.log('Failed to parse event details');
      const suggestions = suggestMeetingTimes(new Date());
      return await say({
        text: "I couldn't understand those details. Here are some suggested times for today:\n" +
              formatSuggestions(suggestions) +
              "\n\nTry: `!schedule Team Meeting at [time]`",
        thread_ts: threadTs
      });
    }

    console.log('Event details parsed:', eventDetails);
    const calendarEvent = await addToCalendar({
      ...eventDetails,
      userId,
      isInspection
    });
    
    reminderManager.scheduleReminder(
      calendarEvent.id,
      eventDetails,
      channelId,
      say
    );
    
    await say({
      text: `✅ I've scheduled that for you:\n*${eventDetails.title}*\nDate: ${formatDateTime(eventDetails.start)}\nEvent ID: \`${calendarEvent.id}\`\nCalendar Link: ${calendarEvent.htmlLink}\n\n_I'll remind the channel 15 minutes before the meeting starts._`,
      thread_ts: threadTs
    });
  } catch (error) {
    console.error('Error in handleScheduleCommand:', error);
    await say({
      text: "I ran into an error while scheduling. Please try again.",
      thread_ts: threadTs
    });
  }
}

async function handleHelpCommand(say, threadTs) {
  const availableColors = Object.keys(CALENDAR_COLORS).join(', ').toLowerCase();
  
  await say({
    text: "Here's what I can do:\n" +
          "• `!schedule [event] [time]` - Add an event to the calendar\n" +
          "• `!invite [event-id] [email]` - Invite an external person to an event\n" +
          "• `!suggest [date?]` - Get meeting time suggestions\n" +
          "• `!setcolor [color]` - Set your preferred event color\n" +
          "• `!colors` - Show all user color assignments\n" +
          "\nAvailable colors: " + availableColors + "\n" +
          "\nNotes:\n" +
          "• Events with 'inspection' in the title will automatically be colored red\n" +
          "• When an event is created, you'll get its ID to use with the !invite command\n" +
          "\nExamples:\n" +
          "• `!schedule Team Meeting tomorrow at 2pm`\n" +
          "• `!schedule Inspection at Site A on Monday 10am-11am`\n" +
          "• `!suggest tomorrow`\n" +
          "• `!setcolor banana`\n" +
          "• `!invite abc123def456 client@example.com`",
    thread_ts: threadTs
  });
}

async function handleSuggestCommand(dateText, say, threadTs) {
  try {
    const date = dateText ? parseEvent(dateText)?.start : new Date();
    const suggestions = suggestMeetingTimes(date);
    
    await say({
      text: "Here are some suggested meeting times:\n" + formatSuggestions(suggestions),
      thread_ts: threadTs
    });
  } catch (error) {
    console.error('Error:', error);
    await say({
      text: "I couldn't generate suggestions. Please try again with a different date.",
      thread_ts: threadTs
    });
  }
}

async function handleSetColorCommand(text, say, threadTs, userId) {
  const colorName = text.toUpperCase();
  const colorId = CALENDAR_COLORS[colorName];
  
  if (!colorId) {
    const availableColors = Object.keys(CALENDAR_COLORS).join(', ').toLowerCase();
    await say({
      text: `Invalid color. Available colors are: ${availableColors}`,
      thread_ts: threadTs
    });
    return;
  }

  setUserColor(userId, colorId);
  await say({
    text: `Your calendar events will now use the ${colorName.toLowerCase()} color!`,
    thread_ts: threadTs
  });
}

async function handleInviteCommand(text, say, threadTs) {
  try {
    const [eventId, email] = text.trim().split(/\s+/);
    
    if (!eventId || !email) {
      await say({
        text: "Please provide both the event ID and email address.\nExample: `!invite abc123def456 client@example.com`",
        thread_ts: threadTs
      });
      return;
    }

    const updatedEvent = await addExternalAttendee(eventId, email);
    
    await say({
      text: `✅ Invitation sent to ${email}!\n\nCurrent attendees:\n${formatAttendeeList(updatedEvent.attendees)}`,
      thread_ts: threadTs
    });
  } catch (error) {
    console.error('Error:', error);
    await say({
      text: error.message === 'Invalid email format' 
        ? "Please provide a valid email address."
        : "I couldn't send the invitation. Please check the event ID and try again.",
      thread_ts: threadTs
    });
  }
}

module.exports = {
  handleScheduleCommand,
  handleHelpCommand,
  handleSuggestCommand,
  handleSetColorCommand,
  handleInviteCommand
};