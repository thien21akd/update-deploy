export const LEVEL_TABLE = [
  { level: 1, title: 'Khởi đầu', emoji: '🌱', minXP: 0 },
  { level: 2, title: 'Khám phá', emoji: '🔍', minXP: 500 },
  { level: 3, title: 'Tập sự', emoji: '📖', minXP: 1000 },
  { level: 4, title: 'Học viên', emoji: '🎓', minXP: 1800 },
  { level: 5, title: 'Người học', emoji: '💡', minXP: 2800 },
  { level: 6, title: 'Chuyên cần', emoji: '🏫', minXP: 4000 },
  { level: 7, title: 'Thực hành', emoji: '🔧', minXP: 5500 },
  { level: 8, title: 'Lập trình viên', emoji: '💻', minXP: 7500 },
  { level: 9, title: 'Chuyên gia', emoji: '⚡', minXP: 10000 },
  { level: 10, title: 'Bậc thầy', emoji: '🏆', minXP: 13000 },
  { level: 11, title: 'Kiến trúc sư', emoji: '🏛️', minXP: 17000 },
  { level: 12, title: 'Hiền triết', emoji: '🧙', minXP: 22000 },
  { level: 13, title: 'Huyền thoại', emoji: '✨', minXP: 28000 },
  { level: 14, title: 'Đại cao thủ', emoji: '👑', minXP: 35000 },
  { level: 15, title: 'Thần thoại', emoji: '🌟', minXP: 50000 },
];

export function getLevelInfo(score) {
  let current = LEVEL_TABLE[0];
  for (let index = LEVEL_TABLE.length - 1; index >= 0; index -= 1) {
    if (score >= LEVEL_TABLE[index].minXP) {
      current = LEVEL_TABLE[index];
      break;
    }
  }

  const nextIndex = LEVEL_TABLE.findIndex((item) => item.level === current.level) + 1;
  const nextLevel = nextIndex < LEVEL_TABLE.length ? LEVEL_TABLE[nextIndex] : null;
  const xpInLevel = score - current.minXP;
  const xpToNext = nextLevel ? nextLevel.minXP - current.minXP : 1;
  const pct = nextLevel ? Math.min(100, Math.round((xpInLevel / xpToNext) * 100)) : 100;

  return { ...current, nextLevel, xpInLevel, xpToNext, pct };
}
