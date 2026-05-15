/**
 * Follow Service
 * Manage following/follower relationships and activity feed
 */

import { ref, set, remove, onValue, get, update } from 'firebase/database';
import { db } from '../lib/firebase';

/**
 * Follow a user
 */
export async function followUser(currentUid, targetUid) {
  if (currentUid === targetUid) {
    throw new Error('Không thể follow chính mình');
  }

  const now = Date.now();

  // Add to following list
  await set(ref(db, `users/${currentUid}/following/${targetUid}`), {
    createdAt: now,
  });

  // Add to followers list (on target user)
  await set(ref(db, `users/${targetUid}/followers/${currentUid}`), {
    createdAt: now,
  });

  // Increment counters
  await update(ref(db, `users/${currentUid}/profile`), {
    followingCount: increment(1),
  });

  await update(ref(db, `users/${targetUid}/profile`), {
    followerCount: increment(1),
  });

  // Log activity
  await addActivity(targetUid, 'followed_user', {
    followerUid: currentUid,
    followerName: (await getDisplayName(currentUid)) || 'Anonymous',
  });
}

/**
 * Unfollow a user
 */
export async function unfollowUser(currentUid, targetUid) {
  // Remove from following
  await remove(ref(db, `users/${currentUid}/following/${targetUid}`));

  // Remove from followers
  await remove(ref(db, `users/${targetUid}/followers/${currentUid}`));

  // Decrement counters
  await update(ref(db, `users/${currentUid}/profile`), {
    followingCount: increment(-1),
  });

  await update(ref(db, `users/${targetUid}/profile`), {
    followerCount: increment(-1),
  });
}

/**
 * Check if user is following someone
 */
export async function isFollowing(uid, targetUid) {
  const snapshot = await get(ref(db, `users/${uid}/following/${targetUid}`));
  return snapshot.exists();
}

/**
 * Get user's following list
 */
export async function getFollowing(uid) {
  const snapshot = await get(ref(db, `users/${uid}/following`));
  if (!snapshot.exists()) return [];

  return Object.keys(snapshot.val());
}

/**
 * Get user's followers
 */
export async function getFollowers(uid) {
  const snapshot = await get(ref(db, `users/${uid}/followers`));
  if (!snapshot.exists()) return [];

  return Object.keys(snapshot.val());
}

/**
 * Subscribe to activity feed
 * Shows recent activities from followed users
 */
export function subscribeToActivityFeed(uid, callback) {
  const unsubscribe = onValue(ref(db, `users/${uid}/activities`), async (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const activities = Object.entries(snapshot.val())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);

    callback(activities);
  });

  return unsubscribe;
}

/**
 * Log user activity (internal)
 * Called when user does something notable
 */
export async function addActivity(uid, type, data) {
  const activityId = `activity_${Date.now()}`;
  const activityData = {
    type,
    timestamp: Date.now(),
    data,
  };

  await set(ref(db, `users/${uid}/activities/${activityId}`), activityData);
}

/**
 * Get helper for incrementing counters
 * Firebase SDK doesn't have native increment, so we use this workaround
 */
function increment(amount) {
  return (value) => (value || 0) + amount;
}

/**
 * Get user's display name (for activity feed)
 */
async function getDisplayName(uid) {
  const snapshot = await get(ref(db, `users/${uid}/profile/displayName`));
  return snapshot.val();
}

/**
 * Broadcast problem solved to followers (activity)
 */
export async function broadcastProblemSolved(uid, problemName) {
  await addActivity(uid, 'problem_solved', {
    problemName,
  });
}

/**
 * Broadcast streak milestone
 */
export async function broadcastStreakMilestone(uid, days) {
  await addActivity(uid, 'streak_milestone', {
    days,
  });
}

/**
 * Broadcast badge earned
 */
export async function broadcastBadgeEarned(uid, badgeId, badgeName) {
  await addActivity(uid, 'badge_earned', {
    badgeId,
    badgeName,
  });
}
