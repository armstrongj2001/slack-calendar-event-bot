const chrono = require('chrono-node');

function parseEvent(text) {
  try {
    // Parse the date and time from the text
    const parsed = chrono.parse(text);
    
    if (parsed.length === 0) return null;
    
    // Get the first parsed result
    const parsedDate = parsed[0];
    
    // Extract the event title by removing the date/time portion
    let title = text
      .replace(parsedDate.text, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      title: title || 'Untitled Event',
      start: parsedDate.start.date(),
      end: parsedDate.end ? parsedDate.end.date() : new Date(parsedDate.start.date().getTime() + 60 * 60 * 1000), // Default 1 hour duration
    };
  } catch (error) {
    console.error('Error parsing event:', error);
    return null;
  }
}

module.exports = { parseEvent }; // Export as an object