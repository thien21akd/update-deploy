export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Bảng điều khiển', icon: '🏠', group: 'Tổng quan' },
  { id: 'courses', label: 'Khóa học', icon: '📚', group: 'Tổng quan', badgeType: 'courses' },
  { id: 'problems', label: 'Luyện code', icon: '💻', group: 'Học tập', badgeType: 'problems' },
  { id: 'leaderboard', label: 'Bảng xếp hạng', icon: '🏆', group: 'Học tập' },
  { id: 'tasks', label: 'Bài tập', icon: '📝', group: 'Học tập', badgeType: 'tasks' },
  { id: 'timer', label: 'Pomodoro', icon: '⏱️', group: 'Học tập' },
  { id: 'notes', label: 'Ghi chú', icon: '📓', group: 'Học tập' },
  { id: 'progress', label: 'Tiến độ', icon: '📊', group: 'Cá nhân' },
  { id: 'profile', label: 'Hồ sơ', icon: '👤', group: 'Cá nhân' },
  { id: 'ai-analysis', label: 'Phân tích AI', icon: '🤖', group: 'Cá nhân' },
  { id: 'notification-settings', label: 'Email & Thông báo', icon: '📧', group: 'Cá nhân' },
  { id: 'settings', label: 'Cài đặt', icon: '⚙️', group: 'Cá nhân' },
];

export const PRIORITY_MAP = {
  urgent: { text: '🔴 Gấp', badge: 'live' },
  normal: { text: '🟡 Bình thường', badge: 'new' },
  low: { text: '🟢 Thấp', badge: 'done' },
};

export const FONT_SIZE_OPTIONS = [
  { value: '13', label: 'Nhỏ', desc: '13px' },
  { value: '14', label: 'Mặc định', desc: '14px' },
  { value: '15', label: 'Vừa', desc: '15px' },
  { value: '16', label: 'Lớn', desc: '16px' },
];
