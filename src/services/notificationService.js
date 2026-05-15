/**
 * Dịch vụ Thông báo
 * Quản lý tùy chọn thông báo email và lập lịch
 * Phiên bản nâng cao với xử lý lỗi và logging tốt hơn
 */

import { ref, update, get, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { DEFAULT_NOTIFICATION_SETTINGS } from "../constants/firebaseDefaults";
import emailjs from "@emailjs/browser";

const EMAILJS_CONFIG = {
  SERVICE_ID: "service_g8vabpb",
  TEMPLATE_ID: "template_azetith",
  PUBLIC_KEY: "sMqipqoysogP1wU2H",
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 phút
const notificationCache = new Map();

/**
 * Tính toán xếp hạng bảng xếp hạng của người dùng
 */
async function calculateUserRank(uid) {
  try {
    const lbSnapshot = await get(ref(db, "leaderboard"));
    const lbData = lbSnapshot.val() || {};
    const sortedLeaderboard = Object.values(lbData).sort(
      (a, b) => b.score - a.score
    );
    const rank = sortedLeaderboard.findIndex((i) => i.uid === uid) + 1;
    return rank > 0 ? rank : "Chưa xếp hạng";
  } catch (error) {
    console.error("Error calculating user rank:", error);
    return "Chưa xếp hạng";
  }
}

/**
 * Lấy tùy chọn thông báo của người dùng với bộ đệm
 */
export async function getNotificationPreferences(uid) {
  if (!uid) {
    throw new Error("UID là bắt buộc");
  }

  // Kiểm tra bộ đệm
  const cached = notificationCache.get(uid);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const snapshot = await get(ref(db, `users/${uid}/settings/notifications`));
    const preferences = snapshot.val() || DEFAULT_NOTIFICATION_SETTINGS;

    // Bộ đệm kết quả
    notificationCache.set(uid, {
      data: preferences,
      timestamp: Date.now(),
    });

    return preferences;
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    throw new Error("Không thể tải tùy chọn thông báo");
  }
}

/**
 * Đăng ký nhận cập nhật tùy chọn thông báo theo thời gian thực
 */
export function subscribeToNotificationPreferences(uid, callback) {
  if (!uid || typeof callback !== "function") {
    throw new Error("UID và hàm callback là bắt buộc");
  }

  try {
    const unsubscribe = onValue(
      ref(db, `users/${uid}/settings/notifications`),
      (snapshot) => {
        const preferences = snapshot.val() || DEFAULT_NOTIFICATION_SETTINGS;
        // Cập nhật bộ đệm
        notificationCache.set(uid, {
          data: preferences,
          timestamp: Date.now(),
        });
        callback(preferences);
      },
      (error) => {
        console.error("Error subscribing to notification preferences:", error);
        callback(DEFAULT_NOTIFICATION_SETTINGS);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up subscription:", error);
    // Trả về hàm unsubscribe không làm gì
    return () => {};
  }
}

/**
 * Cập nhật tùy chọn thông báo với xác thực
 */
export async function updateNotificationSettings(uid, settings) {
  if (!uid || !settings) {
    throw new Error("UID và cài đặt là bắt buộc");
  }

  const allowedFields = [
    "dailyDigest",
    "newProblem",
    "friendActivity",
    "courseUpdate",
    "weeklyReport",
    "contestReminder",
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (field in settings) {
      updates[field] = settings[field];
    }
  });

  updates.lastUpdated = Date.now();

  try {
    await update(ref(db, `users/${uid}/settings/notifications`), updates);
    // Xóa bộ đệm
    notificationCache.delete(uid);
    return { success: true, updates };
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw new Error("Không thể cập nhật cài đặt thông báo");
  }
}

/**
 * Bật/tắt loại thông báo cụ thể
 */
export async function toggleNotification(uid, notificationType, enabled) {
  if (!uid || !notificationType) {
    throw new Error("UID và loại thông báo là bắt buộc");
  }

  try {
    await update(
      ref(db, `users/${uid}/settings/notifications/${notificationType}`),
      { enabled }
    );
    notificationCache.delete(uid);
    return { success: true };
  } catch (error) {
    console.error("Error toggling notification:", error);
    throw new Error("Không thể chuyển đổi thông báo");
  }
}

/**
 * Cập nhật tùy chọn thời gian thông báo với xác thực
 */
export async function setNotificationTime(uid, notificationType, time) {
  if (!uid || !notificationType || !time) {
    throw new Error("UID, loại thông báo và thời gian là bắt buộc");
  }

  // Xác thực định dạng thời gian
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Định dạng thời gian không hợp lệ. Sử dụng HH:MM");
  }

  const [hour, minute] = time.split(":").map(Number);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Giá trị thời gian không hợp lệ. Giờ phải là 0-23, phút phải là 0-59");
  }

  try {
    await update(
      ref(db, `users/${uid}/settings/notifications/${notificationType}`),
      { time }
    );
    notificationCache.delete(uid);
    return { success: true, time };
  } catch (error) {
    console.error("Error setting notification time:", error);
    throw new Error("Không thể đặt thời gian thông báo");
  }
}

