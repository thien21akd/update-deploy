export const DEFAULT_NOTIFICATION_SETTINGS = {
  study: true,
  task: true,
  streak: true,
};
export const DEFAULT_POMODORO_SETTINGS = {
  focus: 25,
  short: 5,
  long: 15,
  sound: true,
};
export const EMPTY_ACTIVITY = [0, 0, 0, 0, 0, 0, 0];

export function createEmptyUserTree({ email = "", user = null } = {}) {
  const now = Date.now();
  const displayName =
    user?.displayName || email.split("@")[0] || "Người dùng LearnFlow";

  return {
    profile: {
      displayName,
      email,
      role: "user",
      createdAt: now,
      updatedAt: now,
    },
    trackedCourses: {},
    customCourses: {},
    courseProgress: {},
    tasks: {},
    notes: {},
    schedule: {},
    problemStatuses: {},
    submissions: {},
    stats: {
      score: 0,
      streak: 0,
      daysActive: 0,
      lessonsWeek: 0,
      activity: EMPTY_ACTIVITY,
      todayMs: 0,
      thisWeekMs: 0,
      thisMonthMs: 0,
      lastResetDate: new Date(now).toDateString(),
      lastLoginDate: "",
      lastActivitySyncAt: now,
    },
    pomodoro: {
      settings: DEFAULT_POMODORO_SETTINGS,
      stats: {
        count: 0,
        totalSec: 0,
        updatedAt: now,
      },
    },
    settings: {
      notifications: DEFAULT_NOTIFICATION_SETTINGS,
    },
    meta: {
      schemaVersion: 2,
      seededAt: now,
    },
  };
}
