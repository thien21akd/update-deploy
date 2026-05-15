import React, { useState, useEffect } from 'react';
import styles from '../../styles/App.module.scss';
import { bindModule } from '../../utils/bem';
import { getAllUsers, updateUserRole, setGlobalCourses, setGlobalProblems, deleteUser } from '../../services/adminService';
import { COURSES as DEFAULT_COURSES } from '../../data/courses';
import { PROBLEMS as DEFAULT_PROBLEMS } from '../../data/problems';
import { useAuth } from '../../hooks/useAuth';

const cx = bindModule(styles);

export default function AdminDashboard({ catalogCourses, catalogProblems, showToast }) {
  const { currentUser: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [users, setUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Forms state
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingProblem, setEditingProblem] = useState(null);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      setUsers(data || {});
    } catch (error) {
      showToast('Không thể tải danh sách người dùng', '⚠️');
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleSyncCourses() {
    try {
      await setGlobalCourses(DEFAULT_COURSES);
      showToast('Đồng bộ Khóa học thành công', '✅');
    } catch (error) {
      showToast('Lỗi đồng bộ: ' + error.message, '⚠️');
    }
  }

  async function handleSyncProblems() {
    try {
      await setGlobalProblems(DEFAULT_PROBLEMS);
      showToast('Đồng bộ Bài luyện code thành công', '✅');
    } catch (error) {
      showToast('Lỗi đồng bộ: ' + error.message, '⚠️');
    }
  }

  async function handlePromote(uid) {
    if (!window.confirm('Cấp quyền Admin cho người dùng này?')) return;
    try {
      await updateUserRole(uid, 'admin');
      showToast('Đã cấp quyền Admin', '✅');
      loadUsers();
    } catch (error) {
      showToast('Lỗi: ' + error.message, '⚠️');
    }
  }

  async function handleDemote(uid, role) {
    if (role === 'superadmin') {
      showToast('Không thể giáng cấp Superadmin!', '⚠️');
      return;
    }
    if (uid === authUser?.uid) {
      showToast('Bạn không thể tự giáng cấp chính mình!', '⚠️');
      return;
    }
    if (!window.confirm('Hủy quyền Admin của người dùng này?')) return;
    try {
      await updateUserRole(uid, 'user');
      showToast('Đã giáng cấp thành User', '✅');
      loadUsers();
    } catch (error) {
      showToast('Lỗi: ' + error.message, '⚠️');
    }
  }

  async function handleDeleteUser(uid, role) {
    if (role === 'superadmin') {
      showToast('Không thể xóa Superadmin!', '⚠️');
      return;
    }
    if (uid === authUser?.uid) {
      showToast('Bạn không thể xóa tài khoản của chính mình từ đây!', '⚠️');
      return;
    }
    if (!window.confirm('Hành động này sẽ XÓA VĨNH VIỄN toàn bộ dữ liệu của người dùng này (tiến trình, điểm, khóa học, cài đặt). Xác nhận xóa?')) return;
    try {
      await deleteUser(uid);
      showToast('Đã xóa dữ liệu người dùng', '🗑');
      loadUsers();
    } catch (error) {
      showToast('Lỗi xóa: ' + error.message, '⚠️');
    }
  }

  async function handleDeleteCourse(id) {
    if (!window.confirm('Xóa khóa học này?')) return;
    try {
      const updated = catalogCourses.filter(c => c.id !== id);
      await setGlobalCourses(updated);
      showToast('Đã xóa khóa học', '🗑');
    } catch (error) {
      showToast('Lỗi xóa: ' + error.message, '⚠️');
    }
  }

  async function handleDeleteProblem(id) {
    if (!window.confirm('Xóa bài luyện code này?')) return;
    try {
      const updated = catalogProblems.filter(p => p.id !== id);
      await setGlobalProblems(updated);
      showToast('Đã xóa bài luyện code', '🗑');
    } catch (error) {
      showToast('Lỗi xóa: ' + error.message, '⚠️');
    }
  }

  async function handleSaveCourse(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCourse = {
      id: formData.get('id') || `c_${Date.now()}`,
      name: formData.get('name'),
      category: formData.get('category'),
      teacher: formData.get('teacher') || 'Chưa rõ',
      emoji: formData.get('emoji') || '📘',
      lessons: editingCourse?.lessons || [],
      tagText: editingCourse?.tagText || 'Mới cập nhật',
      tag: editingCourse?.tag || 'new',
    };
    
    try {
      let updated;
      if (editingCourse?.isNew) {
        if (catalogCourses.some(c => c.id === newCourse.id)) {
          showToast('ID khóa học đã tồn tại!', '⚠️');
          return;
        }
        updated = [...catalogCourses, newCourse];
      } else {
        updated = catalogCourses.map(c => c.id === newCourse.id ? { ...c, ...newCourse } : c);
      }
      await setGlobalCourses(updated);
      showToast('Đã lưu khóa học', '✅');
      setEditingCourse(null);
    } catch (error) {
      showToast('Lỗi: ' + error.message, '⚠️');
    }
  }

  async function handleSaveProblem(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProblem = {
      id: Number(formData.get('id')) || Date.now(),
      name: formData.get('name'),
      diff: formData.get('diff'),
      tags: editingProblem?.tags || ['Khác'],
      description: editingProblem?.description || 'Chưa có mô tả',
      starter: editingProblem?.starter || { python: '', javascript: '' },
      examples: editingProblem?.examples || [],
      constraints: editingProblem?.constraints || [],
      testcases: editingProblem?.testcases || []
    };

    try {
      let updated;
      if (editingProblem?.isNew) {
        if (catalogProblems.some(p => p.id === newProblem.id)) {
          showToast('ID bài tập đã tồn tại!', '⚠️');
          return;
        }
        updated = [...catalogProblems, newProblem];
      } else {
        updated = catalogProblems.map(p => p.id === newProblem.id ? { ...p, ...newProblem } : p);
      }
      await setGlobalProblems(updated);
      showToast('Đã lưu bài luyện code', '✅');
      setEditingProblem(null);
    } catch (error) {
      showToast('Lỗi: ' + error.message, '⚠️');
    }
  }

  // Cấu hình form style cho tính tương phản tốt (tự động đồng bộ light/dark mode qua CSS variables)
  const formStyle = {
    marginBottom: '24px', 
    padding: '24px', 
    background: 'var(--surface-elevated)', 
    borderRadius: '16px',
    border: '2px solid var(--indigo)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
    position: 'relative',
    overflow: 'hidden'
  };

  const formHeaderStyle = {
    marginBottom: '20px', 
    paddingBottom: '16px', 
    borderBottom: '1px solid var(--surface-active)',
    color: 'var(--text-1)'
  };

  const inputLabelStyle = {
    display: 'block', 
    marginBottom: '8px', 
    fontSize: '14px', 
    fontWeight: '600', 
    color: 'var(--text-2)'
  };

  return (
    <div className={cx('page-stack')}>
      <div className={cx('section-heading')}>
        <div>
          <h2>Bảng Điều Khiển Quản Trị</h2>
          <p>Quản lý hệ thống, dữ liệu học tập và phân quyền người dùng</p>
        </div>
      </div>
      
      <div className={cx('tabs')}>
        <button type="button" className={cx('tabs__item', activeTab === 'courses' ? 'tabs__item--active' : '')} onClick={() => setActiveTab('courses')}>Khóa học</button>
        <button type="button" className={cx('tabs__item', activeTab === 'problems' ? 'tabs__item--active' : '')} onClick={() => setActiveTab('problems')}>Bài luyện code</button>
        <button type="button" className={cx('tabs__item', activeTab === 'users' ? 'tabs__item--active' : '')} onClick={() => setActiveTab('users')}>Người dùng</button>
      </div>

      {activeTab === 'courses' && (
        <section className={cx('card')}>
          <div className={cx('card__header')}>
            <div className={cx('card__title')}>Quản lý Khóa học</div>
            <div style={{display: 'flex', gap: '8px'}}>
              <button type="button" className={cx('button', 'button--primary')} onClick={() => setEditingCourse({ isNew: true })}>Thêm Khóa học</button>
              <button type="button" className={cx('button', 'button--secondary')} onClick={handleSyncCourses}>Đồng bộ gốc</button>
            </div>
          </div>
          
          {editingCourse && (
            <div className={cx('settings-list')} style={formStyle}>
              <h3 style={formHeaderStyle}>{editingCourse.isNew ? '✨ Thêm Khóa học mới' : '✏️ Sửa Khóa học'}</h3>
              <form onSubmit={handleSaveCourse} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div>
                  <label style={inputLabelStyle}>ID Khóa học</label>
                  <input className={cx('input')} name="id" defaultValue={editingCourse.id || ''} placeholder="vd: c1" readOnly={!editingCourse.isNew} required style={{width: '100%', background: !editingCourse.isNew ? 'var(--surface-active)' : undefined}}/>
                </div>
                <div>
                  <label style={inputLabelStyle}>Tên Khóa học</label>
                  <input className={cx('input')} name="name" defaultValue={editingCourse.name || ''} placeholder="vd: Lập trình ReactJS" required style={{width: '100%'}}/>
                </div>
                <div>
                  <label style={inputLabelStyle}>Danh mục</label>
                  <input className={cx('input')} name="category" defaultValue={editingCourse.category || ''} placeholder="vd: Frontend" required style={{width: '100%'}}/>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                  <div>
                    <label style={inputLabelStyle}>Giáo viên</label>
                    <input className={cx('input')} name="teacher" defaultValue={editingCourse.teacher || ''} placeholder="Tên giáo viên" required style={{width: '100%'}}/>
                  </div>
                  <div>
                    <label style={inputLabelStyle}>Emoji</label>
                    <input className={cx('input')} name="emoji" defaultValue={editingCourse.emoji || ''} placeholder="vd: ⚛️" required style={{width: '100%'}}/>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
                  <button type="submit" className={cx('button', 'button--primary')} style={{flex: 1}}>Lưu Khóa Học</button>
                  <button type="button" className={cx('button', 'button--ghost')} onClick={() => setEditingCourse(null)} style={{flex: 1}}>Hủy Bỏ</button>
                </div>
              </form>
            </div>
          )}

          <table className={cx('problem-table')}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên khóa học</th>
                <th>Danh mục</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {catalogCourses.map(course => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>{course.name}</td>
                  <td>{course.category}</td>
                  <td>
                    <button type="button" className={cx('button', 'button--ghost')} style={{color: 'var(--blue)'}} onClick={() => setEditingCourse(course)}>Sửa</button>
                    <button type="button" className={cx('button', 'button--ghost')} style={{color: 'var(--rose)'}} onClick={() => handleDeleteCourse(course.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'problems' && (
        <section className={cx('card')}>
          <div className={cx('card__header')}>
            <div className={cx('card__title')}>Quản lý Bài luyện code</div>
            <div style={{display: 'flex', gap: '8px'}}>
              <button type="button" className={cx('button', 'button--primary')} onClick={() => setEditingProblem({ isNew: true })}>Thêm Bài tập</button>
              <button type="button" className={cx('button', 'button--secondary')} onClick={handleSyncProblems}>Đồng bộ gốc</button>
            </div>
          </div>

          {editingProblem && (
            <div className={cx('settings-list')} style={formStyle}>
              <h3 style={formHeaderStyle}>{editingProblem.isNew ? '✨ Thêm Bài tập mới' : '✏️ Sửa Bài tập'}</h3>
              <form onSubmit={handleSaveProblem} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div>
                  <label style={inputLabelStyle}>ID Bài tập</label>
                  <input className={cx('input')} type="number" name="id" defaultValue={editingProblem.id || ''} placeholder="vd: 41" readOnly={!editingProblem.isNew} required style={{width: '100%', background: !editingProblem.isNew ? 'var(--surface-active)' : undefined}}/>
                </div>
                <div>
                  <label style={inputLabelStyle}>Tên Bài tập</label>
                  <input className={cx('input')} name="name" defaultValue={editingProblem.name || ''} placeholder="vd: Tính tổng 2 số" required style={{width: '100%'}}/>
                </div>
                <div>
                  <label style={inputLabelStyle}>Độ khó</label>
                  <select className={cx('input')} name="diff" defaultValue={editingProblem.diff || 'easy'} style={{width: '100%'}}>
                    <option value="easy">Dễ (easy)</option>
                    <option value="medium">Trung bình (medium)</option>
                    <option value="hard">Khó (hard)</option>
                  </select>
                </div>
                <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
                  <button type="submit" className={cx('button', 'button--primary')} style={{flex: 1}}>Lưu Bài Tập</button>
                  <button type="button" className={cx('button', 'button--ghost')} onClick={() => setEditingProblem(null)} style={{flex: 1}}>Hủy Bỏ</button>
                </div>
              </form>
            </div>
          )}

          <table className={cx('problem-table')}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên bài</th>
                <th>Độ khó</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {catalogProblems.map(problem => (
                <tr key={problem.id}>
                  <td>{problem.id}</td>
                  <td>{problem.name}</td>
                  <td>
                    <span className={cx('badge', problem.diff === 'easy' ? 'badge--done' : problem.diff === 'medium' ? 'badge--live' : 'badge--new')}>
                      {problem.diff}
                    </span>
                  </td>
                  <td>
                    <button type="button" className={cx('button', 'button--ghost')} style={{color: 'var(--blue)'}} onClick={() => setEditingProblem(problem)}>Sửa</button>
                    <button type="button" className={cx('button', 'button--ghost')} style={{color: 'var(--rose)'}} onClick={() => handleDeleteProblem(problem.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'users' && (
        <section className={cx('card')}>
          <div className={cx('card__header')}>
            <div className={cx('card__title')}>Quản lý Người dùng</div>
            <button type="button" className={cx('button', 'button--ghost')} onClick={loadUsers}>Làm mới</button>
          </div>
          {loadingUsers ? <div className={cx('placeholder-box')}>Đang tải...</div> : (
            <table className={cx('problem-table')}>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Quyền</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(users).map(([uid, data]) => {
                  const role = data?.profile?.role || 'user';
                  return (
                    <tr key={uid}>
                      <td>{data?.profile?.displayName || 'N/A'}</td>
                      <td>{data?.profile?.email || 'N/A'}</td>
                      <td>
                        <span className={cx('badge', role === 'superadmin' ? 'badge--live' : role === 'admin' ? 'badge--done' : 'badge--new')}>
                          {role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {role === 'user' ? (
                          <button type="button" className={cx('button', 'button--primary')} onClick={() => handlePromote(uid)}>Cấp Admin</button>
                        ) : role === 'admin' ? (
                          <button type="button" className={cx('button', 'button--danger')} onClick={() => handleDemote(uid, role)}>Tước Admin</button>
                        ) : (
                          <span style={{color: 'var(--text-3)', fontSize: '13px'}}>Không thể thao tác</span>
                        )}
                        <button type="button" className={cx('button', 'button--ghost')} style={{color: 'var(--rose)', marginLeft: '8px'}} onClick={() => handleDeleteUser(uid, role)}>Xóa Data</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}
