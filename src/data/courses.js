function audioSeries(total, label, duration = '40 phút', folder = '', hasVideo = false) {
  return Array.from({ length: total }, (_, index) => ({
    name: `Bài ${index + 1}: ${label}`,
    dur: duration,
    type: hasVideo ? 'video' : 'audio',
    src: folder ? `${folder}/BAI${index + 1}.mp3` : `BAI${index + 1}.mp3`,
    videoSrc: hasVideo ? (folder ? `${folder}/BAI${index + 1}.mp4` : `BAI${index + 1}.mp4`) : null,
  }));
}

function youtubeLesson(name, duration = '15 phút', youtubeUrl = '') {
  return {
    name,
    dur: duration,
    type: 'youtube',
    youtubeUrl,
  };
}

export const COURSE_META = {
  Frontend: { emoji: '⚛️', color: 'var(--indigo-light)', fill: 'var(--indigo)' },
  Backend: { emoji: '🔧', color: 'var(--sky-light)', fill: 'var(--sky)' },
  'Khoa học dữ liệu': { emoji: '🐍', color: 'var(--teal-light)', fill: 'var(--teal)' },
  'Thiết kế': { emoji: '🎨', color: 'var(--amber-light)', fill: 'var(--amber)' },
  DevOps: { emoji: '☁️', color: 'var(--rose-light)', fill: 'var(--rose)' },
  'Algorithm & CP': { emoji: '⚙️', color: 'var(--sky-light)', fill: 'var(--sky)' },
  'Khác': { emoji: '📘', color: 'var(--surface-2)', fill: 'var(--text-3)' },
};

