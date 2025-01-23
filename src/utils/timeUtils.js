const { DateTime } = require('luxon');

function parseTimeWindow(startTime, duration = 60) {
  const start = DateTime.fromJSDate(startTime);
  const end = start.plus({ minutes: duration });
  
  return {
    start: start.toJSDate(),
    end: end.toJSDate()
  };
}

function formatDateTime(date) {
  return DateTime.fromJSDate(date).toLocaleString(DateTime.DATETIME_FULL);
}

module.exports = { parseTimeWindow, formatDateTime };