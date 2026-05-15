/**
 * Firebase Cloud Function: Update Leaderboard on Submission
 * 
 * This function triggers when a new submission is created.
 * It recalculates the user's solved count and updates the leaderboard node.
 * 
 * Deploy: firebase deploy --only functions
 * 
 * Rules needed in firebase.rules:
 * - Users can only read their own submissions
 * - Only Cloud Function can write to leaderboard
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.database();

/**
 * Get timestamp for start of current period
 */
function getPeriodStartTimestamp(period) {
  const now = new Date();

  if (period === 'week') {
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.getTime();
  }

  if (period === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  }

  return 0; // alltime
}

/**
 * Calculate unique solved problems for a user in a period
 */
function calculateSolvedCount(submissions, period) {
  if (!submissions) return { count: 0, lastAcTime: 0 };

  const periodStart = getPeriodStartTimestamp(period);
  const solvedProblems = new Set();
  let lastAcTime = 0;

  Object.values(submissions).forEach((submission) => {
    if (submission.result === 'AC' && submission.timestamp >= periodStart) {
      solvedProblems.add(submission.problemId);
      if (submission.timestamp > lastAcTime) {
        lastAcTime = submission.timestamp;
      }
    }
  });

  return {
    count: solvedProblems.size,
    lastAcTime,
  };
}

/**
 * Cloud Function triggered on new submission
 */
exports.onSubmissionCreated = functions.database
  .ref('users/{uid}/submissions/{submissionId}')
  .onCreate(async (snapshot, context) => {
    const { uid } = context.params;
    const submission = snapshot.val();

    try {
      // Only process AC submissions
      if (submission.result !== 'AC') {
        console.log(`Submission ${submission.id} is not AC, skipping leaderboard update`);
        return;
      }

      // Get all submissions for this user
      const submissionsRef = db.ref(`users/${uid}/submissions`);
      const submissionsSnap = await submissionsRef.once('value');
      const submissions = submissionsSnap.val();

      // Get user profile for username
      const profileRef = db.ref(`users/${uid}/profile`);
      const profileSnap = await profileRef.once('value');
      const profile = profileSnap.val();
      const username = profile?.displayName || 'Người dùng LearnFlow';

      // Calculate solved counts for all periods
      const alltime = calculateSolvedCount(submissions, 'alltime');
      const month = calculateSolvedCount(submissions, 'month');
      const week = calculateSolvedCount(submissions, 'week');

      // Update leaderboard node
      await db.ref(`leaderboard/${uid}`).set({
        username,
        solved_alltime: alltime.count,
        solved_month: month.count,
        solved_week: week.count,
        last_ac_alltime: alltime.lastAcTime,
        last_ac_month: month.lastAcTime,
        last_ac_week: week.lastAcTime,
        updatedAt: Date.now(),
      });

      console.log(`✅ Leaderboard updated for user ${uid}: ${alltime.count} problems (all-time)`);
    } catch (error) {
      console.error(`❌ Error updating leaderboard for user ${uid}:`, error);
      // Don't throw - let the submission be created even if leaderboard fails
    }
  });

/**
 * Cloud Function triggered on submission update (WA -> AC, etc)
 */
exports.onSubmissionUpdated = functions.database
  .ref('users/{uid}/submissions/{submissionId}')
  .onUpdate(async (change, context) => {
    const { uid } = context.params;
    const before = change.before.val();
    const after = change.after.val();

    try {
      // Only process if result changed to AC
      if (before.result === after.result || after.result !== 'AC') {
        return;
      }

      // Get all submissions for this user
      const submissionsRef = db.ref(`users/${uid}/submissions`);
      const submissionsSnap = await submissionsRef.once('value');
      const submissions = submissionsSnap.val();

      // Get user profile
      const profileRef = db.ref(`users/${uid}/profile`);
      const profileSnap = await profileRef.once('value');
      const profile = profileSnap.val();
      const username = profile?.displayName || 'Người dùng LearnFlow';

      // Calculate solved counts
      const alltime = calculateSolvedCount(submissions, 'alltime');
      const month = calculateSolvedCount(submissions, 'month');
      const week = calculateSolvedCount(submissions, 'week');

      // Update leaderboard
      await db.ref(`leaderboard/${uid}`).set({
        username,
        solved_alltime: alltime.count,
        solved_month: month.count,
        solved_week: week.count,
        last_ac_alltime: alltime.lastAcTime,
        last_ac_month: month.lastAcTime,
        last_ac_week: week.lastAcTime,
        updatedAt: Date.now(),
      });

      console.log(`✅ Leaderboard updated for user ${uid}: ${alltime.count} problems (all-time)`);
    } catch (error) {
      console.error(`❌ Error updating leaderboard for user ${uid}:`, error);
    }
  });

/**
 * Optional: Cloud Function to recalculate all leaderboard entries
 * Trigger manually if needed to fix data inconsistencies
 * Usage: firebase functions:shell > recalculateAllLeaderboards()
 */
exports.recalculateAllLeaderboards = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  try {
    // Get all users
    const usersRef = db.ref('users');
    const usersSnap = await usersRef.once('value');
    const allUsers = usersSnap.val();

    if (!allUsers) {
      return { message: 'No users found' };
    }

    let updatedCount = 0;
    const updates = {};

    // Process each user
    for (const [uid, userData] of Object.entries(allUsers)) {
      if (!userData.submissions) continue;

      const submissions = userData.submissions;
      const username = userData.profile?.displayName || 'Người dùng LearnFlow';

      const alltime = calculateSolvedCount(submissions, 'alltime');
      const month = calculateSolvedCount(submissions, 'month');
      const week = calculateSolvedCount(submissions, 'week');

      if (alltime.count > 0) {
        updates[`leaderboard/${uid}`] = {
          username,
          solved_alltime: alltime.count,
          solved_month: month.count,
          solved_week: week.count,
          last_ac_alltime: alltime.lastAcTime,
          last_ac_month: month.lastAcTime,
          last_ac_week: week.lastAcTime,
          updatedAt: Date.now(),
        };
        updatedCount++;
      }
    }

    // Perform all updates at once
    await db.ref().update(updates);

    return {
      message: `✅ Recalculated leaderboard for ${updatedCount} users`,
      count: updatedCount,
    };
  } catch (error) {
    console.error('Error recalculating leaderboards:', error);
    throw new functions.https.HttpsError('internal', 'Failed to recalculate leaderboards');
  }
});
