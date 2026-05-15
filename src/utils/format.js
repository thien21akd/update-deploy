export function padNumber(value) {
  return String(value).padStart(2, '0');
}

export function formatClock(date) {
  return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}:${padNumber(
    date.getSeconds(),
  )} - ${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDateVi(value) {
  if (!value) return 'Chưa có hạn';
  return new Date(value).toLocaleDateString('vi-VN');
}

export function formatHoursMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function formatDurationFromMs(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
}

export function formatMinutesToClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${padNumber(minutes)}:${padNumber(seconds)}`;
}
