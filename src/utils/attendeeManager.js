const { addAttendeeToEvent } = require('./calendar');

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Format attendee list for display
function formatAttendeeList(attendees) {
  return attendees
    .map(attendee => `• ${attendee.email}`)
    .join('\n');
}

async function addExternalAttendee(eventId, email) {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }
  return await addAttendeeToEvent(eventId, email);
}

module.exports = {
  isValidEmail,
  formatAttendeeList,
  addExternalAttendee
};