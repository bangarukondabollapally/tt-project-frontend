export const STATUSES = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const DUE_SOON_DAYS = 7;

// Dates are parsed by hand because new Date('YYYY-MM-DD') reads them as UTC,
// which shows the previous day in time zones behind UTC.
function parseDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function daysBetween(from, to) {
  const toUtcDay = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((toUtcDay(to) - toUtcDay(from)) / 86400000);
}

function pluralizeDays(count) {
  return `${count} ${count === 1 ? 'day' : 'days'}`;
}

export function formatDate(isoDate) {
  return parseDate(isoDate).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getDeadlineInfo(project, today = new Date()) {
  if (project.status === 'COMPLETED') {
    return { tone: 'done', label: 'Completed' };
  }
  const days = daysBetween(today, parseDate(project.deadline));
  if (days < 0) {
    return { tone: 'overdue', label: `Overdue by ${pluralizeDays(-days)}` };
  }
  if (days === 0) {
    return { tone: 'soon', label: 'Due today' };
  }
  return { tone: days <= DUE_SOON_DAYS ? 'soon' : 'upcoming', label: `Due in ${pluralizeDays(days)}` };
}

export function validateProject(values) {
  const errors = {};
  if (!values.name.trim()) {
    errors.name = 'Project name is required';
  } else if (values.name.trim().length > 150) {
    errors.name = 'Project name must be 150 characters or fewer';
  }
  if (!values.description.trim()) {
    errors.description = 'Description is required';
  } else if (values.description.trim().length > 2000) {
    errors.description = 'Description must be 2000 characters or fewer';
  }
  if (!values.startDate) {
    errors.startDate = 'Start date is required';
  }
  if (!values.deadline) {
    errors.deadline = 'Deadline is required';
  } else if (values.startDate && values.deadline < values.startDate) {
    errors.deadline = 'Deadline cannot be earlier than the start date';
  }
  if (!values.status) {
    errors.status = 'Status is required';
  }
  return errors;
}
