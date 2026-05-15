import { setValue, userPath } from './databaseService';

export async function upsertNote(uid, note) {
  await setValue(userPath(uid, `notes/${note.id}`), {
    ...note,
    updatedAt: Date.now(),
    createdAt: note.createdAt || Date.now(),
  });
}
