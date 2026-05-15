import { readValue, removeValue, setValue, userPath } from './databaseService';

export async function createCustomCourse(uid, course) {
  await setValue(userPath(uid, `customCourses/${course.id}`), {
    ...course,
    createdAt: course.createdAt || Date.now(),
  });

  await trackCourse(uid, course, { source: 'custom' });
}

export async function trackCourse(uid, course, options = {}) {
  const existing = await readValue(userPath(uid, `trackedCourses/${course.id}`));
  const now = Date.now();

  await setValue(userPath(uid, `trackedCourses/${course.id}`), {
    courseId: course.id,
    source: options.source || (options.isCustom ? 'custom' : 'catalog'),
    title: course.name,
    category: course.category,
    totalLessons: course.totalLessons || course.lessons?.length || 0,
    startedAt: existing?.startedAt || now,
    updatedAt: now,
    status: 'active',
  });
}

export async function untrackCourse(uid, courseId) {
  await removeValue(userPath(uid, `trackedCourses/${courseId}`));
}

export async function setLessonProgress(uid, courseId, lessonIndex, nextValue) {
  await setValue(userPath(uid, `courseProgress/${courseId}/${lessonIndex}`), nextValue);
}
