/**
 * CommentSection.jsx
 * Production-grade discussion system — LeetCode-level polish
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from '../../styles/App.module.scss';
import { bindModule } from '../../utils/bem';
import {
  subscribeToComments,
  postComment,
  deleteComment,
  markAsSolution,
  likeComment,
} from '../../services/commentService';
import DOMPurify from 'dompurify';

const cx = bindModule(styles);

const LANGUAGES = [
  { value: 'python',     label: 'Python',     icon: '🐍' },
  { value: 'javascript', label: 'JavaScript',  icon: '⬡' },
  { value: 'java',       label: 'Java',        icon: '☕' },
  { value: 'cpp',        label: 'C++',         icon: '⚡' },
  { value: 'typescript', label: 'TypeScript',  icon: '🔷' },
  { value: 'go',         label: 'Go',          icon: '🔵' },
  { value: 'rust',       label: 'Rust',        icon: '🦀' },
];

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Mới nhất' },
  { value: 'most_liked', label: 'Nhiều like nhất' },
  { value: 'solutions', label: 'Giải pháp' },
];

function Avatar({ name, size = 28 }) {
  const colors = [
    '#6366f1','#8b5cf6','#ec4899','#f59e0b',
    '#10b981','#3b82f6','#ef4444','#14b8a6',
  ];
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  const initials = (name ?? '?').slice(0, 2).toUpperCase();
  return (
    <span
      className={cx('avatar')}
      style={{ '--avatar-bg': color, '--avatar-size': `${size}px` }}
      aria-label={name}
    >
      {initials}
    </span>
  );
}

// likes có thể là number HOẶC object { uid: true } tùy Firestore schema
function getLikeCount(likes) {
  if (!likes) return 0;
  if (typeof likes === 'number') return likes;
  if (typeof likes === 'object') return Object.keys(likes).length;
  return 0;
}

function LikeButton({ count, liked, onClick, disabled }) {
  const likeCount = getLikeCount(count);
  return (
    <button
      className={cx('action-btn', { 'action-btn--liked': liked })}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={liked}
      title={disabled ? 'Đăng nhập để thích' : liked ? 'Bỏ thích' : 'Thích'}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
      </svg>
      <span>{likeCount}</span>
    </button>
  );
}

function SolutionBadge() {
  return (
    <span className={cx('solution-badge')}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Accepted
    </span>
  );
}

function CommentSkeleton() {
  return (
    <div className={cx('comment-skeleton')}>
      <div className={cx('skeleton-avatar')} />
      <div className={cx('skeleton-body')}>
        <div className={cx('skeleton-line', 'skeleton-line--short')} />
        <div className={cx('skeleton-line')} />
        <div className={cx('skeleton-line', 'skeleton-line--medium')} />
      </div>
    </div>
  );
}

export default function CommentSection({ problemId, uid, userName, darkMode, filterSolutions = false }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newText, setNewText]   = useState('');
  const [posting, setPosting]   = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [language, setLanguage] = useState('python');
  // likedSet track optimistic UI — init từ data nếu likes là object { uid: true }
  const [likedSet, setLikedSet] = useState(new Set());
  const [sortBy, setSortBy]     = useState('newest');
  const [filter, setFilter]     = useState(filterSolutions ? 'solutions' : 'all'); // all | solutions
  const [expandedCode, setExpandedCode] = useState(new Set());
  const textareaRef  = useRef(null);
  const inputAreaRef = useRef(null);
  const isMounted    = useRef(true);

  // Prevent setState on unmounted component (avoids white screen / crash)
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (isMounted.current) setLoading(true);
    let unsub;
    try {
      unsub = subscribeToComments(problemId, (list) => {
        if (!isMounted.current) return;
        setComments(Array.isArray(list) ? list : []);
        setLoading(false);
      });
    } catch (err) {
      console.error('subscribeToComments error:', err);
      if (isMounted.current) setLoading(false);
    }
    return () => {
      try { if (typeof unsub === 'function') unsub(); } catch (_) {}
    };
  }, [problemId]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
  }, [newText]);

  const sortedComments = useCallback(() => {
    let list = [...comments];
    if (filter === 'solutions') list = list.filter((c) => c.solved);
    if (sortBy === 'newest')     list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    if (sortBy === 'most_liked') list.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    if (sortBy === 'solutions')  list.sort((a, b) => Number(b.solved) - Number(a.solved));
    return list;
  }, [comments, sortBy, filter]);

  const handlePost = async () => {
    if (!newText.trim() || !uid) return;
    setPosting(true);
    try {
      await postComment(problemId, {
        text: newText,
        authorId: uid,
        authorName: userName || 'Người dùng',
        codeBlock: codeMode ? newText : null,
        language: codeMode ? language : 'text',
        createdAt: Date.now(),
        likes: 0,
        solved: false,
      });
      setNewText('');
      setCodeMode(false);
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      if (isMounted.current) setPosting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePost();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    try { await deleteComment(problemId, id); }
    catch (err) { console.error('deleteComment error:', err); }
  };

  const handleSolution = async (id, current) => {
    try { await markAsSolution(problemId, id, !current); }
    catch (err) { console.error(err); }
  };

  const handleLike = async (id) => {
    if (!uid) return;
    // Optimistic update using functional form to avoid stale closure
    const wasLiked = likedSet.has(id);
    setLikedSet((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      await likeComment(problemId, id, uid);
    } catch (err) {
      console.error('likeComment error:', err);
      // Revert using functional updater — not a stale closure copy
      if (isMounted.current) {
        setLikedSet((prev) => {
          const revert = new Set(prev);
          wasLiked ? revert.add(id) : revert.delete(id);
          return revert;
        });
      }
    }
  };

  const toggleCode = (id) => {
    const next = new Set(expandedCode);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedCode(next);
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1)  return 'vừa xong';
    if (m < 60) return `${m}p trước`;
    if (h < 24) return `${h}h trước`;
    if (d < 7)  return `${d} ngày trước`;
    return new Date(ts).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
  };

  const totalSolutions = comments.filter((c) => c.solved).length;
  const displayed = sortedComments();

  return (
    <div className={cx('cs', { 'cs--dark': darkMode })}>

      {/* ── Composer ───────────────────────────────────── */}
      <div className={cx('cs__composer')} ref={inputAreaRef}>
        <div className={cx('cs__composer-header')}>
          <span className={cx('cs__section-label')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Thảo luận
          </span>
          <span className={cx('cs__count-pill')}>
            {comments.length} bình luận{totalSolutions > 0 && ` · ${totalSolutions} giải pháp`}
          </span>
        </div>

        {uid ? (
          <>
            <div className={cx('cs__input-wrap', { 'cs__input-wrap--code': codeMode })}>
              <Avatar name={userName} size={26} />
              <div className={cx('cs__input-inner')}>
                <textarea
                  ref={textareaRef}
                  className={cx('cs__textarea', { 'cs__textarea--code': codeMode })}
                  placeholder={codeMode ? '// Nhập code của bạn vào đây...' : 'Chia sẻ ý tưởng hoặc hỏi câu hỏi…'}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  spellCheck={!codeMode}
                />
              </div>
            </div>

            <div className={cx('cs__toolbar')}>
              <div className={cx('cs__toolbar-left')}>
                <button
                  className={cx('cs__toggle-code', { 'cs__toggle-code--active': codeMode })}
                  onClick={() => setCodeMode((v) => !v)}
                  title="Chèn code block"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                  Code
                </button>

                {codeMode && (
                  <div className={cx('cs__lang-select-wrap')}>
                    <select
                      className={cx('cs__lang-select')}
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.icon} {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className={cx('cs__toolbar-right')}>
                <span className={cx('cs__kbd-hint')}>⌘ Enter để gửi</span>
                <button
                  className={cx('cs__submit-btn')}
                  onClick={handlePost}
                  disabled={!newText.trim() || posting}
                >
                  {posting ? (
                    <span className={cx('cs__spinner')} />
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                  {posting ? 'Đang gửi…' : 'Gửi'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className={cx('cs__login-prompt')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Đăng nhập để tham gia thảo luận và chia sẻ giải pháp
          </div>
        )}
      </div>

      {/* ── Controls ───────────────────────────────────── */}
      {!loading && comments.length > 0 && (
        <div className={cx('cs__controls')}>
          {!filterSolutions && (
            <div className={cx('cs__filter-tabs')}>
              {['all', 'solutions'].map((f) => (
                <button
                  key={f}
                  className={cx('cs__filter-tab', { 'cs__filter-tab--active': filter === f })}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? `Tất cả (${comments.length})` : `Giải pháp (${totalSolutions})`}
                </button>
              ))}
            </div>
          )}
          <div className={cx('cs__sort-wrap')}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="9" y2="18"/>
            </svg>
            <select
              className={cx('cs__sort-select')}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── List ───────────────────────────────────────── */}
      <div className={cx('cs__list')}>
        {loading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : displayed.length === 0 ? (
          <div className={cx('cs__empty')}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={cx('cs__empty-icon')}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p className={cx('cs__empty-title')}>
              {filter === 'solutions' ? 'Chưa có giải pháp nào' : 'Chưa có bình luận nào'}
            </p>
            <p className={cx('cs__empty-sub')}>Hãy là người đầu tiên chia sẻ!</p>
          </div>
        ) : (
          displayed.map((comment, idx) => {
            const isOwner     = uid === comment.authorId;
            // liked nếu trong optimistic set, HOẶC nếu likes là object chứa uid
            const likesObj    = typeof comment.likes === 'object' && comment.likes !== null ? comment.likes : {};
            const isLiked     = likedSet.has(comment.id) || (uid && uid in likesObj);
            const codeVisible = expandedCode.has(comment.id);
            const lang        = LANGUAGES.find((l) => l.value === comment.language);

            return (
              <article
                key={comment.id}
                className={cx('cs__comment', { 'cs__comment--solution': comment.solved })}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {comment.solved && <div className={cx('cs__solution-rail')} />}

                {/* Header */}
                <div className={cx('cs__comment-header')}>
                  <Avatar name={comment.authorName} size={28} />
                  <div className={cx('cs__meta')}>
                    <span className={cx('cs__author')}>{comment.authorName || 'Người dùng'}</span>
                    {comment.solved && <SolutionBadge />}
                    <span className={cx('cs__time')}>{formatDate(comment.createdAt)}</span>
                  </div>
                  {isOwner && (
                    <button
                      className={cx('cs__delete-btn')}
                      onClick={() => handleDelete(comment.id)}
                      title="Xóa bình luận"
                      aria-label="Xóa bình luận"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className={cx('cs__comment-body')}>
                  <div
                    className={cx('cs__text')}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(comment.text, {
                        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'code', 'pre'],
                        ALLOWED_ATTR: [],
                      }),
                    }}
                  />

                  {comment.codeBlock && (
                    <div className={cx('cs__code-wrap')}>
                      <div className={cx('cs__code-header')}>
                        <div className={cx('cs__code-dots')}>
                          <span /><span /><span />
                        </div>
                        <span className={cx('cs__code-lang')}>
                          {lang?.icon} {lang?.label ?? comment.language}
                        </span>
                        <button
                          className={cx('cs__code-toggle')}
                          onClick={() => toggleCode(comment.id)}
                        >
                          {codeVisible ? (
                            <>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                              Thu gọn
                            </>
                          ) : (
                            <>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                              Xem code
                            </>
                          )}
                        </button>
                      </div>
                      {codeVisible && (
                        <pre className={cx('cs__code-block')}>
                          <code>{comment.codeBlock}</code>
                        </pre>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className={cx('cs__comment-footer')}>
                  <LikeButton
                    count={comment.likes}
                    liked={isLiked}
                    onClick={() => handleLike(comment.id)}
                    disabled={!uid}
                  />

                  {uid && (
                    <button
                      className={cx('action-btn', { 'action-btn--solution': comment.solved })}
                      onClick={() => handleSolution(comment.id, comment.solved)}
                      title={comment.solved ? 'Bỏ đánh dấu giải pháp' : 'Đánh dấu là giải pháp'}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={comment.solved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                      </svg>
                      {comment.solved ? 'Giải pháp' : 'Đánh dấu'}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}