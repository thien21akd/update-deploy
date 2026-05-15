import { setValue, userPath } from './databaseService';

export async function updateProblemStatus(uid, problemId, nextStatus) {
  await setValue(userPath(uid, `problemStatuses/${problemId}`), nextStatus);
}

export async function createSubmission(uid, submission) {
  await setValue(userPath(uid, `submissions/${submission.id}`), submission);
}