export const COURSES = [
  {
    id: 'c1',
    name: 'React nâng cao và tối ưu hiệu năng',
    teacher: 'Nguyễn Văn A',
    category: 'Frontend',
    emoji: '⚛️',
    color: 'var(--indigo-light)',
    fill: 'var(--indigo)',
    totalLessons: 42,
    tag: 'live',
    tagText: '🔴 Đang mở',
    lessons: [
      youtubeLesson(
        'Giới thiệu khóa học',
        '12 phút',
        'https://www.youtube.com/watch?v=8i_egU5NWEA'
      ),
      youtubeLesson(
        'React 18 Concurrent',
        '28 phút',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      ),
      youtubeLesson(
        'useTransition và useDeferredValue',
        '35 phút',
        'https://www.youtube.com/watch?v=O6P86IyJRdg'
      ),
      ...audioSeries(39, 'React nâng cao', '40 phút', 'react/advanced', true),
    ],
  },

  {
    id: 'c2',
    name: 'Python cho Data Science và Machine Learning',
    teacher: 'Trần Thị B',
    category: 'Khoa học dữ liệu',
    emoji: '🐍',
    color: 'var(--teal-light)',
    fill: 'var(--teal)',
    totalLessons: 60,
    tag: 'new',
    tagText: '✨ Mới',
    lessons: [
      {
        name: 'Cài đặt Python và Jupyter',
        dur: '15 phút',
        type: 'audio',
        src: 'python/setup.mp3',
      },
      {
        name: 'NumPy cơ bản',
        dur: '45 phút',
        type: 'audio',
        src: 'python/numpy.mp3',
      },
      {
        name: 'Pandas DataFrame',
        dur: '50 phút',
        type: 'audio',
        src: 'python/pandas.mp3',
      },
      ...audioSeries(57, 'Khoa học dữ liệu', '40 phút', 'python/series'),
    ],
  },

  {
    id: 'c3',
    name: 'Chuyên đề UI/UX chuyên sâu 2025',
    teacher: 'Lê Văn C',
    category: 'Thiết kế',
    emoji: '🎨',
    color: 'var(--amber-light)',
    fill: 'var(--amber)',
    totalLessons: 38,
    tag: 'done',
    tagText: '✅ Gần xong',
    lessons: audioSeries(38, 'Thiết kế giao diện', '40 phút', 'uiux'),
  },

  {
    id: 'c4',
    name: 'Thuật Toán Cho Lập Trình Thi Đấu (CP) Trong C++',
    teacher: 'Đa nguồn',
    category: 'Algorithm & CP',
    emoji: '⚙️',
    color: 'var(--sky-light)',
    fill: 'var(--sky)',
    totalLessons: 55,
    tag: 'sky',
    tagText: '🆕 Mới bắt đầu',
    lessons: [ 
      youtubeLesson(
        'Giới thiệu thuật toán và lập trình thi đấu',
        '6 phút',
        'https://www.youtube.com/watch?v=AgwnOQbJVvU',
      ),
      youtubeLesson(
        'Làm Quen Với Ngôn Ngữ Lập Trình C++',
        '45 phút',
        'https://www.youtube.com/watch?v=74B6PXO97Tw&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=2',
      ),
      youtubeLesson(
        'Các Toán Tử Cơ Bản Trong Ngôn Ngữ Lập Trình C++',
        '39 phút',
        'https://www.youtube.com/watch?v=y-_fNgvSfjc&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=3',
      ),
      youtubeLesson(
        'Cấu Trúc Rẽ Nhánh Trong Ngôn Ngữ Lập Trình C++ | IF ELSE và SWITCH CASE Trong C++',
        '33 phút',
        'https://www.youtube.com/watch?v=QH-nyFW3c0s&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=4',
      ),
      youtubeLesson(
        'Vòng Lặp Trong C++ | Vòng Lặp For, While Và Do-While',
        '51 phút',
        'https://www.youtube.com/watch?v=O0Q5K0m6mvY&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=6',
      ),
      youtubeLesson(
        'Phân Tích Độ Phức Tạp Của Thuật Toán',
        '23 phút',
        'https://www.youtube.com/watch?v=0W060mNbi40&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=10',
      ),
      youtubeLesson(
        'Mảng Một Chiều Trong Ngôn Ngữ Lập Trình C++ Và Các Bài Toán Thường Gặp',
        '22 phút',
        'https://www.youtube.com/watch?v=M3v7Ie9hu0s&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=11',
      ),
      youtubeLesson(
        'Lý Thuyết Về Mảng 2 Chiều Và Các Bài Toán Quan Trọng Trong C++',
        '24 phút',
        'https://www.youtube.com/watch?v=1NTr9eA9mFI&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=14',
      ),
      youtubeLesson(
        'Mảng Cộng Dồn Trên Mảng 1 Chiều Và 2 Chiều | Truy Vấn Tổng Trên Đoạn',
        '36 phút',
        'https://www.youtube.com/watch?v=KxQkpu842rc&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=15',
      ),
      youtubeLesson(
        'Hướng Dẫn Sử Dụng Vector Trong C++',
        '21 phút',
        'https://www.youtube.com/watch?v=053Tcz4omzk&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=20',
      ),
      youtubeLesson(
          'Hướng Dẫn Sử Dụng Pair Trong C++',
          '9 phút',
          'https://www.youtube.com/watch?v=7mJsTe7RtgQ&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=21',
      ),
      youtubeLesson(
        'Thuật Toán Tìm Kiếm Nhị Phân | Hàm Lower_bound và Upper_bound Trong Thư Viện STL',
        '52 phút',
        'https://www.youtube.com/watch?v=dB2DWSKGLj8&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=25',
      ),
      youtubeLesson(
        'Các Hàm Thuật Toán Thông Dụng Trong Thư Viện Algorithm C++',
        '35 phút',
        'https://www.youtube.com/watch?v=v7KL3b2-Zlo&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=31',
      ),
      youtubeLesson(
        'Kiến Thức Toán Và Lý Thuyết Số Quan Trọng Trong Lập Trình Phần I',
        '68 phút',
        'https://www.youtube.com/watch?v=rd7lhHLuRfI&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=34',
      ),
      youtubeLesson(
        'Kiến Thức Toán Và Lý Thuyết Số Quan Trọng Trong Lập Trình Phần II',
        '47 phút',
        'https://www.youtube.com/watch?v=0s545mDND18&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=35',
      ),
      youtubeLesson(
        'Giải Thích Cách Hàm Đệ Quy Hoạt Động | Kỹ Thuật Đệ Quy Trong C++',
        '38 phút',
        'https://www.youtube.com/watch?v=eQ3VpTtc9lE&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=37',
      ),
      youtubeLesson(
        'Kiến Thức Toán Và Lý Thuyết Số Quan Trọng Trong Lập Trình Phần III',
        '74 phút',
        'https://www.youtube.com/watch?v=8mzj-YjS49Q&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=36',
      ),
      youtubeLesson(
        'Kỹ thuật Hai Con Trỏ | Two Pointers Trong C++',
        '82 phút',
        'https://www.youtube.com/watch?v=PPyw2vp6SIU&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=48',
      ),
      youtubeLesson(
        'Kỹ Thuật Cửa Sổ Trượt | Sliding Window Trong C++',
        '43 phút',
        'https://www.youtube.com/watch?v=XUx3iJVPdxA&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=47',
      ),
      youtubeLesson(
        'Thuật Toán Quay Lui Và Bài Tập Áp Dụng',
        '110 phút',
        'https://www.youtube.com/watch?v=hzIhgbz9Em8&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=76',
      ),
      youtubeLesson(
        'Thuật Toán Quy Hoạch Động Phần I',
        '74 phút',
        'https://www.youtube.com/watch?v=OChChuFjQw4&t=171s',
      ),
      youtubeLesson(
        'Thuật Toán Quy Hoạch Động Phần II',
        '21 phút',
        'https://www.youtube.com/watch?v=MR_JkaHNcUg&t=1s',
      ), 
      youtubeLesson(
        'Set & Map Trong C++ ',
        '111 phút',
        'https://www.youtube.com/watch?v=_2EerrBF8AY&list=PLux-_phi0Rz0Hq9fDP4TlOulBl8APKp79&index=77',
      ),
      youtubeLesson(
          'Mảng hiệu Trong C++ (Lưu ý: Bật Vietsub để hiểu rõ hơn)',
          '11 phút',
          'https://www.youtube.com/watch?v=96RG7EBF8LI',
      ),
      youtubeLesson(
        'Bitmasking (Lưu ý: Bật Vietsub để hiểu rõ hơn)',
        '14 phút',
        'https://www.youtube.com/watch?v=oL5bmRUbAJ4',
      ),
      youtubeLesson(
        '[Lý thuyết đồ thị | Toán rời rạc]. Các Khái Niệm Cơ Bản Của Đồ Thị',
        '32 phút',
        'https://www.youtube.com/watch?v=-DocD-YLlPY&list=PLux-_phi0Rz3Kx5SPqIRyGR1gDVb5DY1x&index=1',
      ),
      youtubeLesson(
        'Thuật Toán Tìm Kiếm Theo Chiều Rộng | Giải Thuật BFS',
        '27 phút',
        'https://www.youtube.com/watch?v=bhB-GIP3tZM&list=PLux-_phi0Rz3Kx5SPqIRyGR1gDVb5DY1x&index=4',
      ),
      youtubeLesson(
        'Thuật Toán Tìm Kiếm Theo Chiều Sâu Trên Đồ Thị | Thuật Toán DFS',
        '35 phút',
        'https://www.youtube.com/watch?v=JAlNXyfe-p4&list=PLux-_phi0Rz3Kx5SPqIRyGR1gDVb5DY1x&index=3',
      ),
      youtubeLesson(
        'Đồ Thị Vô Hướng Liên Thông | Đếm Số Thành Phần Liên Thông Của Đồ Thị Vô Hướng',
        '14 phút',
        'https://www.youtube.com/watch?v=TqbdznpR1-I&list=PLux-_phi0Rz3Kx5SPqIRyGR1gDVb5DY1x&index=5',
      ),
      youtubeLesson(
        'Tìm Đường Đi Trên Đồ Thị Không Có Trọng Số',
        '31 phút',
        'https://www.youtube.com/watch?v=tWsESaE1SXs&list=PLux-_phi0Rz3Kx5SPqIRyGR1gDVb5DY1x&index=6',
      ),
      youtubeLesson(
        'Áp Dụng Thuật Toán DFS, BFS Trên Lưới Ô Vuông',
        '23 phút',
        'https://www.youtube.com/watch?v=CWZtxkPtCro&list=PLux-_phi0Rz3Kx5SPqIRyGR1gDVb5DY1x&index=7',
      ),
      youtubeLesson(
        'Thuật Toán Dijkstra | Thuật Toán Tìm Đường Đi Ngắn Nhất',
        '42 phút',
        'https://www.youtube.com/watch?v=JqOPBodZmLk&list=PLux-_phi0Rz3Kx5SPqIRyGR1gDVb5DY1x&index=20',
      ),
      youtubeLesson(
         'Thuật Toán Sắp Xếp Topo Trên Đồ Thị Bằng BFS | Thuật Toán Kahn',
         '37 phút',
         'https://www.youtube.com/watch?v=VtkL02dKkaE&list=PLux-_phi0Rz3Kx5SPqIRyGR1gDVb5DY1x&index=9', 
      ),
      youtubeLesson(
        'Lập trình động trên cây: LCA sử dụng tìm kiếm nhị phân (Lưu ý: Bật Vietsub để hiểu rõ hơn)',
        '15 phút',
        'https://www.youtube.com/watch?v=qPxS_rY0OJw&t=109s',
      ),
      youtubeLesson(
        'Chu Trình Euler Và Đường Đi Euler',
        '33 phút',
        'https://www.youtube.com/watch?v=RauZYMePmRg',
      ),
      youtubeLesson(
        ''
      ),
    ],
  },

  {
    id: 'c5',
    name: 'Khóa TypeScript đầy đủ 2025',
    teacher: 'Ngô Minh E',
    category: 'Frontend',
    emoji: '🔷',
    color: '#dbeafe',
    fill: '#3b82f6',
    totalLessons: 35,
    tag: 'new',
    tagText: '✨ Mới thêm',
    lessons: audioSeries(35, 'TypeScript', '40 phút', 'typescript'),
  },

  {
    id: 'c6',
    name: 'Phát triển backend với Node.js và Express',
    teacher: 'Võ Thanh F',
    category: 'Backend',
    emoji: '🟢',
    color: 'var(--teal-light)',
    fill: 'var(--teal)',
    totalLessons: 48,
    tag: 'sky',
    tagText: '🆕 Mới',
    lessons: audioSeries(48, 'Node.js', '40 phút', 'nodejs'),
  },

  {
    id: 'c7',
    name: 'Làm chủ Docker và Kubernetes',
    teacher: 'Đinh Bảo G',
    category: 'DevOps',
    emoji: '🐳',
    color: 'var(--sky-light)',
    fill: 'var(--sky)',
    totalLessons: 40,
    tag: 'sky',
    tagText: '⚙️ DevOps',
    lessons: audioSeries(40, 'Container', '40 phút', 'devops'),
  },

  {
    id: 'c8',
    name: 'Hệ thống thiết kế nâng cao với Figma',
    teacher: 'Hoàng Yến H',
    category: 'Thiết kế',
    emoji: '🖌️',
    color: 'var(--rose-light)',
    fill: 'var(--rose)',
    totalLessons: 28,
    tag: 'done',
    tagText: '✅ Hoàn thành',
    lessons: audioSeries(28, 'Figma', '40 phút', 'figma'),
  },
];