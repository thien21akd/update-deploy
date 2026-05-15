/**
 * User Profile Service
 * Manage user profiles and public information
 */

import { ref, update, get, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

/**
 * Get user's public profile
 */
export async function getPublicProfile(uid) {
  const snapshot = await get(ref(db, `users/${uid}/profile`));
  return snapshot.val() || null;
}

/**
 * Subscribe to user profile real-time updates
 */
export function subscribeToProfile(uid, callback) {
  const unsubscribe = onValue(ref(db, `users/${uid}/profile`), (snapshot) => {
    callback(snapshot.val());
  });
  return unsubscribe;
}

/**
 * Update user profile
 */
export async function updateProfile(uid, profileData) {
  const allowedFields = [
    'displayName',
    'bio',
    'company',
    'location',
    'website',
    'preferredLanguages',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (field in profileData) {
      updates[field] = profileData[field];
    }
  });

  updates.updatedAt = Date.now();

  await update(ref(db, `users/${uid}/profile`), updates);
  return updates;
}

/**
 * Upload profile photo (URL)
 */
export async function updateProfilePhoto(uid, photoUrl) {
  await update(ref(db, `users/${uid}/profile`), {
    photoUrl,
    updatedAt: Date.now(),
  });
}

/**
 * Get user statistics
 */
export async function getUserStats(uid) {
  const snapshot = await get(ref(db, `users/${uid}`));
  const userData = snapshot.val() || {};

  const problemStatuses = userData.problemStatuses || {};
  const submissions = userData.submissions || {};
  const solvedCount = Object.values(problemStatuses).filter((s) => s === 'done').length;

  return {
    solvedCount,
    totalSubmissions: Object.keys(submissions).length,
    avgSolveTime: calculateAvgSolveTime(submissions),
    preferredLanguage: getUserPreferredLanguage(submissions),
  };
}

/**
 * Calculate average solve time from submissions
 */
function calculateAvgSolveTime(submissions) {
  const values = Object.values(submissions);
  if (values.length === 0) return 0;

  const totalTime = values.reduce((sum, sub) => sum + (sub.time || 0), 0);
  return Math.round(totalTime / values.length);
}

/**
 * Get user's most used language
 */
function getUserPreferredLanguage(submissions) {
  const languages = {};
  Object.values(submissions).forEach((sub) => {
    const lang = sub.lang || 'unknown';
    languages[lang] = (languages[lang] || 0) + 1;
  });

  return Object.keys(languages).reduce((a, b) =>
    languages[a] > languages[b] ? a : b
  ) || 'python';
}

/**
 * Search users by displayName
 */
export async function searchUsers(query) {
  const snapshot = await get(ref(db, 'users'));
  if (!snapshot.exists()) return [];

  const users = Object.entries(snapshot.val())
    .filter(([, data]) => data.profile?.displayName)
    .filter(([, data]) =>
      data.profile.displayName.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 10) // limit results
    .map(([uid, data]) => ({
      uid,
      ...data.profile,
    }));

  return users;
}
