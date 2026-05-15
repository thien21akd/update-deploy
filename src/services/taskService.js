import { removeValue, setValue, userPath } from './databaseService';

export async function createTask(uid, task) {
  await setValue(userPath(uid, `tasks/${task.id}`), {
    ...task,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function toggleTask(uid, task) {
  await setValue(userPath(uid, `tasks/${task.id}`), {
    ...task,
    done: !task.done,
    updatedAt: Date.now(),
  });
}

export async function deleteTask(uid, taskId) {
  await removeValue(userPath(uid, `tasks/${taskId}`));
}
