/**
 * NotificationPreferences.jsx
 * Cài đặt thông báo email chuyên nghiệp với giao diện hiện đại
 */

import { useEffect, useState } from "react";
import styles from "../../styles/Notificationpreferences.module.scss";
import { bindModule } from "../../utils/bem";
import {
  getNotificationPreferences,
  updateNotificationSettings,
  setNotificationTime,
  setNotificationCategories,
  sendTestEmail,
  sendSettingsChangeEmail,
  subscribeToNotificationPreferences,
} from "../../services/notificationService";

const cx = bindModule(styles);

const NOTIFICATION_TYPES = [
  {
    id: "dailyDigest",
    icon: "📰",
    title: "Daily Digest",
    description: "Nhận tóm tắt các bài toán và bài học mới mỗi ngày",
    timeSelectable: true,
    defaultTime: "08:00",
    badge: "Hàng ngày",
  },
  {
    id: "newProblem",
    icon: "🆕",
    title: "New Problems",
    description: "Nhận thông báo khi có bài toán mới phù hợp với sở thích của bạn",
    hasCategories: true,
    badge: "Tức thời",
  },
  {
    id: "friendActivity",
    icon: "👥",
    title: "Friend Activity",
    description: "Cập nhật khi bạn bè của bạn giải quyết bài toán hoặc kiếm huy hiệu",
    badge: "Tức thời",
  },
  {
    id: "courseUpdate",
    icon: "📚",
    title: "Course Updates",
    description: "Nhận thông báo về các bài học mới và thông báo khóa học",
    badge: "Tức thời",
  },
  {
    id: "weeklyReport",
    icon: "📊",
    title: "Weekly Report",
    description: "Nhận báo cáo chi tiết về tiến độ của bạn mỗi tuần",
    timeSelectable: true,
    defaultTime: "09:00",
    daySelectable: true,
    defaultDay: "Monday",
    badge: "Hàng tuần",
  },
  {
    id: "contestReminder",
    icon: "🏆",
    title: "Contest Reminders",
    description: "Nhận lời nhắc về các cuộc thi sắp tới và ngày quan trọng",
    badge: "Dựa trên sự kiện",
  },
];

