import { getLevelInfo } from '../data/levels';
import { getInitials, mapValuesToArray } from '../features/learnflow2/helpers';
import { setValue, subscribeValue } from './databaseService';

export function subscribeToLeaderboard(callback, errorCallback) {
  return subscribeValue(
    'leaderboard',
    (snapshot) => {
      const rows = mapValuesToArray(snapshot.val(), (item) => item)
        .sort((left, right) => (right.score || 0) - (left.score || 0))
        .map((item, index) => ({
          ...item,
          rank: index + 1,
        }));

      callback(rows);
    },
    errorCallback,
  );
}

export async function syncLeaderboardEntry({ uid, profile, score }) {
  const levelInfo = getLevelInfo(score || 0);

  await setValue(`leaderboard/${uid}`, {
    uid,
    name: profile?.displayName || 'Người dùng LearnFlow',
    initials: getInitials(profile?.displayName || 'LF'),
    level: levelInfo.level,
    score: score || 0,
    updatedAt: Date.now(),
  });
}
