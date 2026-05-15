/**
 * ActivityFeed.jsx
 * Professional activity feed component with filters, animations, and infinite scroll
 * Inspired by Facebook's design patterns
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import styles from '../../styles/userprofilecard.module.scss';
import { bindModule } from '../../utils/bem';
import { subscribeToActivityFeed } from '../../services/followService';

const cx = bindModule(styles);

// ── Activity Type Icons & Colors ──────────────────────────────
const ACTIVITY_CONFIG = {
  problem_solved: {
    emoji: '✅',
    color: '#10b981',
    label: 'Bài toán đã giải',
  },
  streak_milestone: {
    emoji: '🔥',
    color: '#f59e0b',
    label: 'Chuỗi học tập',
  },
  badge_earned: {
    emoji: '🏆',
    color: '#8b5cf6',
    label: 'Huy hiệu',
  },
  followed_user: {
    emoji: '👥',
    color: '#3b82f6',
    label: 'Theo dõi mới',
  },
};

// ── Skeleton Loader ────────────────────────────────────────────
function ActivitySkeleton() {
  return (
    <div className={cx('activity-item', 'activity-item--skeleton')}>
      <div className={cx('activity-skeleton-avatar')} />
      <div className={cx('activity-skeleton-content')}>
        <div className={cx('activity-skeleton-line', 'activity-skeleton-line--long')} />
        <div className={cx('activity-skeleton-line', 'activity-skeleton-line--short')} />
      </div>
    </div>
  );
}

// ── Activity Item Component ────────────────────────────────────
function ActivityItem({ activity, darkMode }) {
  const config = ACTIVITY_CONFIG[activity.type] || {
    emoji: '📢',
    color: '#6b7280',
    label: 'Hoạt động',
  };

  return (
    <div
      className={cx('activity-item', `activity-item--${activity.type}`)}
      style={{ '--activity-color': config.color } }
    >
      {/* Avatar/Icon Section */}
      <div className={cx('activity-avatar')}>
        <div className={cx('activity-icon')}>
          {config.emoji}
        </div>
      </div>

      {/* Content Section */}
      <div className={cx('activity-content-wrapper')}>
        <div className={cx('activity-main')}>
          {/* Activity Description */}
          {activity.type === 'problem_solved' && (
            <p className={cx('activity-text')}>
              <span className={cx('activity-user')}>
                {activity.data.userName || 'Bạn'}
              </span>
              {' '}đã giải quyết bài toán{' '}
              <span className={cx('activity-highlight')}>
                {activity.data.problemName}
              </span>
            </p>
          )}

          {activity.type === 'streak_milestone' && (
            <p className={cx('activity-text')}>
              <span className={cx('activity-user')}>
                {activity.data.userName || 'Bạn'}
              </span>
              {' '}đạt được chuỗi học tập{' '}
              <span className={cx('activity-highlight')}>
                {activity.data.days} ngày 🎯
              </span>
            </p>
          )}

          {activity.type === 'badge_earned' && (
            <p className={cx('activity-text')}>
              <span className={cx('activity-user')}>
                {activity.data.userName || 'Bạn'}
              </span>
              {' '}kiếm được huy hiệu{' '}
              <span className={cx('activity-highlight')}>
                {activity.data.badgeName}
              </span>
            </p>
          )}

          {activity.type === 'followed_user' && (
            <p className={cx('activity-text')}>
              <span className={cx('activity-highlight')}>
                {activity.data.followerName}
              </span>
              {' '}bắt đầu theo dõi bạn
            </p>
          )}

          {!Object.keys(ACTIVITY_CONFIG).includes(activity.type) && (
            <p className={cx('activity-text')}>
              Hoạt động mới: <span className={cx('activity-highlight')}>{activity.type}</span>
            </p>
          )}

          {/* Metadata */}
          <div className={cx('activity-meta')}>
            <time className={cx('activity-time')}>
              {formatTime(activity.timestamp)}
            </time>
            {activity.data.difficulty && (
              <span className={cx('activity-difficulty', `activity-difficulty--${activity.data.difficulty}`)}>
                {activity.data.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {activity.type === 'problem_solved' && (
          <div className={cx('activity-actions')}>
            <button
              className={cx('activity-action-btn')}
              aria-label="Xem bài toán"
              title="Xem bài toán"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Filter Buttons ─────────────────────────────────────────────
function ActivityFilters({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'Tất cả' },
    { id: 'problem_solved', label: '✅ Giải bài' },
    { id: 'streak_milestone', label: '🔥 Chuỗi' },
    { id: 'badge_earned', label: '🏆 Huy hiệu' },
    { id: 'followed_user', label: '👥 Theo dõi' },
  ];

  return (
    <div className={cx('activity-filters')}>
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={cx('activity-filter-btn', {
            'activity-filter-btn--active': activeFilter === filter.id,
          })}
          onClick={() => onFilterChange(filter.id)}
          aria-label={`Lọc theo ${filter.label}`}
          aria-pressed={activeFilter === filter.id}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────
function EmptyState({ darkMode }) {
  return (
    <div className={cx('activity-empty')}>
      <div className={cx('activity-empty-icon')}>👻</div>
      <h3 className={cx('activity-empty-title')}>Chưa có hoạt động nào</h3>
      <p className={cx('activity-empty-text')}>
        Theo dõi những người dùng khác để xem hoạt động của họ ở đây
      </p>
      <button className={cx('activity-empty-action')}>
        Khám phá người dùng
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function ActivityFeed({ uid, darkMode }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef(null);
  const unsubscribeRef = useRef(null);

  // ── Fetch activities ────────────────────────────────────────
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    unsubscribeRef.current = subscribeToActivityFeed(uid, (activityList) => {
      // Sort by timestamp (newest first) and add animation delay
      const sorted = activityList
        .sort((a, b) => b.timestamp - a.timestamp)
        .map((activity, index) => ({
          ...activity,
          delay: index * 0.05,
        }));
      setActivities(sorted);
      setLoading(false);
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [uid]);

  // ── Infinite scroll (optional) ──────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoadingMore && activities.length > 0) {
        setIsLoadingMore(true);
        // Simulate loading more activities
        setTimeout(() => {
          setIsLoadingMore(false);
        }, 800);
      }
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isLoadingMore, activities.length]);

  // ── Filter activities ──────────────────────────────────────
  const filteredActivities = activeFilter === 'all'
    ? activities
    : activities.filter((a) => a.type === activeFilter);

  // ── Render: Not logged in ──────────────────────────────────
  if (!uid) {
    return (
      <div className={cx('activity-feed', { 'activity-feed--dark': darkMode })}>
        <div className={cx('activity-login-prompt')}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
          <p className={cx('activity-login-text')}>
            Vui lòng đăng nhập để xem hoạt động
          </p>
        </div>
      </div>
    );
  }

  // ── Render: Loading skeleton ───────────────────────────────
  if (loading) {
    return (
      <div className={cx('activity-feed', { 'activity-feed--dark': darkMode })}>
        <div className={cx('activity-feed-header')}>
          <h2 className={cx('activity-feed-title')}>🔔 Hoạt Động Gần Đây</h2>
        </div>
        <div className={cx('activity-list')}>
          {[...Array(4)].map((_, i) => (
            <ActivitySkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Render: Empty state ────────────────────────────────────
  if (activities.length === 0) {
    return (
      <div className={cx('activity-feed', { 'activity-feed--dark': darkMode })}>
        <div className={cx('activity-feed-header')}>
          <h2 className={cx('activity-feed-title')}>🔔 Hoạt Động Gần Đây</h2>
        </div>
        <EmptyState darkMode={darkMode} />
      </div>
    );
  }

  // ── Render: Main feed ──────────────────────────────────────
  return (
    <div className={cx('activity-feed', { 'activity-feed--dark': darkMode })}>
      {/* Header */}
      <div className={cx('activity-feed-header')}>
        <h2 className={cx('activity-feed-title')}>🔔 Hoạt Động Gần Đây</h2>
        <p className={cx('activity-feed-subtitle')}>
          {filteredActivities.length} hoạt động từ những người bạn theo dõi
        </p>
      </div>

      {/* Filters */}
      <ActivityFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Activity List */}
      <div className={cx('activity-list')}>
        {filteredActivities.length > 0 ? (
          <>
            {filteredActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                darkMode={darkMode}
              />
            ))}
            {isLoadingMore && (
              <div className={cx('activity-loader')}>
                <div className={cx('activity-spinner')} />
              </div>
            )}
          </>
        ) : (
          <div className={cx('activity-filter-empty')}>
            <p>Chưa có hoạt động thuộc loại này</p>
          </div>
        )}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className={cx('activity-observer')} />
    </div>
  );
}

// ── Time formatting utility ────────────────────────────────────
function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'Vừa xong';
  if (minutes < 60) return `${minutes}m trước`;
  if (hours < 24) return `${hours}h trước`;
  if (days < 7) return `${days}d trước`;
  if (weeks < 4) return `${weeks}w trước`;
  if (months < 12) return `${months}mo trước`;

  return new Date(timestamp).toLocaleDateString('vi-VN');
}