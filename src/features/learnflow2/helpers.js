import { COURSES } from '../../data/courses';

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function timeToMinutes(value = '00:00') {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

export function getScheduleStatus(item) {
  const now = new Date();
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const startMinute = timeToMinutes(item.time);
  const endMinute = startMinute + item.dur;

  if (currentMinute >= startMinute && currentMinute < endMinute) return 'now';
  if (currentMinute < startMinute) return 'upcoming';
  return 'past';
}

export function groupNavItems(items) {
  return Object.entries(
    items.reduce((result, item) => {
      if (!result[item.group]) result[item.group] = [];
      result[item.group].push(item);
      return result;
    }, {}),
  );
}

export function renderTestCaseHtml(problem) {
  return (
    problem.testcases
      ?.map(
        (testcase, index) =>
          `<div><strong>Bộ kiểm thử ${index + 1}</strong><div>${testcase.input.replace(/\n/g, '<br />')}</div><div>Kỳ vọng: ${testcase.expected}</div></div>`,
      )
      .join('<hr />') || '<div>Chưa có bộ kiểm thử.</div>'
  );
}

export function sortByCreatedAtDesc(items) {
  return [...items].sort((left, right) => (right.createdAt || 0) - (left.createdAt || 0));
}

export function sortSchedule(items) {
  return [...items].sort((left, right) => timeToMinutes(left.time) - timeToMinutes(right.time));
}

export function mapValuesToArray(value, transform = (item) => item) {
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).map(transform);
}

export function buildCourseCatalog() {
  return COURSES;
}

export function getCourseProgress(course, lessonProgress) {
  const progressMap = lessonProgress[course.id] || {};
  const done = Object.values(progressMap).filter(Boolean).length;
  const total = course.lessons.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
