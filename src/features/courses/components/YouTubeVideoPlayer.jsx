import { useState, useRef, useEffect } from 'react';
import styles from '../../../styles/App.module.scss';
import { bindModule } from '../../../utils/bem';

const cx = bindModule(styles);

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url) {
  if (!url) return null;

  // Handle youtube.com/watch?v=ID
  const match1 = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (match1) return match1[1];

  // Handle youtube.com/embed/ID
  const match2 = url.match(/youtube\.com\/embed\/([^/?]+)/);
  if (match2) return match2[1];

  // If it's already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

  return null;
}

function YouTubeVideoPlayer({ url, lessonName, onComplete, isCompleted }) {
  const [isWatching, setIsWatching] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const hasCalledComplete = useRef(false);
  const videoIdRef = useRef(extractYouTubeId(url));

  useEffect(() => {
    hasCalledComplete.current = false;
    setWatchProgress(0);

    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }, [url]);

  useEffect(() => {
    if (isWatching && !intervalRef.current) {
      // Simulate progress tracking every 500ms
      intervalRef.current = setInterval(() => {
        setWatchProgress((prev) => {
          const newProgress = prev + Math.random() * 5; // Simulate ~2-3% per check
          if (newProgress >= 90 && !hasCalledComplete.current && !isCompleted) {
            hasCalledComplete.current = true;
            onComplete();
          }
          return Math.min(newProgress, 100);
        });
      }, 500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isWatching, onComplete, isCompleted]);

  const handleOpenYouTube = () => {
    const videoId = videoIdRef.current;
    if (videoId) {
      setIsWatching(true);
      window.open(`https://www.youtube.com/watch?v=${videoId}`, 'youtube-player', 'width=1280,height=720');
    }
  };

  const getThumbnailUrl = () => {
    const videoId = videoIdRef.current;
    if (!videoId) return null;
    // Using high-quality thumbnail
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  return (
    <div className={cx('youtube-player-container')}>
      <div className={cx('youtube-player-label')}>{lessonName}</div>

      <div className={cx('youtube-thumbnail-wrapper')}>
        <img
          src={getThumbnailUrl()}
          alt={lessonName}
          className={cx('youtube-thumbnail')}
          onError={(e) => {
            // Fallback thumbnail if maxresdefault doesn't exist
            e.target.src = `https://img.youtube.com/vi/${videoIdRef.current}/hqdefault.jpg`;
          }}
        />

        <button
          type="button"
          className={cx('youtube-play-button')}
          onClick={handleOpenYouTube}
          title={`Xem video: ${lessonName}`}
        >
          <div className={cx('youtube-play-icon')}>▶</div>
        </button>

        {isWatching && (
          <div className={cx('youtube-watching-indicator')}>
            Đang xem trên YouTube...
          </div>
        )}
      </div>

      {isWatching && (
        <div className={cx('video-progress-bar')}>
          <div
            className={cx('video-progress-fill')}
            style={{ width: `${watchProgress}%` }}
          />
          <div className={cx('video-progress-text')}>
            {Math.round(watchProgress)}%
          </div>
        </div>
      )}

      {isCompleted && (
        <div className={cx('video-completed-badge')}>✓ Đã hoàn thành</div>
      )}
    </div>
  );
}

export default YouTubeVideoPlayer;