/**
 * Cập nhật tùy chọn danh mục thông báo
 */
export async function setNotificationCategories(uid, categories) {
  if (!uid || !Array.isArray(categories)) {
    throw new Error("UID và mảng danh mục là bắt buộc");
  }

  try {
    await update(ref(db, `users/${uid}/settings/notifications/newProblem`), {
      categories,
    });
    notificationCache.delete(uid);
    return { success: true, categories };
  } catch (error) {
    console.error("Error setting notification categories:", error);
    throw new Error("Không thể đặt danh mục thông báo");
  }
}

/**
 * Xếp hàng một thông báo để gửi
 */
export async function queueNotification(uid, notificationType, data) {
  if (!uid || !notificationType || !data) {
    throw new Error("UID, loại thông báo và dữ liệu là bắt buộc");
  }

  try {
    const preferences = await getNotificationPreferences(uid);
    const notifConfig = getNotificationConfig(notificationType);

    const enabledPath = notifConfig.prefPath.split(".");
    let isEnabled = preferences;

    for (const path of enabledPath) {
      isEnabled = isEnabled?.[path];
    }

    if (!isEnabled?.enabled) {
      return { success: false, reason: "Loại thông báo đã bị vô hiệu hóa" };
    }

    // Gửi email
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        ...data,
        subject: data.subject || `Thông báo từ LearnFlow: ${notificationType}`,
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    // Ghi vào lịch sử
    const notificationId = `notif_${Date.now()}`;
    await update(
      ref(db, `users/${uid}/notifications_history/${notificationId}`),
      {
        type: notificationType,
        data,
        status: "sent_success",
        sentAt: Date.now(),
      }
    );

    return { success: true, notificationId };
  } catch (error) {
    console.error("Error queuing notification:", error);
    // Vẫn ghi lại nỗ lực
    try {
      const notificationId = `notif_${Date.now()}`;
      await update(
        ref(db, `users/${uid}/notifications_history/${notificationId}`),
        {
          type: notificationType,
          data,
          status: "sent_failed",
          error: error.message,
          sentAt: Date.now(),
        }
      );
    } catch (historyError) {
      console.error("Error recording notification history:", historyError);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Lấy cấu hình thông báo cho loại đã cho
 */
function getNotificationConfig(type) {
  const configs = {
    dailyDigest: {
      prefPath: "dailyDigest.enabled",
      emailTemplate: "daily_digest",
      defaultTime: "08:00",
      description: "Tóm tắt hàng ngày về các bài toán mới và bài học",
    },
    newProblem: {
      prefPath: "newProblem.enabled",
      emailTemplate: "new_problem",
      description: "Thông báo về các bài toán mới phù hợp",
    },
    friendActivity: {
      prefPath: "friendActivity.enabled",
      emailTemplate: "friend_activity",
      description: "Hoạt động của bạn bè",
    },
    courseUpdate: {
      prefPath: "courseUpdate.enabled",
      emailTemplate: "course_update",
      description: "Cập nhật khóa học mới",
    },
    weeklyReport: {
      prefPath: "weeklyReport.enabled",
      emailTemplate: "weekly_report",
      defaultTime: "09:00",
      description: "Báo cáo tiến độ học tập hàng tuần",
    },
    contestReminder: {
      prefPath: "contestReminder.enabled",
      emailTemplate: "contest_reminder",
      description: "Nhắc nhở về các cuộc thi",
    },
  };

  return configs[type] || configs.newProblem;
}

/**
 * Lấy danh sách các trường đã thay đổi giữa hai đối tượng cài đặt
 */
function getChangedFields(oldSettings, newSettings) {
  const changes = [];
  const allKeys = new Set([
    ...Object.keys(oldSettings || {}),
    ...Object.keys(newSettings || {}),
  ]);

  allKeys.forEach((key) => {
    const oldVal = oldSettings?.[key];
    const newVal = newSettings?.[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, old: oldVal, new: newVal });
    }
  });

  return changes;
}

/**
 * Gửi email thử nghiệm để xác minh cấu hình
 */
export async function sendTestEmail(uid) {
  if (!uid) {
    throw new Error("UID là bắt buộc");
  }

  try {
    const userSnapshot = await get(ref(db, `users/${uid}`));
    if (!userSnapshot.exists()) {
      throw new Error("Không tìm thấy người dùng");
    }

    const userData = userSnapshot.val();
    const profile = userData.profile || {};

    const currentRank = await calculateUserRank(uid);

    const templateParams = {
      name: profile.displayName || "Học viên",
      user_email: profile.email,
      time: new Date().toLocaleString("en-US"),
      new_problems_count: 0,
      new_lessons_count: 0,
      rank: currentRank,
      score: userData.stats?.score || 0,
      subject: "📧 Kiểm tra thông báo email LearnFlow",
      message:
        "Đây là email thử nghiệm để xác minh rằng cấu hình thông báo của bạn đang hoạt động chính xác. Bạn đã chuẩn bị sẵn sàng!",
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    // Ghi lại email thử nghiệm
    const testId = `test_email_${Date.now()}`;
    await update(ref(db, `users/${uid}/notifications_history/${testId}`), {
      type: "test_email",
      status: "sent_success",
      sentAt: Date.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Test email error:", error);
    throw new Error(error.message || "Không thể gửi email thử nghiệm");
  }
}

/**
 * Gửi email thông báo thay đổi cài đặt
 */
export async function sendSettingsChangeEmail(uid, oldSettings, newSettings) {
  if (!uid || !oldSettings || !newSettings) {
    throw new Error("UID và cài đặt là bắt buộc");
  }

  try {
    const userSnapshot = await get(ref(db, `users/${uid}`));
    const profile = userSnapshot.val()?.profile || {};

    const changes = getChangedFields(oldSettings, newSettings);

    if (!changes.length) {
      return { success: false, reason: "Không phát hiện thay đổi" };
    }

    const message = changes
      .map((c) => `${c.field}: ${JSON.stringify(c.old)} → ${JSON.stringify(c.new)}`)
      .join("\n");

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        name: profile.displayName || "Học viên",
        user_email: profile.email,
        subject: "Cài đặt thông báo của bạn đã được cập nhật",
        message,
        time: new Date().toLocaleString("en-US"),
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    return { success: true };
  } catch (error) {
    console.error("Settings change email error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Đánh dấu thông báo đã đọc
 */
export async function markNotificationAsRead(uid, notificationId) {
  if (!uid || !notificationId) {
    throw new Error("UID và ID thông báo là bắt buộc");
  }

  try {
    await update(ref(db, `users/${uid}/notifications/${notificationId}`), {
      read: true,
      readAt: Date.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Không thể đánh dấu thông báo là đã đọc");
  }
}

/**
 * Kích hoạt thông báo tóm tắt hàng ngày
 */
export async function triggerDailyDigest(uid) {
  if (!uid) {
    throw new Error("UID là bắt buộc");
  }

  try {
    const prefs = await getNotificationPreferences(uid);
    const todayStr = new Date().toLocaleDateString("en-US");

    if (
      !prefs.dailyDigest?.enabled ||
      prefs.dailyDigest?.lastSentDate === todayStr
    ) {
      return { success: false, reason: "Tóm tắt hàng ngày đã được gửi hoặc bị vô hiệu hóa" };
    }

    const dbData = await get(ref(db));
    const fullData = dbData.val() || {};
    const user = fullData.users?.[uid];

    if (!user) {
      return { success: false, reason: "Không tìm thấy người dùng" };
    }

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    const allProblems = Array.isArray(fullData.problems)
      ? fullData.problems
      : Object.values(fullData.problems || {});

    const newProblems = allProblems.filter(
      (p) => p && p.createdAt && now - p.createdAt < ONE_DAY_MS
    );

    let newLessonsCount = 0;
    if (fullData.courses) {
      const courses = Array.isArray(fullData.courses)
        ? fullData.courses
        : Object.values(fullData.courses || {});

      courses.forEach((c) => {
        if (c?.lessons) {
          const lessons = Array.isArray(c.lessons)
            ? c.lessons
            : Object.values(c.lessons || {});
          newLessonsCount += lessons.filter(
            (l) => l.addedAt && now - l.addedAt < ONE_DAY_MS
          ).length;
        }
      });
    }

    const currentRank = await calculateUserRank(uid);
    const isTop = typeof currentRank === "number" && currentRank <= 3;
    const earnedNewScore = user.stats?.lastScoreUpdate > now - ONE_DAY_MS;

    if (
      newProblems.length > 0 ||
      newLessonsCount > 0 ||
      isTop ||
      earnedNewScore
    ) {
      const emailData = {
        user_email: user.profile?.email,
        name: user.profile?.displayName || "Học viên",
        new_problems_count: newProblems.length,
        new_lessons_count: newLessonsCount,
        rank: currentRank,
        score: user.stats?.score || 0,
        time: new Date().toLocaleString("en-US"),
        subject: `📰 Tóm tắt hàng ngày của bạn: ${newProblems.length} bài toán mới đang chờ!`,
        message: "Tiếp tục ghi danh học tập của bạn! Hãy bắt đầu giải các bài toán ngày hôm nay.",
      };

      const result = await queueNotification(uid, "dailyDigest", emailData);

      if (result.success) {
        await update(
          ref(db, `users/${uid}/settings/notifications/dailyDigest`),
          {
            lastSentDate: todayStr,
          }
        );
      }

      return result;
    }

    return { success: false, reason: "Không có nội dung mới để báo cáo" };
  } catch (error) {
    console.error("Error triggering daily digest:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Kích hoạt thông báo báo cáo hàng tuần
 */
export async function triggerWeeklyReport(uid) {
  if (!uid) {
    throw new Error("UID là bắt buộc");
  }

  try {
    const prefs = await getNotificationPreferences(uid);
    if (!prefs.weeklyReport?.enabled) {
      return { success: false, reason: "Báo cáo hàng tuần bị vô hiệu hóa" };
    }

    const userData = await get(ref(db, `users/${uid}`));
    if (!userData.exists()) {
      return { success: false, reason: "Không tìm thấy người dùng" };
    }

    const stats = userData.val()?.stats || {};
    const solvedThisWeek = stats.weekSolved || 0;
    const totalTime = stats.weekTime || 0;

    const data = {
      solvedThisWeek,
      totalTime,
      improvements: ["Nhất quán hơn", "Giải pháp tốt hơn"],
      user_email: userData.val()?.profile?.email,
      name: userData.val()?.profile?.displayName || "Học viên",
      subject: `📊 Báo cáo Học tập Hàng tuần của bạn`,
      message: `Tuần tuyệt vời! Bạn đã giải ${solvedThisWeek} bài toán.`,
    };

    return queueNotification(uid, "weeklyReport", data);
  } catch (error) {
    console.error("Error triggering weekly report:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Xóa bộ đệm thông báo (hữu ích cho thử nghiệm)
 */
export function clearNotificationCache(uid) {
  if (uid) {
    notificationCache.delete(uid);
  } else {
    notificationCache.clear();
  }
}