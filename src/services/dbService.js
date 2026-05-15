import {
  readValue,
  removeValue,
  removeValueWithAuthToken,
  setValue,
  subscribeValue,
  updateValue,
  userPath,
} from "./databaseService";

export function getUserPath(uid, child = "") {
  return userPath(uid, child);
}

export async function getUser(uid) {
  return readValue(getUserPath(uid));
}

export async function createUser(uid, data) {
  await setValue(getUserPath(uid), data);
}

export async function ensureUserExists(uid, dataFactory) {
  const existing = await getUser(uid);

  if (existing) {
    return existing;
  }

  const nextValue =
    typeof dataFactory === "function" ? dataFactory() : dataFactory;
  console.info("[db:user] creating missing user record", {
    uid,
    path: getUserPath(uid),
  });
  await createUser(uid, nextValue);
  return nextValue;
}

export async function updateUser(uid, data) {
  await updateValue(getUserPath(uid), data);
}

export async function deleteUser(uid, authToken) {
  if (authToken) {
    await removeValueWithAuthToken(getUserPath(uid), authToken);
    return;
  }

  await removeValue(getUserPath(uid));
}

export function subscribeUser(uid, callback, errorCallback) {
  return subscribeValue(getUserPath(uid), callback, errorCallback);
}
