const { createHash } = require('crypto');

// Google Calendar color IDs:
// https://developers.google.com/calendar/api/v3/reference/colors/get
const CALENDAR_COLORS = {
  TOMATO: '11',    // Red for inspections
  BANANA: '5',     // Yellow
  SAGE: '2',       // Green
  BLUEBERRY: '9',  // Blue
  GRAPE: '3',      // Purple
  TANGERINE: '6',  // Orange
  PEACOCK: '7',    // Turquoise
  GRAPHITE: '8',   // Gray
};

// Colors available for automatic assignment (excluding special colors)
const ASSIGNABLE_COLORS = [
  CALENDAR_COLORS.BANANA,
  CALENDAR_COLORS.SAGE,
  CALENDAR_COLORS.BLUEBERRY,
  CALENDAR_COLORS.GRAPE,
  CALENDAR_COLORS.TANGERINE,
  CALENDAR_COLORS.PEACOCK
];

// Store user info along with their color
const USER_COLORS = new Map();

// Deterministically assign a color based on user ID
function assignUserColor(userId) {
  const hash = createHash('md5').update(userId).digest('hex');
  const numberFromHash = parseInt(hash.substring(0, 8), 16);
  const colorIndex = numberFromHash % ASSIGNABLE_COLORS.length;
  return ASSIGNABLE_COLORS[colorIndex];
}

function getUserColor(userId) {
  if (!USER_COLORS.has(userId)) {
    const assignedColor = assignUserColor(userId);
    USER_COLORS.set(userId, {
      colorId: assignedColor,
      assignedAt: new Date()
    });
  }
  return USER_COLORS.get(userId).colorId;
}

function getInspectionColor() {
  return CALENDAR_COLORS.TOMATO;
}

function setUserColor(userId, colorId) {
  USER_COLORS.set(userId, {
    colorId,
    assignedAt: new Date(),
    manual: true
  });
}

// New function to list all user color assignments
function listUserColors() {
  const assignments = [];
  for (const [userId, data] of USER_COLORS.entries()) {
    const colorName = Object.entries(CALENDAR_COLORS)
      .find(([_, id]) => id === data.colorId)[0]
      .toLowerCase();
    
    const assignmentType = data.manual ? '(manually set)' : '(auto-assigned)';
    assignments.push(`<@${userId}>: ${colorName} ${assignmentType}`);
  }
  return assignments;
}

module.exports = {
  CALENDAR_COLORS,
  setUserColor,
  getUserColor,
  getInspectionColor,
  listUserColors
};