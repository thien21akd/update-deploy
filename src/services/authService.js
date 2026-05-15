import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  deleteUser as deleteAuthUser,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  createUserDatabaseRecord,
  deleteUserData,
  ensureUserDataReady,
} from "./userDataService";

const AUTH_ERROR_MESSAGES = {
  "auth/email-already-in-use":
    "Email này đã được đăng ký trong Firebase Authentication.",
  "auth/invalid-email": "Email không hợp lệ.",
  "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
  "auth/missing-password": "Vui lòng nhập mật khẩu.",
  "auth/missing-email": "Vui lòng nhập email.",
  "auth/operation-not-allowed":
    "Phương thức Email/Password chưa được bật trong Firebase Authentication.",
  "auth/user-disabled": "Tài khoản này đã bị vô hiệu hóa.",
  "auth/too-many-requests": "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.",
  "auth/weak-password": "Mật khẩu phải có ít nhất 6 ký tự.",
  "auth/network-request-failed":
    "Không thể kết nối tới Firebase. Vui lòng kiểm tra mạng.",
  "auth/requires-recent-login":
    "Vui lòng đăng nhập lại rồi thử xóa tài khoản một lần nữa.",
};

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function formatAuthError(error, fallback) {
  return AUTH_ERROR_MESSAGES[error?.code] || error?.message || fallback;
}

async function ensurePersistence() {
  if (!ensurePersistence.promise) {
    ensurePersistence.promise = setPersistence(auth, browserLocalPersistence);
  }

  await ensurePersistence.promise;
}

ensurePersistence.promise = null;

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function checkUserExists(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return { authExists: false, email: normalizedEmail };
  }

  await ensurePersistence();
  console.info("[auth] check Firebase Auth email", { email: normalizedEmail });

  const signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
  return {
    authExists: signInMethods.length > 0,
    email: normalizedEmail,
  };
}

export async function syncUserState(user) {
  if (!user?.uid) {
    throw new Error("Không tìm thấy người dùng đăng nhập để đồng bộ dữ liệu.");
  }

  // Firebase Auth is the source of truth. The Realtime Database profile is
  // recoverable and must be recreated if it was deleted or failed during signup.
  return ensureUserDataReady(user);
}

export async function loginUser({ email, password }) {
  try {
    await ensurePersistence();
    const credential = await signInWithEmailAndPassword(
      auth,
      normalizeEmail(email),
      password,
    );
    await credential.user.getIdToken(true);
    await syncUserState(credential.user).catch((error) => {
      console.error(
        "[auth:login] DB sync failed after Auth login; will retry from app data layer",
        {
          uid: credential.user.uid,
          path: `users/${credential.user.uid}`,
          code: error?.code,
          message: error?.message,
        },
      );
    });
    return credential.user;
  } catch (error) {
    throw new Error(formatAuthError(error, "Đăng nhập thất bại."));
  }
}

export async function signupUser({ username, email, password }) {
  try {
    await ensurePersistence();

    const existing = await checkUserExists(email);
    if (existing.authExists) {
      throw new Error(
        "Email này đã tồn tại trong Firebase Authentication. Vui lòng đăng nhập hoặc dùng email khác.",
      );
    }

    const credential = await createUserWithEmailAndPassword(
      auth,
      existing.email,
      password,
    );

    if (username?.trim()) {
      await updateProfile(credential.user, { displayName: username.trim() });
    }

    const profileUser = {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: username?.trim() || credential.user.displayName,
    };

    try {
      await credential.user.getIdToken(true);
      await createUserDatabaseRecord(profileUser);
    } catch (error) {
      // Do not roll back Auth here. The Auth account is authoritative and the
      // DB profile can be recreated by syncUserState on the next login/session.
      console.error(
        "[auth:register] DB profile creation failed; will retry on next sync",
        {
          uid: credential.user.uid,
          path: `users/${credential.user.uid}`,
          code: error?.code,
          message: error?.message,
        },
      );
    }

    return credential.user;
  } catch (error) {
    throw new Error(formatAuthError(error, "Đăng ký thất bại."));
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(formatAuthError(error, "Đăng xuất thất bại."));
  }
}

export async function deleteCurrentUserAccount() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("Không tìm thấy phiên đăng nhập hiện tại.");
  }

  const { uid, email } = currentUser;
  const authToken = await currentUser.getIdToken().catch((error) => {
    console.error("[auth:delete] failed to get auth token before delete", {
      uid,
      code: error?.code,
      message: error?.message,
    });
    return null;
  });

  let authDeleted = false;

  try {
    console.info("[auth:delete] deleting Firebase Auth user", { uid, email });
    await deleteAuthUser(currentUser);
    authDeleted = true;
  } catch (error) {
    console.error("[auth:delete] Firebase Auth delete failed", {
      uid,
      code: error?.code,
      message: error?.message,
    });
    throw new Error(formatAuthError(error, "Không thể xóa tài khoản."));
  }

  try {
    console.info("[auth:delete] deleting Realtime Database user data", {
      uid,
      authDeleted,
    });
    await deleteUserData(uid, email, authToken);
  } catch (error) {
    console.error("[auth:delete] database cleanup failed after Auth delete", {
      uid,
      code: error?.code,
      message: error?.message,
    });
  }
}

export const register = signupUser;
export const login = loginUser;
export const logout = logoutUser;
export const deleteUser = deleteCurrentUserAccount;
export const syncUser = syncUserState;
