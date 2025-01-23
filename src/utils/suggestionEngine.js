const { DateTime } = require('luxon');

function suggestMeetingTimes(startDate, duration = 60) {
  const start = DateTime.fromJSDate(startDate).startOf('day');
  const suggestions = [];

  // Suggest times during working hours (9 AM - 5 PM)
  for (let hour = 9; hour <= 16; hour++) {
    const timeSlot = start.set({ hour });
    
    // Skip if it's in the past
    if (timeSlot < DateTime.now()) continue;

    suggestions.push({
      start: timeSlot.toJSDate(),
      end: timeSlot.plus({ minutes: duration }).toJSDate()
    });
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
}

function formatSuggestions(suggestions) {
  return suggestions
    .map((slot, index) => {
      const time = DateTime.fromJSDate(slot.start);
      return `${index + 1}. ${time.toLocaleString(DateTime.TIME_SIMPLE)}`;
    })
    .join('\n');
}

module.exports = { suggestMeetingTimes, formatSuggestions };