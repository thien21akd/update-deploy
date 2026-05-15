import styles from '../../../styles/App.module.scss';
import { bindModule } from '../../../utils/bem';
import { getCourseProgress } from '../../learnflow2/helpers';
import { COURSE_FILTER_OPTIONS } from '../constants';

const cx = bindModule(styles);

export default function CoursesPage({
  courseFilter,
  filteredCourses,
  onAddCourse,
  onFilterChange,
  onOpenCourseDetail,
  courseProgress,
  trackedCourseIds,
}) {
  // Trang chỉ nhận dữ liệu đã lọc từ App để tránh nhân đôi source of truth cho filter/progress.
  return (
    <div className={cx('page-stack')}>
      <div className={cx('section-heading')}>
        <div>
          <h2>Tất cả khóa học</h2>
          <p>{`${filteredCourses.length} khóa học • ${filteredCourses.filter((course) => getCourseProgress(course, courseProgress).pct === 100).length} đã hoàn thành`}</p>
        </div>
        <button type="button" className={cx('button', 'button--primary')} onClick={onAddCourse}>
          + Thêm khóa học
        </button>
      </div>

      <div className={cx('filter-row')}>
        {COURSE_FILTER_OPTIONS.map(([filterId, label]) => (
          <button
            type="button"
            key={filterId}
            className={cx('filter-button', courseFilter === filterId ? 'filter-button--active' : '')}
            onClick={() => onFilterChange(filterId)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={cx('course-grid')}>
        {filteredCourses.map((course) => {
          const progress = getCourseProgress(course, courseProgress);
          const isTracked = trackedCourseIds.has(course.id);

          return (
            <button key={course.id} className={cx('course-card')} type="button" onClick={() => onOpenCourseDetail(course.id)}>
              <div className={cx('course-card__banner')} style={{ background: course.color }}>
                {course.emoji}
              </div>
              <div className={cx('course-card__body')}>
                <div className={cx('course-card__title')}>{course.name}</div>
                <div className={cx('course-card__meta')}>{`${course.teacher} - ${course.category}`}</div>
                <div className={cx('course-card__progress')}>
                  <span>Tiến độ</span>
                  <span style={{ color: course.fill }}>{`${progress.pct}%`}</span>
                </div>
                <div className={cx('progress-bar')}>
                  <div className={cx('progress-bar__fill')} style={{ width: `${progress.pct}%`, background: course.fill }} />
                </div>
                <div className={cx('course-card__footer')}>
                  <span>{isTracked ? `${progress.done} / ${progress.total} bài đã học` : 'Chưa theo dõi'}</span>
                  <span className={cx('badge', `badge--${isTracked ? 'live' : course.tag}`)}>{isTracked ? 'Đang theo dõi' : course.tagText}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
