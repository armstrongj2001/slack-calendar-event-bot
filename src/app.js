// Load environment variables from .env file
require('dotenv').config();

const { App } = require('@slack/bolt');
const { 
  handleScheduleCommand, 
  handleHelpCommand,
  handleSuggestCommand,
  handleSetColorCommand,
  handleInviteCommand
} = require('./utils/messageHandler');
const { isAllowedChannel } = require('./utils/channelValidator');
const { addToCalendar } = require('./utils/calendar');

// Add debug logging
console.log('Starting app with configuration:');
console.log('Bot token exists:', !!process.env.SLACK_BOT_TOKEN);
console.log('Signing secret exists:', !!process.env.SLACK_SIGNING_SECRET);
console.log('Allowed channels:', process.env.SLACK_ALLOWED_CHANNELS);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  port: process.env.PORT || 3000
});

// Listen for messages in any channel
app.message(async ({ message, say }) => {
  console.log('Received message event:', {
    channel: message.channel,
    text: message.text,
    user: message.user,
    ts: message.ts
  });
  
  // Guard clause for undefined messages
  if (!message.text || !message.user) {
    console.log('Skipping message processing - undefined text or user');
    return;
  }

  if (!isAllowedChannel(message.channel)) {
    console.log('Channel not allowed:', message.channel);
    return;
  }
  
  const text = message.text.toLowerCase();
  console.log('Processing command:', text);
  
  if (text.startsWith('!schedule')) {
    const eventText = message.text.slice(9).trim();
    await handleScheduleCommand(eventText, say, message.ts, message.channel, message.user);
  } 
  else if (text === '!help') {
    console.log('Handling help command');
    await handleHelpCommand(say, message.ts);
  }
  else if (text.startsWith('!suggest')) {
    const dateText = message.text.slice(9).trim();
    await handleSuggestCommand(dateText, say, message.ts);
  }
  else if (text.startsWith('!setcolor')) {
    const colorName = message.text.slice(9).trim();
    await handleSetColorCommand(colorName, say, message.ts, message.user);
  }
  else if (text.startsWith('!invite')) {
    const inviteText = message.text.slice(8).trim();
    await handleInviteCommand(inviteText, say, message.ts);
  }
  else if (text.includes('schedule') || text.includes('meeting')) {
    await say({
      text: "I noticed you mentioned scheduling. Use `!schedule` to add events to the calendar, or type `!help` for more information.",
      thread_ts: message.ts
    });
  }
});

// Start the app
(async () => {
  try {
    await app.start();
    console.log('⚡️ Slack Bolt app is running!');
  } catch (error) {
    console.error('Failed to start app:', error);
  }
})();