const ALL_CATEGORIES = ["Frontend", "Backend", "Data Science", "All"];
const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function NotificationPreferences({ uid, darkMode }) {
  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [message, setMessage] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [initialPrefs, setInitialPrefs] = useState(null);

  // Khởi tạo tùy chọn và đăng ký nhận thay đổi
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const preferences = await getNotificationPreferences(uid);
        setPrefs(preferences);
        setInitialPrefs(JSON.parse(JSON.stringify(preferences)));
      } catch (error) {
        console.error("Error loading notification preferences:", error);
        setMessage({
          type: "error",
          text: "Không thể tải tùy chọn thông báo",
        });
      }
    };

    loadPrefs();

    // Đăng ký nhận cập nhật theo thời gian thực
    const unsubscribe = subscribeToNotificationPreferences(uid, (updatedPrefs) => {
      setPrefs(updatedPrefs);
    });

    return () => unsubscribe();
  }, [uid]);

  const handleToggle = async (notificationType) => {
    if (!prefs) return;

    setSaving(true);
    try {
      const newPrefs = {
        ...prefs,
        [notificationType]: {
          ...prefs[notificationType],
          enabled: !prefs[notificationType]?.enabled,
        },
      };

      await updateNotificationSettings(uid, newPrefs);
      setPrefs(newPrefs);

      const isEnabled = !prefs[notificationType]?.enabled;
      setMessage({
        type: "success",
        text: `${notificationType} ${isEnabled ? "đã bật" : "đã tắt"}`,
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error updating notification:", error);
      setMessage({
        type: "error",
        text: "Không thể cập nhật cài đặt thông báo",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = async (notificationType, time) => {
    setSaving(true);
    try {
      await setNotificationTime(uid, notificationType, time);
      const newPrefs = {
        ...prefs,
        [notificationType]: {
          ...prefs[notificationType],
          time,
        },
      };
      setPrefs(newPrefs);
      setMessage({
        type: "success",
        text: "Thời gian được cập nhật thành công",
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error("Error setting notification time:", error);
      setMessage({
        type: "error",
        text: "Định dạng thời gian không hợp lệ (sử dụng HH:MM)",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryChange = async (category, checked) => {
    if (!prefs) return;

    setSaving(true);
    try {
      const currentCategories = prefs.newProblem?.categories || [];
      let newCategories;

      if (category === "All") {
        newCategories = checked ? ["All"] : [];
      } else {
        const filtered = currentCategories.filter((c) => c !== "All");
        newCategories = checked
          ? [...filtered, category]
          : filtered.filter((c) => c !== category);
      }

      await setNotificationCategories(uid, newCategories);
      setPrefs({
        ...prefs,
        newProblem: { ...prefs.newProblem, categories: newCategories },
      });
    } catch (error) {
      console.error("Error updating categories:", error);
      setMessage({
        type: "error",
        text: "Không thể cập nhật danh mục",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleWeeklyDayChange = async (day) => {
    setSaving(true);
    try {
      const newPrefs = {
        ...prefs,
        weeklyReport: { ...prefs.weeklyReport, day },
      };
      await updateNotificationSettings(uid, newPrefs);
      setPrefs(newPrefs);
    } catch (error) {
      console.error("Error setting weekly report day:", error);
      setMessage({
        type: "error",
        text: "Không thể cập nhật ngày báo cáo hàng tuần",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!uid) return;

    setTestEmailSending(true);
    try {
      await sendTestEmail(uid);
      setMessage({
        type: "success",
        text: "Email thử nghiệm đã gửi! Kiểm tra hộp thư của bạn.",
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      setMessage({
        type: "error",
        text: "Không thể gửi email thử nghiệm",
      });
    } finally {
      setTestEmailSending(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (!prefs) {
    return (
      <div className={cx("notification-preferences-loading", { "dark-mode": darkMode })}>
        <div className={cx("loading-spinner")}>
          <div className={cx("spinner")}></div>
          <p>Đang tải tùy chọn thông báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("notification-preferences", { "dark-mode": darkMode })}>
      {/* Phần Tiêu đề */}
      <div className={cx("notification-header")}>
        <div className={cx("notification-header-content")}>
          <h1>📧 Tùy chọn Thông báo</h1>
          <p>Tùy chỉnh cách và thời điểm bạn nhận được cập nhật</p>
        </div>
      </div>

      {/* Thông báo Cảnh báo */}
      {message && (
        <div className={cx("alert", `alert-${message.type}`, "alert-animated")}>
          <div className={cx("alert-content")}>
            <span className={cx("alert-icon")}>
              {message.type === "success" ? "✓" : "!"}
            </span>
            <span className={cx("alert-text")}>{message.text}</span>
          </div>
        </div>
      )}

      {/* Lưới Nội dung Chính */}
      <div className={cx("notification-content")}>
        {/* Phần Cài đặt */}
        <div className={cx("notification-settings")}>
          <div className={cx("settings-intro")}>
            <p>
              Chọn thông báo bạn muốn nhận và đặt thời gian ưa thích của bạn.
              Bạn có thể cập nhật những cài đặt này bất cứ lúc nào.
            </p>
          </div>

          {/* Thẻ Thông báo */}
          <div className={cx("notification-cards")}>
            {NOTIFICATION_TYPES.map((notifType) => (
              <div
                key={notifType.id}
                className={cx("notification-card", {
                  "is-enabled": prefs[notifType.id]?.enabled,
                  "is-expanded": expandedSection === notifType.id,
                })}
              >
                {/* Tiêu đề Thẻ */}
                <div
                  className={cx("card-header")}
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === notifType.id ? null : notifType.id
                    )
                  }
                >
                  <div className={cx("card-header-left")}>
                    <span className={cx("card-icon")}>{notifType.icon}</span>
                    <div className={cx("card-title-section")}>
                      <h3 className={cx("card-title")}>{notifType.title}</h3>
                      <span className={cx("card-badge")}>{notifType.badge}</span>
                    </div>
                  </div>

                  {/* Nút Chuyển đổi */}
                  <label className={cx("toggle-switch")}>
                    <input
                      type="checkbox"
                      checked={prefs[notifType.id]?.enabled || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggle(notifType.id);
                      }}
                      disabled={saving}
                    />
                    <span className={cx("toggle-slider")} />
                  </label>
                </div>

                {/* Mô tả Thẻ */}
                <p className={cx("card-description")}>{notifType.description}</p>

                {/* Nội dung có thể mở rộng */}
                {prefs[notifType.id]?.enabled && (
                  <div className={cx("card-expanded-content")}>
                    {/* Lựa chọn Thời gian */}
                    {notifType.timeSelectable && (
                      <div className={cx("control-group")}>
                        <label className={cx("control-label")}>
                          <span className={cx("control-icon")}>🕐</span>
                          Thời gian Ưa thích
                        </label>
                        <div className={cx("time-input-wrapper")}>
                          <input
                            type="time"
                            value={prefs[notifType.id]?.time || notifType.defaultTime}
                            onChange={(e) => handleTimeChange(notifType.id, e.target.value)}
                            disabled={saving}
                            className={cx("time-input")}
                          />
                          <span className={cx("time-hint")}>
                            {prefs[notifType.id]?.time || notifType.defaultTime}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Lựa chọn Ngày */}
                    {notifType.daySelectable && (
                      <div className={cx("control-group")}>
                        <label className={cx("control-label")}>
                          <span className={cx("control-icon")}>📅</span>
                          Ngày Ưa thích
                        </label>
                        <select
                          value={prefs[notifType.id]?.day || notifType.defaultDay}
                          onChange={(e) => handleWeeklyDayChange(e.target.value)}
                          disabled={saving}
                          className={cx("day-select")}
                        >
                          {ALL_DAYS.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Lựa chọn Danh mục */}
                    {notifType.hasCategories && (
                      <div className={cx("control-group")}>
                        <label className={cx("control-label")}>
                          <span className={cx("control-icon")}>🏷️</span>
                          Các chủ đề bạn quan tâm
                        </label>
                        <div className={cx("categories-grid")}>
                          {ALL_CATEGORIES.map((category) => (
                            <label
                              key={category}
                              className={cx("category-checkbox", {
                                "is-checked": prefs[notifType.id]?.categories?.includes(
                                  category
                                ),
                              })}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  prefs[notifType.id]?.categories?.includes(category) || false
                                }
                                onChange={(e) =>
                                  handleCategoryChange(category, e.target.checked)
                                }
                                disabled={saving}
                              />
                              <span className={cx("category-label")}>{category}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Phần Thanh bên */}
        <aside className={cx("notification-sidebar")}>
          {/* Thẻ Email Thử nghiệm */}
          <div className={cx("sidebar-card", "test-email-card")}>
            <div className={cx("card-icon-large")}>📧</div>
            <h3>Email Thử nghiệm</h3>
            <p>Gửi cho chính bạn một email thử nghiệm để xác minh rằng cài đặt thông báo của bạn đang hoạt động chính xác.</p>
            <button
              className={cx("btn", "btn-test-email")}
              onClick={handleSendTestEmail}
              disabled={testEmailSending}
            >
              {testEmailSending ? (
                <>
                  <span className={cx("btn-spinner")}></span>
                  Đang gửi...
                </>
              ) : (
                <>
                  <span>✉️</span> Gửi Email Thử nghiệm
                </>
              )}
            </button>
          </div>

          {/* Thẻ Mẹo */}
          <div className={cx("sidebar-card", "tips-card")}>
            <h3>💡 Mẹo</h3>
            <ul className={cx("tips-list")}>
              <li>Vô hiệu hóa tất cả thông báo để vào chế độ tập trung</li>
              <li>Điều chỉnh thời gian dựa trên khi bạn hoạt động nhiều nhất</li>
              <li>Tóm tắt hàng ngày hoạt động tốt nhất với thói quen buổi sáng</li>
              <li>Kiểm tra thư mục thư rác nếu bạn không thấy email</li>
            </ul>
          </div>

          {/* Thẻ Nhà cung cấp Email */}
          <div className={cx("sidebar-card", "provider-card")}>
            <h3>📬 Cập nhật Email</h3>
            <p className={cx("provider-text")}>
              Tất cả các thông báo được gửi đến địa chỉ email đã đăng ký của bạn. 
              Giữ cho địa chỉ email của bạn được cập nhật trong cài đặt hồ sơ.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}