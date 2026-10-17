const pad = (n) => String(n).padStart(2, '0');

export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Weeks run Monday → Sunday.
export function startOfWeek(date = new Date()) {
  const d = startOfDay(date);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Local-date key (YYYY-MM-DD) used to group tasks by day.
export const dayKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// ISO string → value for <input type="datetime-local"> (local time).
export function toInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// <input type="datetime-local"> value → ISO string (or null).
export function fromInputValue(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function formatDeadline(iso) {
  if (!iso) return 'No deadline';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDay(date) {
  return new Date(date).toLocaleDateString('en-IN', { weekday: 'long' });
}

export function formatShortDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export function formatWeekRange(start) {
  const end = addDays(start, 6);
  const opts = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('en-IN', opts)} – ${end.toLocaleDateString('en-IN', {
    ...opts,
    year: 'numeric',
  })}`;
}
