/**
 * Firebase Database Structure Definitions
 * Centralized schema for new features
 */

export const LEARNING_PATHS = {
  beginner: {
    id: 'path_beginner',
    name: 'Lập trình cho người mới bắt đầu',
    description: 'Từ 0 đến 1 với Python cơ bản',
    difficulty: 'easy',
    estimatedWeeks: 8,
    lessons: [
      {
        lessonId: 'l1',
        name: 'Biến và kiểu dữ liệu',
        problemIds: [1, 2, 3],
        prerequisites: [],
      },
      {
        lessonId: 'l2',
        name: 'Điều kiện và vòng lặp',
        problemIds: [4, 5, 6],
        prerequisites: ['l1'],
      },
      {
        lessonId: 'l3',
        name: 'Hàm và module',
        problemIds: [7, 8, 9],
        prerequisites: ['l2'],
      },
    ],
  },
  intermediate: {
    id: 'path_intermediate',
    name: 'Cấu trúc dữ liệu & Giải thuật',
    description: 'Nắm vững DSA cho phỏng vấn',
    difficulty: 'medium',
    estimatedWeeks: 12,
    lessons: [
      {
        lessonId: 'l4',
        name: 'Mảng và danh sách liên kết',
        problemIds: [10, 11, 12],
        prerequisites: [],
      },
      {
        lessonId: 'l5',
        name: 'Stack, Queue, Deque',
        problemIds: [13, 14, 15],
        prerequisites: ['l4'],
      },
    ],
  },
};

export const COMMENT_SCHEMA = {
  // /problems/{problemId}/comments/{commentId}
  text: 'string',
  authorId: 'string',
  authorName: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  likes: 'number',
  replies: 'array', // nested comments
  solved: 'boolean', // mark as solution
  language: 'string', // for code snippets
  codeBlock: 'string', // code content
};

export const USER_PROFILE_SCHEMA = {
  // /users/{uid}/profile
  displayName: 'string',
  photoUrl: 'string',
  bio: 'string',
  company: 'string',
  location: 'string',
  website: 'string',
  preferredLanguages: 'array', // ['python', 'javascript']
  createdAt: 'timestamp',
  solvedCount: 'number',
  followerCount: 'number',
  followingCount: 'number',
  badges: 'array',
};

export const CODE_SNIPPET_SCHEMA = {
  // /users/{uid}/snippets/{snippetId} OR /communitySnippets/{snippetId}
  title: 'string',
  description: 'string',
  language: 'string',
  code: 'string',
  tags: 'array', // ['memoization', 'recursion']
  isPublic: 'boolean',
  authorId: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  likes: 'number',
  views: 'number',
};

export const NOTIFICATION_PREFERENCES_SCHEMA = {
  // /users/{uid}/settings/notifications
  dailyDigest: { enabled: true, time: '08:00' },
  newProblem: { enabled: true, categories: ['all'] },
  friendActivity: { enabled: true },
  courseUpdate: { enabled: true },
  weeklyReport: { enabled: true, day: 'Monday', time: '09:00' },
  contestReminder: { enabled: true },
  email: 'string', // for validation
};

export const FOLLOW_SCHEMA = {
  // /users/{uid}/following/{followedUid}
  createdAt: 'timestamp',
  
  // /users/{uid}/followers/{followerUid}
  createdAt: 'timestamp',
};

export const ACTIVITY_FEED_SCHEMA = {
  // /users/{uid}/activities/{activityId}
  type: 'string', // 'problem_solved', 'streak', 'badge_earned', 'followed_user'
  timestamp: 'timestamp',
  data: 'object', // varies by type
};
