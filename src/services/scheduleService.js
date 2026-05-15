import { setValue, userPath } from './databaseService';

export async function createSchedule(uid, item) {
  await setValue(userPath(uid, `schedule/${item.id}`), {
    ...item,
    createdAt: Date.now(),
  });
}
