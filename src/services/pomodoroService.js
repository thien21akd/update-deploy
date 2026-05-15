import { setValue, userPath } from './databaseService';

export async function updatePomodoroStats(uid, stats) {
  await setValue(userPath(uid, 'pomodoro/stats'), {
    ...stats,
    updatedAt: Date.now(),
  });
}
