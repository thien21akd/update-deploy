/**
 * UserProfileCard.jsx
 * Professional user profile card with enhanced UX, animations, and interactive features
 * Inspired by modern social network designs (Facebook, LinkedIn style)
 */

import { useEffect, useState } from 'react';
import styles from '../../styles/userprofilecard.module.scss';
import { bindModule } from '../../utils/bem';
import { getPublicProfile, getUserStats } from '../../services/profileService';
import {
  getFollowing,
  getFollowers,
  isFollowing,
  followUser,
  unfollowUser,
} from '../../services/followService';

const cx = bindModule(styles);

// ────────────────────────────────────────────────────────────────
// ─ Avatar Component ─
// ────────────────────────────────────────────────────────────────
function Avatar({ profile, size = 'lg', status = null }) {
  const sizeMap = {
    sm: 'upc-avatar--sm',
    md: 'upc-avatar--md',
    lg: 'upc-avatar--lg',
    xl: 'upc-avatar--xl',
  };

  return (
    <div className={cx('upc-avatar-wrapper', sizeMap[size])}>
      {profile?.photoUrl ? (
        <img
          className={cx('upc-avatar')}
          src={profile.photoUrl}
          alt={profile.displayName || 'User'}
          loading="lazy"
        />
      ) : (
        <div className={cx('upc-avatar', 'upc-avatar--initials')}>
          {profile?.displayName?.charAt(0).toUpperCase() || 'U'}
        </div>
      )}
      {status && (
        <div className={cx('upc-status-indicator', `upc-status-indicator--${status}`)} />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// ─ Stats Component ─
// ────────────────────────────────────────────────────────────────
function StatCard({ value, label, icon, accent = false, onClick }) {
  return (
    <button
      className={cx('upc-stat-card', {
        'upc-stat-card--accent': accent,
      })}
      onClick={onClick}
      title={label}
    >
      {icon && <span className={cx('upc-stat-icon')}>{icon}</span>}
      <div className={cx('upc-stat-content')}>
        <div className={cx('upc-stat-value')}>{value ?? '—'}</div>
        <div className={cx('upc-stat-label')}>{label}</div>
      </div>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// ─ Info Row Component ─
// ────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, link = null, action = null }) {
  const content = (
    <div className={cx('upc-info-row')}>
      <span className={cx('upc-info-icon')} aria-hidden="true">
        {icon}
      </span>
      <div className={cx('upc-info-content')}>
        <span className={cx('upc-info-label')}>{label}</span>
        <span className={cx('upc-info-value')}>{value}</span>
      </div>
      {action && <span className={cx('upc-info-action')}>{action}</span>}
    </div>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={cx('upc-info-link')}
      >
        {content}
      </a>
    );
  }

  return content;
}

// ────────────────────────────────────────────────────────────────
// ─ Follow Button Component ─
// ────────────────────────────────────────────────────────────────
function FollowButton({ following, loading, onClick, size = 'md' }) {
  const sizeMap = {
    sm: 'upc-follow-btn--sm',
    md: 'upc-follow-btn--md',
    lg: 'upc-follow-btn--lg',
  };

  return (
    <button
      type="button"
      className={cx('upc-follow-btn', sizeMap[size], {
        'upc-follow-btn--following': following,
        'upc-follow-btn--loading': loading,
      })}
      onClick={onClick}
      disabled={loading}
      aria-label={following ? 'Bỏ theo dõi' : 'Theo dõi'}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <span className={cx('upc-spinner')} />
          <span>Đang tải...</span>
        </>
      ) : following ? (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Đang theo dõi</span>
        </>
      ) : (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Theo dõi</span>
        </>
      )}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// ─ Skeleton Loader ─
// ────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div
      className={cx('upc-card', 'upc-card--skeleton')}
      aria-busy="true"
      aria-label="Đang tải hồ sơ"
    >
      {/* Header skeleton */}
      <div className={cx('upc-header-skeleton')}>
        <div className={cx('upc-avatar-skeleton')} />
        <div className={cx('upc-header-info-skeleton')}>
          <div className={cx('upc-skeleton-line', 'upc-skeleton-line--title')} />
          <div className={cx('upc-skeleton-line', 'upc-skeleton-line--subtitle')} />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className={cx('upc-stats-skeleton')}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={cx('upc-stat-skeleton')}>
            <div className={cx('upc-skeleton-line', 'upc-skeleton-line--stat')} />
            <div className={cx('upc-skeleton-line', 'upc-skeleton-line--stat-label')} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// ─ Main Component ─
// ────────────────────────────────────────────────────────────────
export default function UserProfileCard({ uid, currentUid, darkMode }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  // ── Load profile data ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [profileData, statsData, followers, followingList] = await Promise.all([
          getPublicProfile(uid),
          getUserStats(uid),
          getFollowers(uid),
          getFollowing(uid),
        ]);

        if (cancelled) return;

        setProfile(profileData);
        setStats(statsData);
        setFollowerCount(followers.length);
        setFollowingCount(followingList.length);

        // Check if current user is following this user
        if (currentUid && currentUid !== uid) {
          const isCurrentFollowing = await isFollowing(currentUid, uid);
          if (!cancelled) setFollowing(isCurrentFollowing);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.error('UserProfileCard load error:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid, currentUid]);

  // ── Handle follow/unfollow ─────────────────────────────────
  const handleFollowToggle = async () => {
    if (!currentUid) {
      alert('Vui lòng đăng nhập để theo dõi.');
      return;
    }

    setFollowLoading(true);
    try {
      if (following) {
        await unfollowUser(currentUid, uid);
        setFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      } else {
        await followUser(currentUid, uid);
        setFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setFollowLoading(false);
    }
  };

  // ── Calculate metrics ──────────────────────────────────────
  const acRate =
    stats?.totalSubmissions && stats.totalSubmissions > 0
      ? Math.round((stats.solvedCount / stats.totalSubmissions) * 100)
      : null;

  const isSelf = currentUid === uid;

  // ── Render: Loading state ──────────────────────────────────
  if (loading) {
    return <Skeleton />;
  }

  // ── Render: Error state ────────────────────────────────────
  if (error || !profile) {
    return (
      <div className={cx('upc-card', 'upc-card--error', { 'upc-card--dark': darkMode })}>
        <div className={cx('upc-error-content')}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M12 8v5M12 16h.01"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <h3 className={cx('upc-error-title')}>Không tìm thấy người dùng</h3>
          <p className={cx('upc-error-text')}>
            Người dùng này không tồn tại hoặc đã bị xóa
          </p>
        </div>
      </div>
    );
  }

  const displayLanguages = showAllLanguages
    ? profile.preferredLanguages
    : profile.preferredLanguages?.slice(0, 5);

  // ── Render: Main card ──────────────────────────────────────
  return (
    <div className={cx('upc-card', { 'upc-card--dark': darkMode })}>
      {/* ── Header Section ── */}
      <div className={cx('upc-header')}>
        <div className={cx('upc-header-content')}>
          <Avatar profile={profile} size="xl" status="online" />

          <div className={cx('upc-header-info')}>
            <h2 className={cx('upc-name')}>{profile.displayName || 'Anonymous'}</h2>
            {profile.bio && <p className={cx('upc-bio')}>{profile.bio}</p>}

            {/* Status badges */}
            <div className={cx('upc-badges')}>
              {profile.isVerified && (
                <span className={cx('upc-badge', 'upc-badge--verified')} title="Đã xác minh">
                  ✓ Verified
                </span>
              )}
              {stats?.solvedCount > 100 && (
                <span className={cx('upc-badge', 'upc-badge--elite')} title="Giải quyết hơn 100 bài">
                  🌟 Elite
                </span>
              )}
            </div>
          </div>

          {/* Follow button */}
          {!isSelf && currentUid && (
            <FollowButton
              following={following}
              loading={followLoading}
              onClick={handleFollowToggle}
              size="lg"
            />
          )}
        </div>

        {/* Header action buttons */}
        {isSelf && (
          <div className={cx('upc-header-actions')}>
            <button className={cx('upc-action-btn')} title="Chỉnh sửa hồ sơ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
            <button className={cx('upc-action-btn')} title="Cài đặt">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Stats Grid ── */}
      <div className={cx('upc-stats-grid')}>
        <StatCard
          value={stats?.solvedCount}
          label="Bài giải"
          icon="✅"
          accent
        />
        <StatCard
          value={stats?.totalSubmissions}
          label="Nộp bài"
          icon="📤"
        />
        <StatCard
          value={followerCount}
          label="Người theo dõi"
          icon="👥"
        />
        <StatCard
          value={followingCount}
          label="Đang theo dõi"
          icon="🔗"
        />
        {acRate !== null && (
          <StatCard
            value={`${acRate}%`}
            label="Tỷ lệ AC"
            icon="📊"
          />
        )}
      </div>

      {/* ── Info Section ── */}
      {(profile.company || profile.location || profile.website) && (
        <div className={cx('upc-info-section')}>
          <h3 className={cx('upc-section-title')}>Thông tin cơ bản</h3>
          <div className={cx('upc-info-list')}>
            {profile.company && (
              <InfoRow icon="🏢" label="Công ty" value={profile.company} />
            )}
            {profile.location && (
              <InfoRow icon="📍" label="Vị trí" value={profile.location} />
            )}
            {profile.website && (
              <InfoRow
                icon="🔗"
                label="Website"
                value={profile.website.replace(/^https?:\/\//, '')}
                link={profile.website}
              />
            )}
            {profile.joinDate && (
              <InfoRow
                icon="📅"
                label="Tham gia"
                value={new Date(profile.joinDate).toLocaleDateString('vi-VN')}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Skills/Languages Section ── */}
      {profile.preferredLanguages?.length > 0 && (
        <div className={cx('upc-skills-section')}>
          <h3 className={cx('upc-section-title')}>Ngôn ngữ lập trình</h3>
          <div className={cx('upc-skill-list')}>
            {displayLanguages?.map((lang) => (
              <span key={lang} className={cx('upc-skill-tag')}>
                {lang}
              </span>
            ))}
            {profile.preferredLanguages.length > 5 && !showAllLanguages && (
              <button
                className={cx('upc-skill-more')}
                onClick={() => setShowAllLanguages(true)}
              >
                +{profile.preferredLanguages.length - 5} thêm
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className={cx('upc-footer')}>
        <p className={cx('upc-footer-text')}>
          ID người dùng: <code>{uid}</code>
        </p>
      </div>
    </div>
  );
}