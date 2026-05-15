import { createEmptyUserTree } from "../constants/firebaseDefaults";
import {
  mapValuesToArray,
  sortByCreatedAtDesc,
  sortSchedule,
} from "../features/learnflow2/helpers";
import {
  readValue,
  removeValue,
  removeValueWithAuthToken,
  setValue,
  updateValue,
} from "./databaseService";
import {
  createUser as createUserRecord,
  deleteUser as deleteUserRecord,
  ensureUserExists,
  getUser,
  getUserPath,
  subscribeUser,
  updateUser,
} from "./dbService";
import { syncLeaderboardEntry } from "./leaderboardService";

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

export function userEmailIndexKey(email) {
  return normalizeEmail(email).replace(
    /[%.[\]#$\/]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function userEmailIndexPath(email) {
  return `userEmails/${userEmailIndexKey(email)}`;
}

function normalizeUserTree(rawUserData) {
  const source = rawUserData || {};

  return {
    raw: source,
    profile: source.profile || null,
    trackedCourses: sortByCreatedAtDesc(
      mapValuesToArray(source.trackedCourses),
    ),
    trackedCoursesMap: source.trackedCourses || {},
    tasks: sortByCreatedAtDesc(mapValuesToArray(source.tasks)),
    schedule: sortSchedule(mapValuesToArray(source.schedule)),
    notes: sortByCreatedAtDesc(mapValuesToArray(source.notes)),
    customCourses: sortByCreatedAtDesc(mapValuesToArray(source.customCourses)),
    courseProgress: source.courseProgress || {},
    problemStatuses: source.problemStatuses || {},
    submissions: sortByCreatedAtDesc(mapValuesToArray(source.submissions)),
    stats: source.stats || null,
    pomodoro: source.pomodoro || null,
    settings: source.settings || null,
    meta: source.meta || null,
  };
}

export async function readUserEmailIndex(email) {
  return readValue(userEmailIndexPath(email));
}

export async function setUserEmailIndex(user) {
  if (!user?.email) return;

  const existingIndex = await readUserEmailIndex(user.email).catch(() => null);

  if (existingIndex?.uid && existingIndex.uid !== user.uid) {
    console.warn(
      "[auth:sync] removing stale email index before writing current user",
      {
        email: normalizeEmail(user.email),
        staleUid: existingIndex.uid,
        currentUid: user.uid,
      },
    );
    await removeUserEmailIndex(user.email);
  }

  await setValue(userEmailIndexPath(user.email), {
    uid: user.uid,
    email: normalizeEmail(user.email),
    updatedAt: Date.now(),
  });
}

export async function removeUserEmailIndex(email) {
  if (!email) return;
  await removeValue(userEmailIndexPath(email));
}

async function syncUserSecondaryIndexes({ uid, email, profile, score }) {
  const results = await Promise.allSettled([
    email ? setUserEmailIndex({ uid, email }) : Promise.resolve(),
    syncLeaderboardEntry({ uid, profile, score: score || 0 }),
  ]);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.warn("[auth:sync] secondary DB sync failed", {
        uid,
        target: index === 0 ? "userEmails" : "leaderboard",
        code: result.reason?.code,
        message: result.reason?.message,
      });
    }
  });
}

export async function createUserDatabaseRecord(user) {
  const uid = user.uid;
  const seeded = createEmptyUserTree({
    email: user.email || "",
    user,
  });

  console.info("[auth:sync] create user database record", {
    uid,
    path: getUserPath(uid),
  });
  await createUserRecord(uid, seeded);

  // Secondary indexes should never make registration fail. The authoritative
  // application profile is /users/{uid}; these indexes can be retried later.
  await syncUserSecondaryIndexes({
    uid,
    email: user.email,
    profile: seeded.profile,
    score: 0,
  });

  return seeded;
}

export async function ensureUserDataReady(user) {
  const uid = user.uid;

  const existing = await ensureUserExists(uid, () =>
    createEmptyUserTree({
      email: user.email || "",
      user,
    }),
  );

  const updates = {};
  const now = Date.now();

  if (!existing.profile?.displayName && user.displayName) {
    updates.profile = {
      ...(existing.profile || {}),
      displayName: user.displayName,
      email: user.email || existing.profile?.email || "",
      updatedAt: now,
    };
  }

  if (!existing.profile?.email && user.email) {
    updates.profile = {
      ...(updates.profile || existing.profile || {}),
      email: user.email,
      updatedAt: now,
    };
  }

  if (!existing.meta?.schemaVersion) {
    updates.meta = {
      ...(existing.meta || {}),
      schemaVersion: 2,
      seededAt: existing.meta?.seededAt || now,
    };
  }

  if (Object.keys(updates).length) {
    await updateUser(uid, updates);
  }

  const latest = (await getUser(uid)) || existing;
  await syncUserSecondaryIndexes({
    uid,
    email: user.email,
    profile: latest.profile || updates.profile || existing.profile,
    score: latest.stats?.score || existing.stats?.score || 0,
  });

  return latest;
}

export function subscribeToUserData(uid, callback, errorCallback) {
  return subscribeUser(
    uid,
    (snapshot) => {
      // Normalize in the service so components only consume a stable data shape.
      callback(normalizeUserTree(snapshot.val()));
    },
    errorCallback,
  );
}

export async function updateUserProfile(uid, value) {
  await updateValue(getUserPath(uid, "profile"), {
    ...value,
    updatedAt: Date.now(),
  });
}

export async function updateUserStats(uid, updater) {
  const stats = (await readValue(getUserPath(uid, "stats"))) || {};
  const nextValue = typeof updater === "function" ? updater(stats) : updater;
  await setValue(getUserPath(uid, "stats"), nextValue);
  return nextValue;
}

export async function updateUserNotifications(uid, notifications) {
  await setValue(getUserPath(uid, "settings/notifications"), notifications);
}

export async function updateUserPomodoroSettings(uid, settings) {
  await setValue(getUserPath(uid, "pomodoro/settings"), settings);
}

export async function resetUserData(uid, user) {
  const seeded = createEmptyUserTree({ email: user.email || "", user });
  await createUserRecord(uid, seeded);
  await syncUserSecondaryIndexes({
    uid,
    email: user.email,
    profile: seeded.profile,
    score: 0,
  });
}

export async function exportUserData(uid) {
  const value = await getUser(uid);
  return value || {};
}

export async function deleteUserData(uid, email, authToken) {
  const remove = authToken
    ? (path) => removeValueWithAuthToken(path, authToken)
    : (path) => removeValue(path);

  await Promise.allSettled([
    authToken ? deleteUserRecord(uid, authToken) : deleteUserRecord(uid),
    remove(`leaderboard/${uid}`),
    email ? remove(userEmailIndexPath(email)) : Promise.resolve(),
  ]).then((results) => {
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("[auth:delete] DB cleanup target failed", {
          uid,
          target: ["users", "leaderboard", "userEmails"][index],
          code: result.reason?.code,
          message: result.reason?.message,
        });
      }
    });
  });
}

export async function deleteUserNode(uid, child) {
  await removeValue(getUserPath(uid, child));
}
