import { useState, useRef, useEffect } from 'react';
import styles from '../../../styles/App.module.scss';
import { bindModule } from '../../../utils/bem';
import AppIcon from '../../../components/ui/AppIcon';
import { getCourseProgress } from '../../learnflow2/helpers';
import YouTubeVideoPlayer from './YouTubeVideoPlayer';

const cx = bindModule(styles);

function AudioPlayer({ src, lessonName, onComplete, isCompleted }) {
  const audioRef = useRef(null);
  const hasCalledComplete = useRef(false);

  useEffect(() => {
    hasCalledComplete.current = false;
    if (audioRef.current) audioRef.current.currentTime = 0;
  }, [src]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const percent = (audio.currentTime / audio.duration) * 100;
    if (percent >= 90 && !hasCalledComplete.current && !isCompleted) {
      hasCalledComplete.current = true;
      onComplete();
    }
  };

  return (
    <div className={cx('audio-player-container')}>
      <div className={cx('audio-player-label')}>{lessonName}</div>

      <audio
        ref={audioRef}
        src={`/${src}`}
        controls
        onTimeUpdate={handleTimeUpdate}
        style={{ width: '100%', marginTop: '8px' }}
      />

      {isCompleted && (
        <div className={cx('video-completed-badge')}>✓ Đã hoàn thành</div>
      )}
    </div>
  );
}

function VideoPlayer({ src, lessonName, onComplete, isCompleted }) {
  const videoRef = useRef(null);
  const hasCalledComplete = useRef(false);

  useEffect(() => {
    hasCalledComplete.current = false;
    if (videoRef.current) videoRef.current.currentTime = 0;
  }, [src]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const percent = (video.currentTime / video.duration) * 100;
    if (percent >= 90 && !hasCalledComplete.current && !isCompleted) {
      hasCalledComplete.current = true;
      onComplete();
    }
  };

  return (
    <div className={cx('audio-player-container')}>
      <div className={cx('audio-player-label')}>{lessonName}</div>

      <video
        ref={videoRef}
        src={src ? `/${src}` : undefined}
        controls
        onTimeUpdate={handleTimeUpdate}
        style={{
          width: '100%',
          marginTop: '10px',
          borderRadius: '12px',
          background: '#000',
        }}
      />

      {isCompleted && (
        <div className={cx('video-completed-badge')}>✓ Đã hoàn thành</div>
      )}
    </div>
  );
}

