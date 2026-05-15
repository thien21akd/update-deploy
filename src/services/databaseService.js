import {
  get,
  off,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { auth, db } from "../lib/firebase";

function logDatabaseAccess(operation, path, error = null) {
  const payload = {
    operation,
    path,
    authUid: auth.currentUser?.uid || null,
    code: error?.code || null,
    message: error?.message || null,
  };

  if (error) {
    console.warn("[firebase:database]", payload);
    return;
  }
}

export function databaseRef(path) {
  return ref(db, path);
}

export function userRootPath(uid) {
  return `users/${uid}`;
}

export function userPath(uid, child = "") {
  return child ? `${userRootPath(uid)}/${child}` : userRootPath(uid);
}

export function subscribeValue(path, callback, errorCallback) {
  const targetRef = databaseRef(path);
  logDatabaseAccess("subscribe", path);

  const unsubscribe = onValue(targetRef, callback, (error) => {
    logDatabaseAccess("subscribe:error", path, error);
    errorCallback?.(error);
  });

  return unsubscribe || (() => off(targetRef));
}

export async function readValue(path) {
  try {
    logDatabaseAccess("read", path);
    const snapshot = await get(databaseRef(path));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    logDatabaseAccess("read:error", path, error);
    throw error;
  }
}

export async function setValue(path, value) {
  try {
    logDatabaseAccess("set", path);
    await set(databaseRef(path), value);
  } catch (error) {
    logDatabaseAccess("set:error", path, error);
    throw error;
  }
}

export async function updateValue(path, value) {
  try {
    logDatabaseAccess("update", path);
    await update(databaseRef(path), value);
  } catch (error) {
    logDatabaseAccess("update:error", path, error);
    throw error;
  }
}

export async function removeValue(path) {
  try {
    logDatabaseAccess("remove", path);
    await remove(databaseRef(path));
  } catch (error) {
    logDatabaseAccess("remove:error", path, error);
    throw error;
  }
}

export async function removeValueWithAuthToken(path, authToken) {
  const databaseURL = db.app.options.databaseURL;

  if (!databaseURL || !authToken) {
    throw new Error(
      "Missing Firebase database URL or auth token for privileged cleanup.",
    );
  }

  try {
    logDatabaseAccess("remove:rest", path);
    const response = await fetch(
      `${databaseURL}/${path}.json?auth=${encodeURIComponent(authToken)}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error(`Firebase cleanup failed with HTTP ${response.status}.`);
    }
  } catch (error) {
    logDatabaseAccess("remove:rest:error", path, error);
    throw error;
  }
}

export async function pushValue(path, value) {
  try {
    logDatabaseAccess("push", path);
    const nextRef = push(databaseRef(path));
    await set(nextRef, value);
    return nextRef.key;
  } catch (error) {
    logDatabaseAccess("push:error", path, error);
    throw error;
  }
}
