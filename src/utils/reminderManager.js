const schedule = require('node-schedule');

class ReminderManager {
  constructor() {
    this.reminders = new Map();
  }

  scheduleReminder(eventId, eventDetails, channelId, say) {
    // Schedule 15 minutes before
    const reminderTime = new Date(eventDetails.start.getTime() - 15 * 60000);
    
    const job = schedule.scheduleJob(reminderTime, async () => {
      await say({
        channel: channelId,
        text: `⏰ Reminder: *${eventDetails.title}* starts in 15 minutes!`
      });
    });

    this.reminders.set(eventId, job);
  }

  cancelReminder(eventId) {
    const job = this.reminders.get(eventId);
    if (job) {
      job.cancel();
      this.reminders.delete(eventId);
    }
  }
}

module.exports = new ReminderManager();