export default function CourseDetailDrawer({
  course,
  courseProgress,
  isTracked,
  onClose,
  onContinueLesson,
  onMarkLesson,
  onTrackCourse,
  onUntrackCourse,
}) {
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(null);

  if (!course) return null;

  const progress = getCourseProgress(course, courseProgress);
  const progressMap = courseProgress[course.id] || {};
  const firstUndoneIndex = course.lessons.findIndex((_, index) => !progressMap[index]);

  const selectedLesson =
    selectedLessonIndex !== null ? course.lessons[selectedLessonIndex] : null;

  // Check if lesson has YouTube video
  const hasYouTubeVideo = Boolean(selectedLesson?.youtubeUrl);
  // Check if lesson has video (videoSrc) or is video type
  const hasVideo = Boolean(selectedLesson?.videoSrc) || selectedLesson?.type === 'video';
  const hasAudio = Boolean(selectedLesson?.src) && !hasVideo && !hasYouTubeVideo;

  const closePlayer = () => setSelectedLessonIndex(null);

  return (
    <div className={cx('drawer-backdrop')} onClick={onClose} role="presentation">
      <div
        className={cx('drawer')}
        onClick={(event) => event.stopPropagation()}
        role="presentation"
      >
        <div className={cx('drawer__banner')} style={{ background: course.color }}>
          {course.emoji}
          <button
            type="button"
            className={cx('drawer__close')}
            onClick={onClose}
            aria-label="Đóng chi tiết khóa học"
          >
            <AppIcon name="close" size="sm" />
          </button>
        </div>

        <div className={cx('drawer__body')}>
          <div className={cx('drawer__title')}>{course.name}</div>
          <div className={cx('drawer__meta')}>
            {`${course.teacher} • ${course.category} • ${course.totalLessons} bài học`}
          </div>

          <div className={cx('button-row')}>
            {isTracked ? (
              <button
                type="button"
                className={cx('button', 'button--ghost')}
                onClick={() => onUntrackCourse(course)}
              >
                Bỏ theo dõi
              </button>
            ) : (
              <button
                type="button"
                className={cx('button', 'button--primary')}
                onClick={() => onTrackCourse(course)}
              >
                Theo dõi khóa học
              </button>
            )}
          </div>

          <div className={cx('drawer__progress')}>
            <div className={cx('drawer__progress-header')}>
              <span>Tiến độ</span>
              <span style={{ color: course.fill }}>{`${progress.pct}%`}</span>
            </div>

            <div className={cx('progress-bar')}>
              <div
                className={cx('progress-bar__fill')}
                style={{ width: `${progress.pct}%`, background: course.fill }}
              />
            </div>

            <div className={cx('drawer__progress-sub')}>
              {`${progress.done} / ${progress.total} bài đã hoàn thành • Còn ${
                progress.total - progress.done
              } bài`}
            </div>
          </div>

          {/* PLAYER SECTION */}
          {(hasAudio || hasVideo || hasYouTubeVideo) && selectedLessonIndex !== null && (
            <div className={cx('video-section')}>
              <div className={cx('video-section__header')}>
                <h3>{selectedLesson.name}</h3>
                <button
                  type="button"
                  className={cx('video-section__close')}
                  onClick={closePlayer}
                >
                  <AppIcon name="close" size="sm" />
                </button>
              </div>
              {hasYouTubeVideo && (
                <YouTubeVideoPlayer
                  url={selectedLesson.youtubeUrl}
                  lessonName={selectedLesson.name}
                  isCompleted={Boolean(progressMap[selectedLessonIndex])}
                  onComplete={() => {
                    if (!progressMap[selectedLessonIndex]) {
                      onMarkLesson(course.id, selectedLessonIndex);
                    }
                  }}
                />
              )}

              {hasAudio && (
                <AudioPlayer
                  src={selectedLesson.src}
                  lessonName={selectedLesson.name}
                  isCompleted={Boolean(progressMap[selectedLessonIndex])}
                  onComplete={() => {
                    if (!progressMap[selectedLessonIndex]) {
                      onMarkLesson(course.id, selectedLessonIndex);
                    }
                  }}
                />
              )}

              {hasVideo && (
                <VideoPlayer
                  src={selectedLesson.videoSrc || selectedLesson.src}
                  lessonName={selectedLesson.name}
                  isCompleted={Boolean(progressMap[selectedLessonIndex])}
                  onComplete={() => {
                    if (!progressMap[selectedLessonIndex]) {
                      onMarkLesson(course.id, selectedLessonIndex);
                    }
                  }}
                />
              )}
            </div>
          )}

          {/* LESSON LIST */}
          <div className={cx('lesson-list')}>
            {!isTracked ? (
              <div className={cx('placeholder-box')}>
                Theo dõi khóa học trước để bắt đầu lưu tiến độ.
              </div>
            ) : null}

            {course.lessons.map((lesson, index) => {
              const isDone = Boolean(progressMap[index]);
              const isActive = index === firstUndoneIndex;
              const hasLessonYouTube = Boolean(lesson.youtubeUrl);
              const hasLessonAudio = Boolean(lesson.src);
              const hasLessonVideo = Boolean(lesson.videoSrc);
              const isPlayable = hasLessonAudio || hasLessonVideo || hasLessonYouTube;

              const handleClick = () => {
                if (!isTracked) return;

                if (isPlayable) {
                  setSelectedLessonIndex(index);
                } else {
                  onMarkLesson(course.id, index);
                }
              };

              return (
                <button
                  type="button"
                  key={`${course.id}-${lesson.name}-${index}`}
                  className={cx(
                    'lesson-row',
                    isDone ? 'lesson-row--done' : '',
                    isActive ? 'lesson-row--active' : ''
                  )}
                  onClick={handleClick}
                >
                  <div
                    className={cx(
                      'lesson-row__number',
                      isDone
                        ? 'lesson-row__number--done'
                        : isActive
                        ? 'lesson-row__number--active'
                        : ''
                    )}
                  >
                    {isPlayable && !isDone ? '▶' : index + 1}
                  </div>

                  <div className={cx('lesson-row__content')}>
                    <div className={cx('lesson-row__name')}>
                      {lesson.name}
                      {hasLessonYouTube && (
                        <span className={cx('video-badge')}>📺 YouTube</span>
                      )}
                      {hasLessonAudio && (
                        <span className={cx('video-badge')}>🎵 Audio</span>
                      )}
                      {hasLessonVideo && (
                        <span className={cx('video-badge')}>🎬 Video</span>
                      )}
                    </div>

                    <div className={cx('lesson-row__meta')}>{`⏱ ${lesson.dur}`}</div>
                  </div>

                  <div className={cx('lesson-row__status')}>
                    {isDone ? (
                      '✓'
                    ) : isActive ? (
                      <AppIcon name="play" size="sm" />
                    ) : isPlayable ? (
                      '▶'
                    ) : (
                      '○'
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* BUTTONS */}
          <div className={cx('button-row')}>
            <button
              type="button"
              className={cx('button', 'button--primary')}
              onClick={onContinueLesson}
            >
              {!isTracked ? (
                'Theo dõi để bắt đầu'
              ) : firstUndoneIndex >= 0 ? (
                <>
                  <AppIcon name="play" size="sm" />
                  {`Tiếp tục: ${course.lessons[firstUndoneIndex].name.slice(0, 24)}...`}
                </>
              ) : (
                '🏆 Đã hoàn thành'
              )}
            </button>

            <button type="button" className={cx('button', 'button--ghost')} onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}