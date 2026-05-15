import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./styles/App.module.scss";
import { bindModule } from "./utils/bem";
import {
  formatClock,
  formatDateVi,
  formatDurationFromMs,
  formatHoursMinutes,
  formatMinutesToClock,
  padNumber,
} from "./utils/format";
import {
  deleteCurrentUserAccount,
  loginUser,
  logoutUser,
  signupUser,
} from "./services/authService";
import { COURSES } from "./data/courses";
import { NOTE_TONES, PAGE_TITLES } from "./data/defaults";
import { PROBLEMS } from "./data/problems";
import { LEVEL_TABLE, getLevelInfo } from "./data/levels";
import { FONT_SIZE_OPTIONS, NAV_ITEMS, PRIORITY_MAP } from "./constants/app";
import { useAuth } from "./hooks/useAuth";
import { useAppPreferences } from "./hooks/useAppPreferences";
import { useLearnFlowData } from "./hooks/useLearnFlowData";
import AdminDashboard from "./features/admin/AdminDashboard";
import CourseDetailDrawer from "./features/courses/components/CourseDetailDrawer";
import CoursesPage from "./features/courses/components/CoursesPage";
import {
  getCourseProgress,
  getInitials,
  getScheduleStatus,
  groupNavItems,
  renderTestCaseHtml,
} from "./features/learnflow2/helpers";
import AppIcon from "./components/ui/AppIcon";
import {
  analyzeUserCapability,
} from "./services/aiAnalysisService";
import { useNewFeatures } from "./hooks/useNewFeatures";
import CommentSection from "./features/learnflow2/CommentSection";
import UserProfileCard from "./features/learnflow2/UserProfileCard";
import ActivityFeed from "./features/learnflow2/ActivityFeed";
import NotificationPreferences from "./features/learnflow2/NotificationPreferences";
import ProblemLeaderboard from "./features/contests/ProblemLeaderboard";

const cx = bindModule(styles);

const EXP_BY_DIFFICULTY = {
  easy: 100,
  medium: 300,
  hard: 500,
};

function getExperienceByDifficulty(diff) {
  return EXP_BY_DIFFICULTY[diff?.toLowerCase()] || 0;
}

function App() {
  const { authReady, currentUser: authUser } = useAuth();
  const { preferences, setPreference } = useAppPreferences();
  const {
    loading: dataLoading,
    error: dataError,
    profile,
    trackedCourses,
    tasks,
    schedule,
    notes,
    customCourses,
    courseProgress,
    problemStatuses,
    submissions,
    leaderboard,
    stats,
    experience,
    pomodoro,
    settings: remoteSettings,
    catalogCourses,
    catalogProblems,
    createTaskItem,
    toggleTaskItem,
    deleteTaskItem,
    saveNote,
    createScheduleItem,
    createCourseItem,
    trackCourseItem,
    untrackCourseItem,
    toggleLessonProgress,
    setProblemStatus,
    saveSubmission,
    setNotificationSettings,
    setPomodoroSettings,
    savePomodoroStats,
    syncDailyStreak,
    pushActivitySnapshot,
    exportCurrentUserData,
    resetCurrentUserData,
    buildCustomCourse,
  } = useLearnFlowData(authUser);

  useNewFeatures(authUser?.uid);

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState({ open: false, icon: "✓", message: "" });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [authError, setAuthError] = useState({ login: "", signup: "" });
  const [authPending, setAuthPending] = useState(false);
  const [accountDeletePending, setAccountDeletePending] = useState(false);
  const [authForm, setAuthForm] = useState({
    loginEmail: "",
    loginPw: "",
    signupName: "",
    signupEmail: "",
    signupPw: "",
  });
  const [noteToneIndex, setNoteToneIndex] = useState(0);
  const [courseFilter, setCourseFilter] = useState("all");
  const [courseDetailId, setCourseDetailId] = useState(null);
  const [topSearch, setTopSearch] = useState("");
  const [problemFilter, setProblemFilter] = useState("all");
  const [problemSearch, setProblemSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [problemPage, setProblemPage] = useState(0);
  const [expandedProblemTags, setExpandedProblemTags] = useState({});
  const [editorProblemId, setEditorProblemId] = useState(null);
  const [editorLang, setEditorLang] = useState("python");
  const [editorCode, setEditorCode] = useState("");
  const [outputTab, setOutputTab] = useState("testcase");
  const [problemDescriptionTab, setProblemDescriptionTab] = useState("description");
  const [outputHtml, setOutputHtml] = useState("");
  const [timerMode, setTimerMode] = useState("focus");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(25 * 60);
  const [challenge, setChallenge] = useState({
    open: false,
    finished: false,
    selectedMin: 5,
    customMin: "",
    endTime: null,
    totalSec: 0,
  });
  const [sessionStart] = useState(() => Date.now());
  const [aiResult, setAiResult] = useState(null);
  const [aiHint, setAiHint] = useState(null);
  const [forms, setForms] = useState({
    course: { name: "", teacher: "", total: "", category: "Frontend" },
    task: {
      name: "",
      course: COURSES[0].name,
      date: "",
      priority: "normal",
      note: "",
    },
    schedule: { name: "", time: "", dur: "", color: "var(--indigo)" },
  });

  const toastTimeoutRef = useRef(null);
  const currentUser = useMemo(
    () =>
      authUser
        ? {
            uid: authUser.uid,
            name:
              profile?.displayName ||
              authUser.displayName ||
              authUser.email?.split("@")[0] ||
              "Người dùng",
            email: authUser.email || profile?.email || "",
          }
        : null,
    [authUser, profile],
  );
  const score = stats.score || 0;
  const streak = stats.streak || 0;
  const daysActive = stats.daysActive || 0;
  const lessonsWeek = stats.lessonsWeek || 0;
  const activity = stats.activity || [0, 0, 0, 0, 0, 0, 0];
  const timerSettings = pomodoro.settings;
  const pomoCount = pomodoro.stats?.count || 0;
  const pomoTotalSec = pomodoro.stats?.totalSec || 0;
  const settings = {
    darkMode: preferences.darkMode,
    fontSize: preferences.fontSize,
    notif: remoteSettings.notifications,
  };
  const allCourses = useMemo(
    () => [...catalogCourses, ...customCourses],
    [catalogCourses, customCourses],
  );
  const trackedCourseIds = useMemo(
    () => new Set(trackedCourses.map((item) => item.courseId)),
    [trackedCourses],
  );
  const trackedCourseDetails = useMemo(
    () => allCourses.filter((course) => trackedCourseIds.has(course.id)),
    [allCourses, trackedCourseIds],
  );
  const courseNameOptions = useMemo(
    () => [
      ...new Set(
        (trackedCourseDetails.length ? trackedCourseDetails : allCourses).map(
          (course) => course.name,
        ),
      ),
    ],
    [allCourses, trackedCourseDetails],
  );
  const levelInfo = useMemo(() => getLevelInfo(score), [score]);
  const solvedProblems = useMemo(
    () =>
      PROBLEMS.filter((item) => (problemStatuses[item.id] || "none") === "done")
        .length,
    [problemStatuses],
  );
  const acRateMap = useMemo(() => {
    const map = {};
    submissions.forEach((sub) => {
      const id = sub.probId;
      if (!map[id]) map[id] = { total: 0, accepted: 0 };
      map[id].total += 1;
      if (sub.pass) map[id].accepted += 1;
    });
    return map;
  }, [submissions]);

  function getAcRate(problem) {
    const entry = acRateMap[problem.id];
    if (!entry || entry.total === 0) return problem.ac;
    return `${Math.round((entry.accepted / entry.total) * 100)}%`;
  }

  const completedLessonsCount = useMemo(
    () =>
      Object.values(courseProgress).reduce(
        (sum, progressMap) =>
          sum + Object.values(progressMap || {}).filter(Boolean).length,
        0,
      ),
    [courseProgress],
  );
  const sessionMs = useMemo(
    () => Date.now() - sessionStart,
    [clock, sessionStart],
  );
  const displayTodayMs = (stats.todayMs || 0) + (sessionMs % 60000);
  const displayWeekMs = (stats.thisWeekMs || 0) + (sessionMs % 60000);
  const displayMonthMs = (stats.thisMonthMs || 0) + (sessionMs % 60000);
  const filteredDashboardCourses = useMemo(
    () =>
      trackedCourseDetails
        .slice(0, 4)
        .filter((course) =>
          course.name.toLowerCase().includes(topSearch.toLowerCase()),
        ),
    [topSearch, trackedCourseDetails],
  );
  const filteredCourses = useMemo(() => {
    let list = [...allCourses];

    if (courseFilter === "active") {
      list = list.filter((course) => trackedCourseIds.has(course.id));
    }

    if (courseFilter === "done") {
      list = list.filter(
        (course) =>
          trackedCourseIds.has(course.id) &&
          getCourseProgress(course, courseProgress).pct === 100,
      );
    }

    if (courseFilter === "frontend")
      list = list.filter((course) => course.category === "Frontend");
    if (courseFilter === "backend")
      list = list.filter((course) => course.category === "Backend");
    if (courseFilter === "data")
      list = list.filter((course) => course.category === "Khoa học dữ liệu");

    return list;
  }, [allCourses, courseFilter, courseProgress, trackedCourseIds]);
  const filteredProblems = useMemo(
    () =>
      PROBLEMS.filter((problem) => {
        const status = problemStatuses[problem.id] || "none";

        if (problemFilter === "easy" && problem.diff !== "easy") return false;
        if (problemFilter === "medium" && problem.diff !== "medium")
          return false;
        if (problemFilter === "hard" && problem.diff !== "hard") return false;
        if (problemFilter === "done" && status !== "done") return false;
        if (problemFilter === "todo" && status === "done") return false;

        // Tag filter - if tags are selected, problem must have at least one matching tag
        if (selectedTags.length > 0) {
          const hasMatchingTag = selectedTags.some((selectedTag) =>
            problem.tags.some(
              (tag) => tag.toLowerCase() === selectedTag.toLowerCase()
            )
          );
          if (!hasMatchingTag) return false;
        }

        if (!problemSearch.trim()) return true;

        const query = problemSearch.toLowerCase();
        return (
          problem.name.toLowerCase().includes(query) ||
          problem.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }),
    [problemFilter, problemSearch, problemStatuses, selectedTags],
  );
  const allAvailableTags = useMemo(
    () => {
      const tags = new Set();
      PROBLEMS.forEach((problem) => {
        problem.tags.forEach((tag) => tags.add(tag));
      });
      return Array.from(tags).sort();
    },
    []
  );
  const editorProblem = useMemo(
    () => PROBLEMS.find((item) => item.id === editorProblemId) || null,
    [editorProblemId],
  );
  const courseDetail = useMemo(
    () => allCourses.find((item) => item.id === courseDetailId) || null,
    [allCourses, courseDetailId],
  );
  const isCurrentCourseTracked = courseDetail
    ? trackedCourseIds.has(courseDetail.id)
    : false;
  const canRunAiAnalysis =
    Boolean(currentUser) &&
    (trackedCourses.length > 0 ||
      completedLessonsCount > 0 ||
      solvedProblems > 0 ||
      pomoCount > 0);
  const myRank = useMemo(() => {
    if (!currentUser) return null;
    const index = leaderboard.findIndex((item) => item.uid === currentUser.uid);
    return index >= 0 ? index + 1 : leaderboard.length + 1;
  }, [currentUser, leaderboard]);

  useEffect(() => {
    const timerId = window.setInterval(
      () => setClock(formatClock(new Date())),
      1000,
    );
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    setTimerRemaining(timerSettings[timerMode] * 60);
  }, [timerMode, timerSettings]);

  useEffect(() => {
    if (!timerRunning) return undefined;

    const intervalId = window.setInterval(() => {
      setTimerRemaining((previous) => {
        if (previous <= 1) {
          window.clearInterval(intervalId);
          setTimerRunning(false);

          if (timerMode === "focus" && currentUser) {
            void savePomodoroStats({
              count: pomoCount + 1,
              totalSec: pomoTotalSec + timerSettings.focus * 60,
            });
          }

          showToast("Bạn đã hoàn thành một phiên Pomodoro.", "⏱️");
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [
    currentUser,
    pomoCount,
    pomoTotalSec,
    savePomodoroStats,
    timerMode,
    timerRunning,
    timerSettings.focus,
  ]);

  useEffect(() => {
    if (!currentUser) return undefined;

    const intervalId = window.setInterval(() => {
      void pushActivitySnapshot();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [currentUser, pushActivitySnapshot]);

  useEffect(() => {
    if (!currentUser) return;
    void syncDailyStreak();
  }, [currentUser, syncDailyStreak]);

  useEffect(() => {
    if (editorProblem) {
      setOutputTab("testcase");
      setOutputHtml(renderTestCaseHtml(editorProblem));
    }
  }, [editorProblem]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentPage]);

  useEffect(() => {
    if (!challenge.endTime) return undefined;

    const intervalId = window.setInterval(() => {
      if (Date.now() >= challenge.endTime) {
        setChallenge((previous) => ({
          ...previous,
          endTime: null,
          finished: true,
        }));
        showToast("Đã hết thời gian thử thách.", "⚡");
      } else {
        setChallenge((previous) => ({ ...previous }));
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [challenge.endTime]);

  useEffect(
    () => () => {
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    },
    [],
  );

  function showToast(message, icon = "✓") {
    setToast({ open: true, icon, message });

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast((previous) => ({ ...previous, open: false }));
    }, 3000);
  }

  function ensureAuthenticated(message = "Vui lòng đăng nhập để tiếp tục.") {
    if (currentUser) return true;
    setAuthView("login");
    setModal("auth");
    showToast(message, "🔐");
    return false;
  }

  function toggleTag(tag) {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  }

  function clearAllTags() {
    setSelectedTags([]);
  }

  function updateForm(group, key, value) {
    setForms((previous) => ({
      ...previous,
      [group]: { ...previous[group], [key]: value },
    }));
  }

  function openAuthModal(view) {
    setAuthView(view);
    setAuthError({ login: "", signup: "" });
    setModal("auth");
  }

  function updateSettingsValue(key, value) {
    setPreference(key, value);
  }

  async function updateNotificationSetting(key, value) {
    if (!ensureAuthenticated()) return;

    try {
      await setNotificationSettings({
        ...settings.notif,
        [key]: value,
      });
    } catch (error) {
      showToast(error.message || "Không thể cập nhật thông báo.", "⚠️");
    }
  }

  async function updatePomodoroSetting(key, value) {
    if (!ensureAuthenticated()) return;

    try {
      await setPomodoroSettings({
        ...timerSettings,
        [key]: value,
      });
    } catch (error) {
      showToast(error.message || "Không thể cập nhật Pomodoro.", "⚠️");
    }
  }

  async function handleLogin() {
    if (authPending) return;

    try {
      setAuthPending(true);
      const user = await loginUser({
        email: authForm.loginEmail.trim().toLowerCase(),
        password: authForm.loginPw,
      });

      setAuthError((previous) => ({ ...previous, login: "" }));
      setModal(null);
      setCurrentPage("dashboard");
      showToast(`Chào mừng quay lại, ${user.displayName || user.email}.`, "👋");
    } catch (error) {
      setAuthError((previous) => ({
        ...previous,
        login: error.message || "Đăng nhập thất bại.",
      }));
    } finally {
      setAuthPending(false);
    }
  }

  async function handleSignup() {
    if (authPending) return;

    if (
      !authForm.signupName.trim() ||
      !authForm.signupEmail.trim() ||
      authForm.signupPw.length < 6
    ) {
      setAuthError((previous) => ({
        ...previous,
        signup: !authForm.signupName.trim()
          ? "Vui lòng nhập họ và tên."
          : !authForm.signupEmail.trim()
            ? "Vui lòng nhập email."
            : "Mật khẩu tối thiểu 6 ký tự.",
      }));
      return;
    }

    try {
      setAuthPending(true);
      await signupUser({
        username: authForm.signupName.trim(),
        email: authForm.signupEmail.trim().toLowerCase(),
        password: authForm.signupPw,
      });

      setAuthView("login");
      setAuthError((previous) => ({ ...previous, signup: "" }));
      setModal(null);
      setCurrentPage("dashboard");
      showToast("Đăng ký thành công. Bạn có thể bắt đầu học ngay.", "🎉");
    } catch (error) {
      setAuthError((previous) => ({
        ...previous,
        signup: error.message || "Đăng ký thất bại.",
      }));
    } finally {
      setAuthPending(false);
    }
  }

  async function handleLogout() {
    if (!window.confirm("Bạn có muốn đăng xuất không?")) return;

    try {
      await logoutUser();
      setTimerRunning(false);
      showToast("Đã đăng xuất.", "👋");
    } catch (error) {
      showToast(error.message || "Đăng xuất thất bại.", "⚠️");
    }
  }

  async function handleDeleteAccount() {
    if (!currentUser || accountDeletePending) return;

    const confirmed = window.confirm(
      "Xóa tài khoản sẽ gỡ toàn bộ dữ liệu học tập của bạn trên Firebase và không thể hoàn tác. Tiếp tục?",
    );

    if (!confirmed) return;

    try {
      setAccountDeletePending(true);
      await deleteCurrentUserAccount();

      setTimerRunning(false);
      setAuthView("login");
      setModal(null);
      setCurrentPage("dashboard");
    } catch (error) {
      showToast(error.message || "Không thể xóa tài khoản.", "⚠️");
    } finally {
      setAccountDeletePending(false);
    }
  }

  async function addTask() {
    if (!ensureAuthenticated()) return;

    if (!forms.task.name.trim()) {
      showToast("Vui lòng nhập tên bài tập.", "⚠️");
      return;
    }

    try {
      await createTaskItem({
        id: `t${Date.now()}`,
        name: forms.task.name.trim(),
        course: forms.task.course,
        date: forms.task.date,
        priority: forms.task.priority,
        note: forms.task.note,
        done: false,
      });

      setForms((previous) => ({
        ...previous,
        task: {
          ...previous.task,
          name: "",
          date: "",
          priority: "normal",
          note: "",
        },
      }));
      setModal(null);
      showToast(`Đã thêm bài tập: ${forms.task.name.trim()}.`, "📝");
    } catch (error) {
      showToast(error.message || "Không thể thêm bài tập.", "⚠️");
    }
  }

  async function addSchedule() {
    if (!ensureAuthenticated()) return;

    if (!forms.schedule.name.trim() || !forms.schedule.time) {
      showToast("Vui lòng điền đủ thông tin lịch học.", "⚠️");
      return;
    }

    try {
      await createScheduleItem({
        id: `s${Date.now()}`,
        name: forms.schedule.name.trim(),
        time: forms.schedule.time,
        dur: Number(forms.schedule.dur || 45),
        color: forms.schedule.color,
        module: "Mới thêm",
      });

      setForms((previous) => ({
        ...previous,
        schedule: { name: "", time: "", dur: "", color: "var(--indigo)" },
      }));
      setModal(null);
      showToast("Đã thêm lịch học.", "📅");
    } catch (error) {
      showToast(error.message || "Không thể thêm lịch học.", "⚠️");
    }
  }

  async function addCourse() {
    if (!ensureAuthenticated()) return;

    if (!forms.course.name.trim()) {
      showToast("Vui lòng nhập tên khóa học.", "⚠️");
      return;
    }

    try {
      const course = buildCustomCourse(forms.course);
      await createCourseItem(course);
      setForms((previous) => ({
        ...previous,
        course: { name: "", teacher: "", total: "", category: "Frontend" },
      }));
      setModal(null);
      showToast(`Đã thêm và theo dõi khóa học: ${course.name}.`, "📚");
    } catch (error) {
      showToast(error.message || "Không thể thêm khóa học.", "⚠️");
    }
  }

  async function handleTrackCourse(course) {
    if (!ensureAuthenticated()) return;

    try {
      await trackCourseItem(course, {
        source: customCourses.some((item) => item.id === course.id)
          ? "custom"
          : "catalog",
      });
      showToast(`Đã theo dõi khóa học: ${course.name}.`, "📚");
    } catch (error) {
      showToast(error.message || "Không thể theo dõi khóa học.", "⚠️");
    }
  }

  async function handleUntrackCourse(course) {
    if (!ensureAuthenticated()) return;

    try {
      await untrackCourseItem(course.id);
      showToast(`Đã bỏ theo dõi: ${course.name}.`, "📚");
    } catch (error) {
      showToast(error.message || "Không thể bỏ theo dõi khóa học.", "⚠️");
    }
  }

  async function addNote() {
    if (!ensureAuthenticated()) return;

    const title = window.prompt("Nhập tiêu đề ghi chú:", "Ghi chú mới");
    if (!title) return;

    const body = window.prompt("Nhập nội dung ghi chú:", "Nội dung...");
    if (body === null) return;

    const tone = NOTE_TONES[noteToneIndex % NOTE_TONES.length];

    try {
      await saveNote({
        id: `n${Date.now()}`,
        title,
        body,
        date: new Date().toLocaleDateString("vi-VN"),
        tone,
      });

      setNoteToneIndex((previous) => previous + 1);
      showToast("Đã thêm ghi chú.", "📓");
    } catch (error) {
      showToast(error.message || "Không thể thêm ghi chú.", "⚠️");
    }
  }

  async function editNote(noteId) {
    if (!ensureAuthenticated()) return;

    const note = notes.find((item) => item.id === noteId);
    if (!note) return;

    const title = window.prompt("Sửa tiêu đề:", note.title);
    if (!title) return;

    const body = window.prompt("Sửa nội dung:", note.body);
    if (body === null) return;

    try {
      await saveNote({
        ...note,
        title,
        body,
      });
      showToast("Đã cập nhật ghi chú.", "📝");
    } catch (error) {
      showToast(error.message || "Không thể cập nhật ghi chú.", "⚠️");
    }
  }

  async function toggleTask(taskId) {
    if (!ensureAuthenticated()) return;

    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    try {
      await toggleTaskItem(task);
    } catch (error) {
      showToast(error.message || "Không thể cập nhật bài tập.", "⚠️");
    }
  }

  async function deleteTask(taskId) {
    if (!ensureAuthenticated()) return;

    try {
      await deleteTaskItem(taskId);
      showToast("Đã xóa bài tập.", "🗑");
    } catch (error) {
      showToast(error.message || "Không thể xóa bài tập.", "⚠️");
    }
  }

  function openProblem(problemId) {
    const problem = catalogProblems.find((item) => item.id === problemId);
    if (!problem) return;
    setEditorProblemId(problemId);
    setEditorLang("python");
    setEditorCode(problem.starter.python);
    setCurrentPage("editor");
  }

  async function toggleProblemStatus(problemId) {
    if (!ensureAuthenticated()) return;

    const current = problemStatuses[problemId] || "none";
    const next =
      current === "none" ? "try" : current === "try" ? "done" : "none";

    try {
      await setProblemStatus(problemId, next);
    } catch (error) {
      showToast(error.message || "Không thể cập nhật trạng thái bài.", "⚠️");
    }
  }

  function changeEditorLang(nextLang) {
    if (!editorProblem) return;

    if (
      editorCode.trim() &&
      !window.confirm("Đổi ngôn ngữ sẽ đặt lại đoạn mã hiện tại. Tiếp tục?")
    ) {
      return;
    }

    setEditorLang(nextLang);
    setEditorCode(editorProblem.starter[nextLang]);
  }

  function handleRunCode() {
    if (!editorCode.trim() || !editorProblem) {
      showToast("Vui lòng nhập mã trước.", "⚠️");
      return;
    }

    setOutputTab("result");
    setOutputHtml("<div>⏳ Đang chạy mã...</div>");

    window.setTimeout(() => {
      const pass = Math.random() > 0.35;
      const html = editorProblem.testcases
        .map((testcase, index) => {
          const ok = index < editorProblem.testcases.length - 1 ? true : pass;
          return `<div><strong>${ok ? "✅" : "❌"} Bộ kiểm thử ${index + 1}</strong><div>Đầu vào: ${testcase.input.replace(/\n/g, " | ")}</div><div>Kết quả: ${ok ? testcase.expected : "Sai"}</div></div>`;
        })
        .join("<hr />");

      setOutputHtml(
        `<div><strong>${pass ? "✅ Chạy thành công." : "❌ Một số bộ kiểm thử chưa đạt."}</strong></div>${html}`,
      );
      showToast(
        pass ? "Chạy mã thành công." : "Có bộ kiểm thử chưa đạt.",
        pass ? "✅" : "❌",
      );
    }, 800);
  }

  async function handleSubmitCode() {
    if (!ensureAuthenticated()) return;

    if (!editorCode.trim() || !editorProblem) {
      showToast("Vui lòng nhập mã trước.", "⚠️");
      return;
    }

    setOutputTab("result");
    setOutputHtml("<div>⏳ Đang chấm bài...</div>");

    window.setTimeout(async () => {
      const accepted = Math.random() > 0.3;
      const runtime = Math.floor(Math.random() * 80 + 20);
      const memory = Math.floor(Math.random() * 10 + 14);
      const now = new Date();
      const submission = {
        id: `sub_${Date.now()}`,
        probId: editorProblem.id,
        pass: accepted,
        lang: editorLang,
        time: `${padNumber(now.getHours())}:${padNumber(now.getMinutes())}`,
        createdAt: Date.now(),
      };

      try {
        if (accepted) {
          await setProblemStatus(editorProblem.id, "done");
        }

        await saveSubmission(submission, accepted ? 100 : 0);

        setOutputHtml(
          accepted
            ? `<div><strong>✅ Nộp bài thành công</strong></div><div>Thời gian chạy: ${runtime} ms</div><div>Bộ nhớ: ${memory}.2 MB</div><div>Tất cả bộ kiểm thử đều đạt.</div>`
            : "<div><strong>❌ Kết quả chưa đúng</strong></div><div>Hãy kiểm tra lại logic rồi thử lại.</div>",
        );

        showToast(
          accepted
            ? "Nộp bài thành công. +100 XP"
            : "Kết quả chưa đúng, hãy thử lại.",
          accepted ? "🏆" : "❌",
        );
      } catch (error) {
        setOutputHtml(
          "<div><strong>❌ Không thể lưu kết quả lên hệ thống.</strong></div>",
        );
        showToast(error.message || "Không thể nộp bài.", "⚠️");
      }
    }, 1200);
  }

  function handleOutputTabChange(nextTab) {
    setOutputTab(nextTab);
    if (!editorProblem) return;

    if (nextTab === "testcase")
      setOutputHtml(renderTestCaseHtml(editorProblem));
    if (nextTab === "result")
      setOutputHtml('<div>▶ Nhấn "Chạy" để xem kết quả.</div>');

    if (nextTab === "submissions") {
      const mine = submissions
        .filter((item) => item.probId === editorProblem.id)
        .reverse();
      setOutputHtml(
        mine.length
          ? mine
              .map(
                (item) =>
                  `<div>${item.pass ? "✅ Đạt" : "❌ Chưa đạt"} - ${item.lang} - ${item.time}</div>`,
              )
              .join("")
          : "<div>Chưa có lần nộp.</div>",
      );
    }
  }

  function handleEditorKeyDown(event) {
    if (event.key !== "Tab") return;

    event.preventDefault();
    const { selectionStart, selectionEnd, value } = event.currentTarget;
    const nextValue = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
    setEditorCode(nextValue);

    window.requestAnimationFrame(() => {
      event.currentTarget.selectionStart = selectionStart + 2;
      event.currentTarget.selectionEnd = selectionStart + 2;
    });
  }

  async function markLesson(courseId, lessonIndex) {
    if (!ensureAuthenticated()) return;

    const course = allCourses.find((item) => item.id === courseId);
    if (!course) return;

    const current = courseProgress[courseId] || {};
    const nextValue = !current[lessonIndex];

    try {
      if (!trackedCourseIds.has(courseId)) {
        await trackCourseItem(course, {
          source: customCourses.some((item) => item.id === course.id)
            ? "custom"
            : "catalog",
        });
      }

      await toggleLessonProgress(courseId, lessonIndex, nextValue, {
        scoreDelta: nextValue ? 50 : -50,
        lessonsWeekDelta: nextValue ? 1 : -1,
      });

      const lesson = course.lessons[lessonIndex];
      showToast(
        `${nextValue ? "✅ Đã hoàn thành" : "↩️ Đã bỏ đánh dấu"}: ${lesson.name}`,
        "📚",
      );
    } catch (error) {
      showToast(error.message || "Không thể cập nhật tiến độ bài học.", "⚠️");
    }
  }

  function continueLesson() {
    if (!courseDetail) return;
    const progress = courseProgress[courseDetail.id] || {};
    const nextIndex = courseDetail.lessons.findIndex(
      (_, index) => !progress[index],
    );
    if (nextIndex >= 0) void markLesson(courseDetail.id, nextIndex);
  }

  function resetTimer() {
    setTimerRunning(false);
    setTimerRemaining(timerSettings[timerMode] * 60);
  }

  function skipTimer() {
    setTimerRunning(false);
    setTimerRemaining(0);
    showToast("Đã bỏ qua phiên hiện tại.", "⏭");
  }

  function openChallengeModal() {
    setChallenge((previous) => ({
      ...previous,
      open: true,
      selectedMin: 5,
      customMin: "",
      finished: false,
    }));
  }

  function startChallengeTimer() {
    const minutes =
      Number(challenge.customMin) > 0
        ? Number(challenge.customMin)
        : challenge.selectedMin;
    setChallenge({
      open: false,
      finished: false,
      selectedMin: challenge.selectedMin,
      customMin: "",
      endTime: Date.now() + minutes * 60 * 1000,
      totalSec: minutes * 60,
    });
    showToast(`Bắt đầu thử thách ${minutes} phút.`, "⚡");
  }

  function stopChallengeTimer() {
    setChallenge((previous) => ({ ...previous, endTime: null }));
    showToast("Đã dừng thử thách.", "⏹");
  }

  async function exportData() {
    if (!ensureAuthenticated()) return;

    try {
      const data = await exportCurrentUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "learnflow_data.json";
      link.click();
      URL.revokeObjectURL(link.href);
      showToast("Xuất dữ liệu thành công.", "📥");
    } catch (error) {
      showToast(error.message || "Không thể xuất dữ liệu.", "⚠️");
    }
  }

  async function resetAllData() {
    if (!ensureAuthenticated()) return;
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ tiến độ học tập không?"))
      return;
    if (!window.confirm("Xác nhận lần nữa: XÓA TOÀN BỘ dữ liệu?")) return;

    try {
      await resetCurrentUserData();
      setTimerRunning(false);
      setTimerMode("focus");
      setEditorProblemId(null);
      setCurrentPage("dashboard");
      showToast("Đã đặt lại dữ liệu học tập.", "🧹");
    } catch (error) {
      showToast(error.message || "Không thể đặt lại dữ liệu.", "⚠️");
    }
  }

  async function runAIAnalysis() {
    if (!currentUser) {
      openAuthModal("login");
      showToast("Vui lòng đăng nhập để dùng AI Phân tích.", "🔐");
      return;
    }

    if (!canRunAiAnalysis) {
      showToast("Cần có dữ liệu học tập thật trước khi phân tích.", "⚠️");
      return;
    }

    try {
      showToast("⏳ Đang phân tích năng lực...", "🔄");

      // Call the AI analysis service
      const result = await analyzeUserCapability(
        submissions,
        currentUser.uid,
        catalogProblems,
        problemStatuses
      );

      if (result.success) {
        setAiResult(result.data);
        showToast("✅ Đã hoàn tất phân tích năng lực bằng AI.", "🤖");
      } else {
        // Fallback: If API fails, use rule-based scoring
        console.warn("AI Analysis failed, using fallback:", result.error);
        showToast(
          "⚠️ Dùng phân tích tạm thời (server không khả dụng).",
          "⚠️"
        );
        runAIAnalysisFallback();
      }
    } catch (error) {
      console.error("AI Analysis error:", error);
      showToast(
        "⚠️ Lỗi phân tích. Chắc chắn Flask API đang chạy trên port 5000.",
        "❌"
      );
      // Use fallback
      runAIAnalysisFallback();
    }
  }

  function runAIAnalysisFallback() {
    // Fallback to rule-based scoring if API is unavailable
    const done = solvedProblems;
    const total = catalogProblems.length;
    const easy = catalogProblems.filter(
      (item) =>
        item.diff === "easy" && (problemStatuses[item.id] || "none") === "done",
    ).length;
    const medium = catalogProblems.filter(
      (item) =>
        item.diff === "medium" &&
        (problemStatuses[item.id] || "none") === "done",
    ).length;
    const hard = catalogProblems.filter(
      (item) =>
        item.diff === "hard" && (problemStatuses[item.id] || "none") === "done",
    ).length;
    const lessonSignal = Math.min(30, completedLessonsCount * 2);
    const focusSignal = Math.min(20, Math.floor(pomoTotalSec / 3600) * 5);
    const trackSignal = Math.min(10, trackedCourses.length * 2);
    const skillScore = Math.min(
      100,
      Math.round(
        (done / total) * 55 +
          medium * 1.5 +
          hard * 2 +
          lessonSignal +
          focusSignal +
          trackSignal,
      ),
    );
    const avgTime = Math.max(
      12,
      70 - medium - hard * 3 - Math.min(10, completedLessonsCount),
    );
    const acProbability = Math.min(
      98,
      Math.round(
        30 +
          done * 1.2 +
          hard * 0.8 +
          completedLessonsCount * 0.6 +
          trackedCourses.length,
      ),
    );
    const predictedLevel = Math.max(
      1,
      Math.min(15, Math.round(skillScore / 8)),
    );

    const topics = [
      {
        label: "Mảng và chuỗi",
        value: Math.min(100, easy * 8 + 25),
        color: "var(--indigo)",
      },
      {
        label: "Tìm kiếm nhị phân và DP",
        value: Math.min(100, medium * 6 + hard * 5 + 18),
        color: "var(--amber)",
      },
      {
        label: "Đồ thị và cây",
        value: Math.min(100, hard * 9 + 14),
        color: "var(--teal)",
      },
      {
        label: "Cấu trúc dữ liệu",
        value: Math.min(100, done * 2 + 20),
        color: "var(--sky)",
      },
    ];

    const suggestions = catalogProblems
      .filter((item) => (problemStatuses[item.id] || "none") !== "done")
      .slice(0, 3)
      .map((item, index) => ({
        id: item.id,
        name: item.name,
        reason:
          index === 0
            ? "Phù hợp với năng lực hiện tại"
            : index === 1
              ? "Cùng dạng với phần bạn còn yếu"
              : "Mở rộng độ phủ chủ đề",
      }));

    setAiResult({
      skillScore,
      avgTime,
      acProbability,
      predictedLevel,
      topics,
      suggestions,
      feedback: [
        {
          tone: "positive",
          title: "Điểm mạnh",
          body: `Bạn đang theo dõi ${trackedCourses.length} khóa học, hoàn thành ${completedLessonsCount} bài học và giải ${done} bài code.`,
        },
        {
          tone: "warn",
          title: "Cần cải thiện",
          body: "Hãy duy trì đều cả tiến độ khóa học lẫn bài luyện code để tăng độ ổn định.",
        },
        {
          tone: "info",
          title: "Lộ trình đề xuất",
          body: "Nên tiếp tục theo dõi khóa học đang học, hoàn thành thêm bài học và tăng số bài vừa/khó trong 7 ngày tới.",
        },
      ],
    });
  }

  function showAIHint(type) {
    const problem = editorProblem || catalogProblems[0];
    const contentMap = {
      complexity: {
        title: "Phân tích độ phức tạp",
        subtitle: `Bài ${problem.name}`,
        body: "Hướng giải tối ưu thường nằm trong khoảng O(n) đến O(n log n), tùy dạng bài. Nếu bạn đang brute force, hãy thử hash map, two pointers hoặc binary search trước.",
      },
      approach: {
        title: "Gợi ý thuật toán",
        subtitle: `Hướng tiếp cận phù hợp cho ${problem.name}`,
        body: "Hãy đọc lại đầu vào và đầu ra, xác định dữ liệu cần lưu tạm, rồi thử các mẫu quen thuộc như sliding window, hash map, DFS, BFS hoặc DP.",
      },
      similar: {
        title: "Bài tương tự đã làm",
        subtitle: "Mẫu từ lịch sử làm bài",
        body: "Bạn nên so sánh bài hiện tại với Two Sum, Valid Parentheses và Number of Islands để nhận ra cách mô hình hóa dữ liệu và kiểm soát trạng thái.",
      },
    };

    setAiHint(contentMap[type]);
    setModal("ai-hint");
  }

  const pageTitle =
    currentPage === "dashboard"
      ? currentUser
        ? `Chào, ${currentUser.name}`
        : PAGE_TITLES.dashboard
      : PAGE_TITLES[currentPage];
  const pendingTasks = tasks.filter((task) => !task.done).length;
  const nextTaskDeadline = tasks
    .filter((task) => !task.done && task.date)
    .sort((left, right) => new Date(left.date) - new Date(right.date))[0];
  const activeCourseCount = trackedCourseDetails.length;
  const completePercentage = trackedCourseDetails.length
    ? Math.round(
        trackedCourseDetails.reduce(
          (sum, course) => sum + getCourseProgress(course, courseProgress).pct,
          0,
        ) / trackedCourseDetails.length,
      )
    : 0;
  const challengeRemaining = challenge.endTime
    ? Math.max(0, Math.floor((challenge.endTime - Date.now()) / 1000))
    : 0;
  const challengeProgress = challenge.totalSec
    ? 1 - challengeRemaining / challenge.totalSec
    : 0;

  const renderSidebar = (isMobile = false) => (
    <>
      <div className={cx("brand")}>
        <div className={cx("brand__mark")}>LF</div>
        <div className={cx("brand__name")}>
          Learn<span>Flow</span>
        </div>
      </div>

      {currentUser ? (
        <div className={cx("user-card")}>
          <div className={cx("avatar")}>{getInitials(currentUser.name)}</div>
          <div className={cx("user-card__content")}>
            <p>{currentUser.name}</p>
            <span>{`Cấp ${levelInfo.level} • ${levelInfo.title}`}</span>
          </div>
          <button
            className={cx("pill-button")}
            type="button"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      ) : (
        <div className={cx("user-card")}>
          <div className={cx("avatar")}>LF</div>
          <div className={cx("user-card__content")}>
            <p>Chưa đăng nhập</p>
            <span>Đăng nhập để đồng bộ học tập realtime</span>
          </div>
        </div>
      )}

      <nav className={cx("sidebar-nav")}>
        {groupNavItems(NAV_ITEMS).map(([groupName, items]) => (
          <div className={cx("sidebar-nav__group")} key={groupName}>
            <div className={cx("sidebar-nav__label")}>{groupName}</div>
            {items.map((item) => (
              <button
                className={cx(
                  "sidebar-nav__item",
                  currentPage === item.id ? "sidebar-nav__item--active" : "",
                )}
                type="button"
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  if (isMobile) setMobileNavOpen(false);
                }}
              >
                <span className={cx("sidebar-nav__icon")}>
                  <AppIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
                {item.badgeType === "tasks" ? (
                  <span className={cx("sidebar-nav__badge")}>
                    {pendingTasks}
                  </span>
                ) : null}
                {item.badgeType === "problems" ? (
                  <span className={cx("sidebar-nav__badge")}>
                    {catalogProblems.length}
                  </span>
                ) : null}
                {item.badgeType === "courses" ? (
                  <span className={cx("sidebar-nav__badge")}>
                    {activeCourseCount}
                  </span>
                ) : null}
              </button>
            ))}
            {groupName === "Tổng quan" ? (
              <button
                className={cx("sidebar-nav__item")}
                type="button"
                onClick={() => {
                  if (!ensureAuthenticated()) return;
                  setModal("add-course");
                  if (isMobile) setMobileNavOpen(false);
                }}
              >
                <span className={cx("sidebar-nav__icon")}>
                  <AppIcon name="plus" size="sm" />
                </span>
                <span>Thêm khóa học</span>
              </button>
            ) : null}
          </div>
        ))}
      </nav>

      <div className={cx("sidebar-footer")}>
        <div className={cx("streak-card")}>
          <div className={cx("streak-card__icon")}>
            <AppIcon name="localFire" />
          </div>
          <div className={cx("streak-card__content")}>
            <p>Chuỗi ngày hiện tại</p>
            <div className={cx("streak-card__value")}>{streak}</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={cx("app-shell")}>
      <aside className={cx("app-shell__sidebar")}>{renderSidebar()}</aside>

      <main className={cx("app-shell__main")}>
        <header className={cx("topbar")}>
          <div>
            <h1 className={cx("topbar__title")}>{pageTitle}</h1>
            <p className={cx("topbar__sub")}>{clock}</p>
          </div>
          <div className={cx("topbar__actions")}>
            <button
              type="button"
              className={cx("icon-button", "mobile-nav-button")}
              onClick={() => setMobileNavOpen(true)}
              aria-label="Mở menu điều hướng"
            >
              <AppIcon name="menu" />
            </button>
            {currentPage !== "editor" ? (
              <label className={cx("search-box")}>
                <span className={cx("search-box__icon")}>
                  <AppIcon name="search" size="sm" />
                </span>
                <input
                  value={topSearch}
                  onChange={(event) => setTopSearch(event.target.value)}
                  placeholder="Tìm khóa học..."
                />
              </label>
            ) : null}
            <button
              type="button"
              className={cx("icon-button")}
              onClick={() =>
                ensureAuthenticated() ? setModal("add-task") : null
              }
              aria-label="Thêm bài tập"
            >
              <AppIcon name="plus" />
            </button>
            <button
              type="button"
              className={cx("icon-button")}
              onClick={() => setModal("notifications")}
              aria-label="Xem thông báo"
            >
              <AppIcon name="bell" />
              <span className={cx("icon-button__dot")} />
            </button>
            <button
              type="button"
              className={cx("button", "button--primary")}
              onClick={() =>
                ensureAuthenticated() ? setModal("add-course") : null
              }
            >
              <AppIcon name="plus" size="sm" />
              Thêm khóa học
            </button>
            {!currentUser ? (
              <div className={cx("auth-actions")}>
                <button
                  type="button"
                  className={cx("button", "button--primary")}
                  onClick={() => openAuthModal("login")}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className={cx("button", "button--secondary")}
                  onClick={() => openAuthModal("signup")}
                >
                  Đăng ký
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {!authReady || (currentUser && dataLoading) ? (
          <div className={cx("placeholder-box")}>Đang đồng bộ dữ liệu...</div>
        ) : null}
        {dataError ? (
          <div className={cx("placeholder-box")}>{dataError}</div>
        ) : null}

        <div className={cx("session-bar")}>
          <div className={cx("session-bar__live")}>
            <span className={cx("session-bar__dot")} />
            <span>Phiên học hôm nay</span>
            <strong>{formatDurationFromMs(sessionMs)}</strong>
          </div>
          <div className={cx("session-bar__divider")} />
          <div className={cx("session-bar__stats")}>
            <div>
              Hôm nay:{" "}
              <b>{formatHoursMinutes(Math.floor(displayTodayMs / 60000))}</b>
            </div>
            <div>
              Tuần này:{" "}
              <b>{formatHoursMinutes(Math.floor(displayWeekMs / 60000))}</b>
            </div>
            <div>
              Tháng này:{" "}
              <b>{formatHoursMinutes(Math.floor(displayMonthMs / 60000))}</b>
            </div>
          </div>
        </div>

        <div className={cx("page-frame")}>
          {currentPage === "dashboard" ? (
            <div className={cx("page-dashboard")}>
              <div className={cx("stats-grid")}>
                <StatCard
                  emoji="📚"
                  trend={activeCourseCount ? "Đã theo dõi" : "Chưa có"}
                  number={String(activeCourseCount)}
                  label="Khóa học đang theo dõi"
                  progress={Math.min(100, activeCourseCount * 20)}
                  color="var(--indigo)"
                />
                <StatCard
                  emoji="⏱️"
                  trend={pomoCount ? "Realtime" : "Chưa có"}
                  number={formatHoursMinutes(Math.floor(pomoTotalSec / 60))}
                  label="Giờ tập trung"
                  progress={Math.min(100, Math.floor(pomoTotalSec / 60))}
                  color="var(--teal)"
                  tone="teal"
                />
                <StatCard
                  emoji="✅"
                  trend="↑ cloud"
                  number={`${completePercentage}%`}
                  label="Tỷ lệ hoàn thành"
                  progress={completePercentage}
                  color="var(--amber)"
                  tone="amber"
                />
                <StatCard
                  emoji="🏆"
                  trend="↑ XP"
                  number={score.toLocaleString()}
                  label="Tổng điểm"
                  progress={Math.min(100, levelInfo.pct)}
                  color="var(--sky)"
                  tone="sky"
                />
              </div>

              <div className={cx("split-layout", "split-layout--dashboard")}>
                <section className={cx("card")}>
                  <div className={cx("card__header")}>
                    <div className={cx("card__title")}>Khóa học đang học</div>
                    <button
                      className={cx("card__action")}
                      type="button"
                      onClick={() => setCurrentPage("courses")}
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className={cx("list-stack")}>
                    {filteredDashboardCourses.length ? (
                      filteredDashboardCourses.map((course) => {
                        const progress = getCourseProgress(
                          course,
                          courseProgress,
                        );
                        const left = progress.total - progress.done;
                        return (
                          <button
                            key={course.id}
                            className={cx("course-row")}
                            type="button"
                            onClick={() => setCourseDetailId(course.id)}
                          >
                            <div
                              className={cx("course-row__thumb")}
                              style={{ background: course.color }}
                            >
                              {course.emoji}
                            </div>
                            <div className={cx("course-row__content")}>
                              <div className={cx("course-row__name")}>
                                {course.name}
                              </div>
                              <div
                                className={cx("course-row__meta")}
                              >{`${course.teacher} • ${course.totalLessons} bài học`}</div>
                              <div className={cx("progress-bar")}>
                                <div
                                  className={cx("progress-bar__fill")}
                                  style={{
                                    width: `${progress.pct}%`,
                                    background: course.fill,
                                  }}
                                />
                              </div>
                              <div
                                className={cx("course-row__meta")}
                              >{`${progress.pct}% • ${left === 0 ? "Đã hoàn thành" : `Còn ${left} bài`}`}</div>
                            </div>
                            <span
                              className={cx(
                                "badge",
                                `badge--${progress.pct === 100 ? "done" : course.tag}`,
                              )}
                            >
                              {progress.pct === 100
                                ? "✅ Hoàn tất"
                                : "Đang theo dõi"}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className={cx("placeholder-box")}>
                        Chưa theo dõi khóa học nào. Hãy mở trang Khóa học để bắt
                        đầu.
                      </div>
                    )}
                  </div>
                </section>

                <section className={cx("card")}>
                  <div className={cx("card__header")}>
                    <div className={cx("card__title")}>Lịch hôm nay</div>
                    <button
                      className={cx("card__action")}
                      type="button"
                      onClick={() =>
                        ensureAuthenticated() ? setModal("add-schedule") : null
                      }
                    >
                      + Thêm
                    </button>
                  </div>
                  <div className={cx("list-stack")}>
                    {schedule.length ? (
                      schedule.map((item, index) => {
                        const status = getScheduleStatus(item);
                        const isNext =
                          status === "upcoming" &&
                          index ===
                            schedule.findIndex(
                              (entry) =>
                                getScheduleStatus(entry) === "upcoming",
                            );
                        return (
                          <div
                            key={item.id}
                            className={cx(
                              "schedule-row",
                              status === "now" ? "schedule-row--now" : "",
                              status === "past" ? "schedule-row--past" : "",
                              isNext ? "schedule-row--next" : "",
                            )}
                          >
                            <div className={cx("schedule-row__time")}>
                              {item.time}
                            </div>
                            <div
                              className={cx("schedule-row__dot")}
                              style={{ background: item.color }}
                            />
                            <div className={cx("schedule-row__body")}>
                              <div className={cx("schedule-row__name")}>
                                {item.name}
                              </div>
                              <div
                                className={cx("schedule-row__meta")}
                              >{`${item.dur} phút • ${item.module}`}</div>
                            </div>
                            {status === "now" ? (
                              <span className={cx("badge", "badge--live")}>
                                Đang học
                              </span>
                            ) : null}
                            {status === "past" ? (
                              <span className={cx("badge", "badge--neutral")}>
                                Đã xong
                              </span>
                            ) : null}
                            {isNext ? (
                              <span className={cx("badge", "badge--done")}>
                                Tiếp theo
                              </span>
                            ) : null}
                          </div>
                        );
                      })
                    ) : (
                      <div className={cx("placeholder-box")}>
                        Chưa có lịch học nào.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <div className={cx("grid-layout", "grid-layout--dashboard")}>
                <section className={cx("card")}>
                  <div className={cx("card__header")}>
                    <div className={cx("card__title")}>
                      <SectionTitle icon="insight" label="Hoạt động 7 ngày" />
                    </div>
                  </div>
                  <div className={cx("chart")}>
                    {activity.map((value, index) => {
                      const height = Math.round(
                        (value / Math.max(...activity, 1)) * 85,
                      );
                      const dayLabels = [
                        "T2",
                        "T3",
                        "T4",
                        "T5",
                        "T6",
                        "T7",
                        "CN",
                      ];
                      const todayIndex =
                        new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
                      return (
                        <div
                          className={cx("chart__column")}
                          key={`${dayLabels[index]}-${value}`}
                        >
                          <div
                            className={cx("chart__bar")}
                            style={{
                              height,
                              background:
                                todayIndex === index
                                  ? "var(--indigo)"
                                  : "var(--chart-bar-muted)",
                            }}
                          />
                          <div className={cx("chart__label")}>
                            {dayLabels[index]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className={cx("chart__stats")}>
                    <div>
                      Tổng:{" "}
                      <b>
                        {formatHoursMinutes(
                          activity.reduce((sum, value) => sum + value, 0),
                        )}
                      </b>
                    </div>
                    <div>
                      TB/ngày:{" "}
                      <b>
                        {Math.round(
                          activity.reduce((sum, value) => sum + value, 0) / 7,
                        )}{" "}
                        phút
                      </b>
                    </div>
                    <div>
                      Tốt nhất:{" "}
                      <b>{formatHoursMinutes(Math.max(...activity))}</b>
                    </div>
                  </div>
                </section>

                <section className={cx("card")}>
                  <div className={cx("card__header")}>
                    <div className={cx("card__title")}>
                      <SectionTitle icon="trophy" label="Thành tích" />
                    </div>
                  </div>
                  <div className={cx("achievement-grid")}>
                    {[
                      ["🔥", "Chuỗi 14 ngày", "+500 XP"],
                      ["⚡", "Tốc độ học", "+300 XP"],
                      ["🎯", "Hoàn hảo", "+400 XP"],
                      ["📖", "Học 5 ngày", "+200 XP"],
                      ["👑", "Top leaderboard", "+1000 XP"],
                      ["💎", "100 giờ học", "+2000 XP"],
                    ].map(([icon, title, value], index) => (
                      <button
                        type="button"
                        key={title}
                        className={cx(
                          "achievement-card",
                          index > 3 ? "achievement-card--locked" : "",
                        )}
                        onClick={() => showToast(`${title} - ${value}!`, "🏆")}
                      >
                        <div className={cx("achievement-card__emoji")}>
                          <AppIcon name={icon} size="lg" />
                        </div>
                        <div className={cx("achievement-card__title")}>
                          {title}
                        </div>
                        <div className={cx("achievement-card__value")}>
                          {value}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className={cx("card")}>
                  <div className={cx("card__header")}>
                    <div className={cx("card__title")}>
                      <SectionTitle icon="leaderboard" label="Bảng xếp hạng" />
                    </div>
                  </div>
                  <div className={cx("list-stack")}>
                    {leaderboard.slice(0, 5).map((item) => (
                      <div
                        className={cx("leaderboard-row")}
                        key={item.uid || item.rank}
                      >
                        <div className={cx("leaderboard-row__rank")}>
                          {item.rank}
                        </div>
                        <div className={cx("leaderboard-row__avatar")}>
                          {item.initials}
                        </div>
                        <div className={cx("leaderboard-row__content")}>
                          <div className={cx("leaderboard-row__name")}>
                            {item.name}
                          </div>
                          <div
                            className={cx("leaderboard-row__meta")}
                          >{`Lv.${item.level}`}</div>
                        </div>
                        <div className={cx("leaderboard-row__score")}>
                          {Number(item.score || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    <div
                      className={cx("leaderboard-row", "leaderboard-row--me")}
                    >
                      <div className={cx("leaderboard-row__rank")}>
                        {myRank || "-"}
                      </div>
                      <div className={cx("leaderboard-row__avatar")}>
                        {currentUser ? getInitials(currentUser.name) : "LF"}
                      </div>
                      <div className={cx("leaderboard-row__content")}>
                        <div className={cx("leaderboard-row__name")}>
                          {currentUser?.name || "Bạn"}
                          <span className={cx("me-tag")}>Bạn</span>
                        </div>
                        <div
                          className={cx("leaderboard-row__meta")}
                        >{`Lv.${levelInfo.level}`}</div>
                      </div>
                      <div className={cx("leaderboard-row__score")}>
                        {score.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : null}

          {currentPage === "timer" ? (
            <div className={cx("page-centered")}>
              <section className={cx("card", "timer-card")}>
                <div className={cx("card__header", "card__header--center")}>
                  <div className={cx("card__title")}>
                    <SectionTitle icon="timer" label="Bộ hẹn giờ Pomodoro" />
                  </div>
                </div>
                <div className={cx("tabs")}>
                  {[
                    ["focus", "Tập trung"],
                    ["short", "Nghỉ ngắn"],
                    ["long", "Nghỉ dài"],
                  ].map(([mode, label]) => (
                    <button
                      type="button"
                      key={mode}
                      className={cx(
                        "tabs__item",
                        timerMode === mode ? "tabs__item--active" : "",
                      )}
                      onClick={() => {
                        setTimerMode(mode);
                        setTimerRunning(false);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className={cx("timer-ring")}>
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <circle
                      cx="55"
                      cy="55"
                      r="48"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="55"
                      cy="55"
                      r="48"
                      fill="none"
                      stroke="var(--indigo)"
                      strokeWidth="6"
                      strokeDasharray="301.6"
                      strokeDashoffset={
                        301.6 *
                        (1 -
                          timerRemaining /
                            Math.max(timerSettings[timerMode] * 60, 1))
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className={cx("timer-ring__content")}>
                    <div className={cx("timer-ring__number")}>
                      {formatMinutesToClock(timerRemaining)}
                    </div>
                    <div className={cx("timer-ring__label")}>
                      {timerMode === "focus"
                        ? "Tập trung"
                        : timerMode === "short"
                          ? "Nghỉ ngắn"
                          : "Nghỉ dài"}
                    </div>
                  </div>
                </div>
                <div className={cx("button-row")}>
                  <button
                    type="button"
                    className={cx("button", "button--ghost")}
                    onClick={resetTimer}
                  >
                    <AppIcon name="reset" size="sm" />
                    Đặt lại
                  </button>
                  <button
                    type="button"
                    className={cx("button", "button--primary")}
                    onClick={() =>
                      ensureAuthenticated()
                        ? setTimerRunning((value) => !value)
                        : null
                    }
                  >
                    <AppIcon name={timerRunning ? "pause" : "play"} size="sm" />
                    {timerRunning
                      ? "Dừng"
                      : timerRemaining === timerSettings[timerMode] * 60
                        ? "Bắt đầu"
                        : "Tiếp tục"}
                  </button>
                  <button
                    type="button"
                    className={cx("button", "button--ghost")}
                    onClick={skipTimer}
                  >
                    <AppIcon name="skip" size="sm" />
                    Bỏ qua
                  </button>
                </div>
                <div className={cx("split-stat-row")}>
                  <div className={cx("metric-card")}>
                    <div className={cx("metric-card__value")}>{pomoCount}</div>
                    <div className={cx("metric-card__label")}>
                      Phiên hoàn thành
                    </div>
                  </div>
                  <div className={cx("metric-card")}>
                    <div className={cx("metric-card__value")}>
                      {formatHoursMinutes(Math.floor(pomoTotalSec / 60))}
                    </div>
                    <div className={cx("metric-card__label")}>
                      Tổng thời gian
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {currentPage === "courses" ? (
            <CoursesPage
              courseFilter={courseFilter}
              filteredCourses={filteredCourses}
              onAddCourse={() =>
                ensureAuthenticated() ? setModal("add-course") : null
              }
              onFilterChange={setCourseFilter}
              onOpenCourseDetail={setCourseDetailId}
              courseProgress={courseProgress}
              trackedCourseIds={trackedCourseIds}
            />
          ) : null}

          {false ? (
            <div className={cx("page-stack")}>
              <div className={cx("section-heading")}>
                <div>
                  <h2>Tất cả khóa học</h2>
                  <p>{`${filteredCourses.length} khóa học • ${filteredCourses.filter((course) => getCourseProgress(course, courseProgress).pct === 100).length} đã hoàn thành`}</p>
                </div>
                <button
                  type="button"
                  className={cx("button", "button--primary")}
                  onClick={() =>
                    ensureAuthenticated() ? setModal("add-course") : null
                  }
                >
                  + Thêm khóa học
                </button>
              </div>
              <div className={cx("filter-row")}>
                {[
                  ["all", "Tất cả"],
                  ["active", "Đang học"],
                  ["done", "Hoàn thành"],
                  ["frontend", "Frontend"],
                  ["backend", "Backend"],
                  ["data", "Khoa học dữ liệu"],
                ].map(([filterId, label]) => (
                  <button
                    type="button"
                    key={filterId}
                    className={cx(
                      "filter-button",
                      courseFilter === filterId ? "filter-button--active" : "",
                    )}
                    onClick={() => setCourseFilter(filterId)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className={cx("course-grid")}>
                {filteredCourses.map((course) => {
                  const progress = getCourseProgress(course, courseProgress);
                  const isTracked = trackedCourseIds.has(course.id);
                  return (
                    <button
                      key={course.id}
                      className={cx("course-card")}
                      type="button"
                      onClick={() => setCourseDetailId(course.id)}
                    >
                      <div
                        className={cx("course-card__banner")}
                        style={{ background: course.color }}
                      >
                        {course.emoji}
                      </div>
                      <div className={cx("course-card__body")}>
                        <div className={cx("course-card__title")}>
                          {course.name}
                        </div>
                        <div
                          className={cx("course-card__meta")}
                        >{`${course.teacher} - ${course.category}`}</div>
                        <div className={cx("course-card__progress")}>
                          <span>Tiến độ</span>
                          <span
                            style={{ color: course.fill }}
                          >{`${progress.pct}%`}</span>
                        </div>
                        <div className={cx("progress-bar")}>
                          <div
                            className={cx("progress-bar__fill")}
                            style={{
                              width: `${progress.pct}%`,
                              background: course.fill,
                            }}
                          />
                        </div>
                        <div className={cx("course-card__footer")}>
                          <span>
                            {isTracked
                              ? `${progress.done} / ${progress.total} bài đã học`
                              : "Chưa theo dõi"}
                          </span>
                          <span
                            className={cx(
                              "badge",
                              `badge--${isTracked ? "live" : course.tag}`,
                            )}
                          >
                            {isTracked ? "Đang theo dõi" : course.tagText}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {currentPage === "notes" ? (
            <div className={cx("page-stack")}>
              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>Ghi chú nhanh</div>
                  <button
                    type="button"
                    className={cx("button", "button--primary")}
                    onClick={addNote}
                  >
                    + Thêm ghi chú
                  </button>
                </div>
                <div className={cx("notes-grid")}>
                  {notes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      className={cx("note-card", `note-card--${note.tone}`)}
                      onClick={() => editNote(note.id)}
                    >
                      <div className={cx("note-card__title")}>{note.title}</div>
                      <div className={cx("note-card__body")}>{note.body}</div>
                      <div className={cx("note-card__date")}>{note.date}</div>
                    </button>
                  ))}
                  <button
                    type="button"
                    className={cx("note-card", "note-card--add")}
                    onClick={addNote}
                  >
                    <span>+</span>
                    <span>Thêm ghi chú</span>
                  </button>
                </div>
              </section>
            </div>
          ) : null}

          {currentPage === "tasks" ? (
            <div className={cx("page-stack")}>
              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>Bài tập cần làm</div>
                  <button
                    type="button"
                    className={cx("button", "button--primary")}
                    onClick={() =>
                      ensureAuthenticated() ? setModal("add-task") : null
                    }
                  >
                    + Thêm bài tập
                  </button>
                </div>
                <div className={cx("list-stack")}>
                  {tasks.length ? (
                    tasks.map((task) => (
                      <div key={task.id} className={cx("task-row")}>
                        <input
                          className={cx("task-checkbox")}
                          checked={task.done}
                          type="checkbox"
                          onChange={() => toggleTask(task.id)}
                          aria-label={`Đánh dấu hoàn thành cho ${task.name}`}
                        />
                        <div
                          className={cx("task-row__content")}
                          style={{ opacity: task.done ? 0.5 : 1 }}
                        >
                          <div
                            className={cx("task-row__title")}
                            style={{
                              textDecoration: task.done
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {task.name}
                          </div>
                          <div
                            className={cx("task-row__meta")}
                          >{`${task.course} • Hạn: ${formatDateVi(task.date)}`}</div>
                        </div>
                        <span
                          className={cx(
                            "badge",
                            `badge--${PRIORITY_MAP[task.priority]?.badge || "new"}`,
                          )}
                        >
                          {PRIORITY_MAP[task.priority]?.text || "Mới"}
                        </span>
                        <button
                          type="button"
                          className={cx("icon-button", "icon-button--plain")}
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Xóa bài tập ${task.name}`}
                        >
                          <AppIcon name="trash" size="sm" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className={cx("placeholder-box")}>
                      Chưa có bài tập nào.
                    </div>
                  )}
                </div>
                <div className={cx("task-progress")}>
                  <div className={cx("progress-bar")}>
                    <div
                      className={cx("progress-bar__fill")}
                      style={{
                        width: `${tasks.length ? Math.round((tasks.filter((task) => task.done).length / tasks.length) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <div
                    className={cx("task-progress__label")}
                  >{`${tasks.filter((task) => task.done).length} / ${tasks.length} hoàn thành`}</div>
                </div>
              </section>
            </div>
          ) : null}

          {currentPage === "progress" ? (
            <div className={cx("split-layout")}>
              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>Tiến độ các khóa học</div>
                </div>
                <div className={cx("list-stack")}>
                  {trackedCourseDetails.length ? (
                    trackedCourseDetails.map((course) => {
                      const progress = getCourseProgress(
                        course,
                        courseProgress,
                      );
                      return (
                        <div key={course.id} className={cx("progress-course")}>
                          <div className={cx("progress-course__header")}>
                            <span>{`${course.emoji} ${course.name.split(" ").slice(0, 4).join(" ")}...`}</span>
                            <span
                              style={{ color: course.fill }}
                            >{`${progress.pct}%`}</span>
                          </div>
                          <div className={cx("progress-bar")}>
                            <div
                              className={cx("progress-bar__fill")}
                              style={{
                                width: `${progress.pct}%`,
                                background: course.fill,
                              }}
                            />
                          </div>
                          <div
                            className={cx("progress-course__meta")}
                          >{`${progress.done} / ${progress.total} bài • ${course.teacher}`}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={cx("placeholder-box")}>
                      Chưa có khóa học nào đang theo dõi.
                    </div>
                  )}
                </div>
              </section>

              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>
                    <SectionTitle icon="target" label="Mục tiêu tuần này" />
                  </div>
                </div>
                <div className={cx("goal-list")}>
                  <div className={cx("goal-card", "goal-card--indigo")}>
                    <SectionTitle
                      icon="timer"
                      label={`Học 10 giờ / tuần • ${Math.floor(displayWeekMs / 3600000)}h / 10h`}
                    />
                  </div>
                  <div className={cx("goal-card", "goal-card--teal")}>
                    <SectionTitle
                      icon="done"
                      label={`Hoàn thành bài tập • ${tasks.filter((task) => task.done).length} / ${tasks.length}`}
                    />
                  </div>
                  <div className={cx("goal-card", "goal-card--amber")}>
                    <SectionTitle
                      icon="book"
                      label={`Bài học hoàn thành tuần này • ${lessonsWeek} bài`}
                    />
                  </div>
                  <div className={cx("goal-card", "goal-card--rose")}>
                    <SectionTitle
                      icon="localFire"
                      label={`Duy trì chuỗi học • ${streak > 0 ? "Đạt" : "Chưa đạt"}`}
                    />
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {currentPage === "problems" ? (
            <div className={cx("problems-page")}>
              {/* Header bar */}
              <div className={cx("problems-page__header")}>
                <div>
                  <h2 className={cx("problems-page__title")}>Luyện tập lập trình</h2>
                  <p className={cx("problems-page__sub")}>
                    {`${solvedProblems} / ${catalogProblems.length} bài đã giải`}
                  </p>
                </div>
                <label className={cx("lc-search-box")}>
                  <AppIcon name="search" />
                  <input
                    value={problemSearch}
                    onChange={(event) => { setProblemSearch(event.target.value); setProblemPage(0); }}
                    placeholder="Tìm bài theo tên hoặc chủ đề..."
                  />
                </label>
              </div>

              {/* Stats strip */}
              <div className={cx("lc-stats-strip")}>
                <div className={cx("lc-stat-item", "lc-stat-item--solved")}>
                  <span className={cx("lc-stat-item__num")}>{solvedProblems}</span>
                  <span className={cx("lc-stat-item__label")}>Đã giải</span>
                </div>
                <div className={cx("lc-stat-divider")} />
                <div className={cx("lc-stat-item", "lc-stat-item--easy")}>
                  <span className={cx("lc-stat-item__num")}>
                    {catalogProblems.filter((item) => item.diff === "easy" && (problemStatuses[item.id] || "none") === "done").length}
                  </span>
                  <span className={cx("lc-stat-item__label")}>Dễ ✓</span>
                </div>
                <div className={cx("lc-stat-item", "lc-stat-item--medium")}>
                  <span className={cx("lc-stat-item__num")}>
                    {catalogProblems.filter((item) => item.diff === "medium" && (problemStatuses[item.id] || "none") === "done").length}
                  </span>
                  <span className={cx("lc-stat-item__label")}>Trung bình ✓</span>
                </div>
                <div className={cx("lc-stat-item", "lc-stat-item--hard")}>
                  <span className={cx("lc-stat-item__num")}>
                    {catalogProblems.filter((item) => item.diff === "hard" && (problemStatuses[item.id] || "none") === "done").length}
                  </span>
                  <span className={cx("lc-stat-item__label")}>Khó ✓</span>
                </div>
                <div className={cx("lc-stat-divider")} />
                <div className={cx("lc-stat-item", "lc-stat-item--total")}>
                  <span className={cx("lc-stat-item__num")}>{catalogProblems.length}</span>
                  <span className={cx("lc-stat-item__label")}>Tổng bài</span>
                </div>
                {/* progress bar */}
                <div className={cx("lc-stats-progress")}>
                  <div
                    className={cx("lc-stats-progress__fill")}
                    style={{ width: `${catalogProblems.length ? Math.round((solvedProblems / catalogProblems.length) * 100) : 0}%` }}
                  />
                </div>
              </div>

              {/* Controls row */}
              <div className={cx("lc-controls-row")}>
                <div className={cx("lc-filter-group")}>
                  {[
                    ["all", "Tất cả"],
                    ["easy", "Dễ"],
                    ["medium", "Vừa"],
                    ["hard", "Khó"],
                    ["done", "Đã làm"],
                    ["todo", "Chưa làm"],
                  ].map(([filterId, label]) => (
                    <button
                      type="button"
                      key={filterId}
                      className={cx(
                        "lc-filter-btn",
                        problemFilter === filterId ? `lc-filter-btn--active-${filterId}` : "",
                      )}
                      onClick={() => { setProblemFilter(filterId); setProblemPage(0); }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tag filter toggle */}
                <button
                  type="button"
                  className={cx("lc-tag-toggle", showTagFilter ? "lc-tag-toggle--open" : "")}
                  onClick={() => setShowTagFilter(!showTagFilter)}
                >
                  <AppIcon name="tag" size="sm" />
                  Chủ đề
                  {selectedTags.length > 0 && (
                    <span className={cx("lc-tag-toggle__badge")}>{selectedTags.length}</span>
                  )}
                  <span className={cx("lc-tag-toggle__arrow")}>{showTagFilter ? "▲" : "▼"}</span>
                </button>
              </div>

              {/* Tag filter panel */}
              {showTagFilter && (
                <div className={cx("lc-tag-panel")}>
                  <div className={cx("lc-tag-grid")}>
                    {allAvailableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={cx("lc-tag-chip", selectedTags.includes(tag) ? "lc-tag-chip--active" : "")}
                        onClick={() => { toggleTag(tag); setProblemPage(0); }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <div className={cx("lc-tag-panel__footer")}>
                      <span className={cx("lc-tag-panel__count")}>
                        {filteredProblems.length} bài phù hợp
                      </span>
                      <button
                        type="button"
                        className={cx("lc-tag-panel__clear")}
                        onClick={clearAllTags}
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Active tag pills when panel is hidden */}
              {selectedTags.length > 0 && !showTagFilter && (
                <div className={cx("lc-active-tags")}>
                  {selectedTags.map((tag) => (
                    <span key={tag} className={cx("lc-active-tag")}>
                      {tag}
                      <button type="button" onClick={() => toggleTag(tag)} aria-label={`Xóa tag ${tag}`}>✕</button>
                    </span>
                  ))}
                  <button type="button" className={cx("lc-active-tags__clear")} onClick={clearAllTags}>
                    Xóa tất cả
                  </button>
                </div>
              )}

              {/* Problem table */}
              {(() => {
                const PROBLEMS_PER_PAGE = 35;
                const totalPages = Math.max(1, Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE));
                const safePage = Math.min(problemPage, totalPages - 1);
                const pagedProblems = filteredProblems.slice(safePage * PROBLEMS_PER_PAGE, (safePage + 1) * PROBLEMS_PER_PAGE);
                const startNum = filteredProblems.length === 0 ? 0 : safePage * PROBLEMS_PER_PAGE + 1;
                const endNum = Math.min((safePage + 1) * PROBLEMS_PER_PAGE, filteredProblems.length);

                return (
                  <>
                    <div className={cx("lc-table-wrap")}>
                      <table className={cx("lc-problem-table")}>
                        <thead>
                          <tr>
                            <th className={cx("lc-col-status")} />
                            <th className={cx("lc-col-id")}>#</th>
                            <th className={cx("lc-col-title")}>Tên bài</th>
                            <th className={cx("lc-col-tags")}>Chủ đề</th>
                            <th className={cx("lc-col-diff")}>Độ khó</th>
                            <th className={cx("lc-col-ac")}>Tỷ lệ AC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedProblems.map((problem) => {
                            const status = problemStatuses[problem.id] || "none";
                            return (
                              <tr
                                key={problem.id}
                                className={cx(
                                  "lc-problem-row",
                                  status === "done" ? "lc-problem-row--done" : "",
                                )}
                                onClick={() => openProblem(problem.id)}
                              >
                                <td className={cx("lc-col-status")}>
                                  <button
                                    type="button"
                                    className={cx("lc-status-btn", `lc-status-btn--${status}`)}
                                    onClick={(e) => { e.stopPropagation(); toggleProblemStatus(problem.id); }}
                                    aria-label="Đổi trạng thái"
                                  >
                                    {status === "done" ? (
                                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="7" r="6.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2"/>
                                        <path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    ) : status === "try" ? (
                                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="7" r="6.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2"/>
                                        <circle cx="7" cy="7" r="2" fill="currentColor"/>
                                      </svg>
                                    ) : (
                                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35"/>
                                      </svg>
                                    )}
                                  </button>
                                </td>
                                <td className={cx("lc-col-id")}>{String(problem.id).padStart(2, "0")}</td>
                                <td className={cx("lc-col-title")}>
                                  <span className={cx("lc-problem-name")}>{problem.name}</span>
                                </td>
                                <td className={cx("lc-col-tags")}>
                                  <div className={cx("lc-tag-list")}>
                                    {problem.tags.slice(0, 2).map((tag) => (
                                      <span key={`${problem.id}-${tag}`} className={cx("lc-tag")}>
                                        {tag}
                                      </span>
                                    ))}
                                    {problem.tags.length > 2 && (
                                      <span className={cx("lc-tag", "lc-tag--more")}>
                                        +{problem.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className={cx("lc-col-diff")}>
                                  <span className={cx("lc-diff-badge", `lc-diff-badge--${problem.diff}`)}>
                                    {problem.diff === "easy" ? "Dễ" : problem.diff === "medium" ? "Vừa" : "Khó"}
                                  </span>
                                </td>
                                <td className={cx("lc-col-ac")}>
                                  <span
                                    className={cx("lc-ac-value", acRateMap[problem.id] ? "lc-ac-value--live" : "")}
                                    title={acRateMap[problem.id]
                                      ? `${acRateMap[problem.id].accepted}/${acRateMap[problem.id].total} lần nộp`
                                      : "Chưa có lần nộp nào"}
                                  >
                                    {getAcRate(problem)}
                                    {acRateMap[problem.id] && (
                                      <span className={cx("lc-ac-sub")}>
                                        {`${acRateMap[problem.id].accepted}/${acRateMap[problem.id].total}`}
                                      </span>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {filteredProblems.length === 0 && (
                            <tr>
                              <td colSpan={6} className={cx("lc-empty-row")}>
                                Không tìm thấy bài nào phù hợp.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination footer */}
                    {filteredProblems.length > 0 && (
                      <div className={cx("lc-pagination-bar")}>
                        <span className={cx("lc-pagination-bar__info")}>
                          {`Hiển thị ${startNum}–${endNum} / ${filteredProblems.length} bài`}
                        </span>
                        <div className={cx("lc-pagination")}>
                          <button
                            type="button"
                            className={cx("lc-pg-btn", "lc-pg-btn--arrow")}
                            onClick={() => setProblemPage(0)}
                            disabled={safePage === 0}
                            aria-label="Trang đầu"
                          >
                            «
                          </button>
                          <button
                            type="button"
                            className={cx("lc-pg-btn", "lc-pg-btn--arrow")}
                            onClick={() => setProblemPage(safePage - 1)}
                            disabled={safePage === 0}
                            aria-label="Trang trước"
                          >
                            ‹
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => {
                            // show first, last, current ±1, and ellipsis
                            const showPage = i === 0 || i === totalPages - 1 || Math.abs(i - safePage) <= 1;
                            const showEllipsisBefore = i === safePage - 2 && safePage - 2 > 1;
                            const showEllipsisAfter = i === safePage + 2 && safePage + 2 < totalPages - 2;
                            if (showEllipsisBefore) return (
                              <span key={`el-b-${i}`} className={cx("lc-pg-ellipsis")}>…</span>
                            );
                            if (showEllipsisAfter) return (
                              <span key={`el-a-${i}`} className={cx("lc-pg-ellipsis")}>…</span>
                            );
                            if (!showPage) return null;
                            return (
                              <button
                                key={i}
                                type="button"
                                className={cx("lc-pg-btn", safePage === i ? "lc-pg-btn--active" : "")}
                                onClick={() => setProblemPage(i)}
                              >
                                {i + 1}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            className={cx("lc-pg-btn", "lc-pg-btn--arrow")}
                            onClick={() => setProblemPage(safePage + 1)}
                            disabled={safePage === totalPages - 1}
                            aria-label="Trang sau"
                          >
                            ›
                          </button>
                          <button
                            type="button"
                            className={cx("lc-pg-btn", "lc-pg-btn--arrow")}
                            onClick={() => setProblemPage(totalPages - 1)}
                            disabled={safePage === totalPages - 1}
                            aria-label="Trang cuối"
                          >
                            »
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : null}

          {currentPage === "leaderboard" ? (
            <ProblemLeaderboard />
          ) : null}

          {currentPage === "editor" && editorProblem ? (
            <div className={cx("editor-layout")}>
              <section className={cx("editor-layout__left")}>
                <div className={cx("editor-header")}>
                  <button
                    type="button"
                    className={cx("button", "button--ghost")}
                    onClick={() => setCurrentPage("problems")}
                  >
                    ← Danh sách
                  </button>
                  <div className={cx("editor-header__meta")}>
                    <span>#{editorProblem.id}</span>
                    <strong>{editorProblem.name}</strong>
                  </div>
                  <span
                    className={cx(
                      "difficulty",
                      `difficulty--${editorProblem.diff}`,
                    )}
                  >
                    {editorProblem.diff}
                  </span>
                </div>
                <div className={cx("problem-tabs")}>
                  {[
                    ["description", "Mô tả"],
                    ["editorial", "Hướng dẫn"],
                    ["comments", "Bình luận"],
                    ["solutions", "Giải pháp"],
                  ].map(([tabId, label]) => (
                    <button
                      type="button"
                      key={tabId}
                      className={cx(
                        "tabs__item",
                        problemDescriptionTab === tabId ? "tabs__item--active" : "",
                      )}
                      onClick={() => setProblemDescriptionTab(tabId)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className={cx("problem-tabs__content")}>
                  {problemDescriptionTab === "description" && (
                    <div className={cx("editor-description")}>
                      <section className={cx("editor-block")}>
                        <p>{editorProblem.description}</p>
                      </section>
                      <section className={cx("editor-block")}>
                        <h4>Ví dụ</h4>
                        {editorProblem.examples.map((example, index) => (
                          <pre
                            key={`${editorProblem.id}-example-${index}`}
                          >{`Đầu vào: ${example.input}\nĐầu ra: ${example.output}${example.explain ? `\nGiải thích: ${example.explain}` : ""}`}</pre>
                        ))}
                      </section>
                      <section className={cx("editor-block")}>
                        <h4>Ràng buộc</h4>
                        <ul>
                          {editorProblem.constraints.map((constraint) => (
                            <li key={constraint}>{constraint}</li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  )}
                  {problemDescriptionTab === "editorial" && (
                    <div className={cx("editor-description")}>
                      <section className={cx("editor-block")}>
                        <p style={{ textAlign: "center", color: "var(--text-2)" }}>
                          Hướng dẫn sẽ được cập nhật sớm
                        </p>
                      </section>
                    </div>
                  )}
                  {problemDescriptionTab === "comments" && (
                    <div className={cx("problem-tabs__comments")}>
                      <CommentSection
                        problemId={editorProblem?.id}
                        uid={currentUser?.uid}
                        userName={currentUser?.name}
                        darkMode={preferences.darkMode}
                      />
                    </div>
                  )}
                  {problemDescriptionTab === "solutions" && (
                    <div className={cx("problem-tabs__comments")}>
                      <CommentSection
                        problemId={editorProblem?.id}
                        uid={currentUser?.uid}
                        userName={currentUser?.name}
                        darkMode={preferences.darkMode}
                        filterSolutions={true}
                      />
                    </div>
                  )}
                </div>
              </section>
              <section className={cx("editor-layout__right")}>
                <div className={cx("editor-toolbar")}>
                  <div className={cx("editor-toolbar__left")}>
                    <select
                      value={editorLang}
                      onChange={(event) => changeEditorLang(event.target.value)}
                    >
                      <option value="python">🐍 Python</option>
                      <option value="javascript">🟨 JavaScript</option>
                      <option value="java">☕ Java</option>
                      <option value="cpp">⚡ C++</option>
                    </select>
                    <span>Tab = 2 khoảng trắng</span>
                  </div>
                  <div className={cx("editor-toolbar__actions")}>
                    <button
                      type="button"
                      className={cx("button", "button--ghost-dark")}
                      onClick={openChallengeModal}
                    >
                      <AppIcon name="timer" size="sm" />
                      Hẹn giờ
                    </button>
                    <button
                      type="button"
                      className={cx("button", "button--primary")}
                      onClick={handleRunCode}
                    >
                      <AppIcon name="play" size="sm" />
                      Chạy
                    </button>
                    <button
                      type="button"
                      className={cx("button", "button--success")}
                      onClick={handleSubmitCode}
                    >
                      <AppIcon name="send" size="sm" />
                      Nộp bài
                    </button>
                  </div>
                </div>
                {challenge.endTime ? (
                  <div className={cx("challenge-bar")}>
                    <div className={cx("challenge-bar__ring")}>
                      <svg width="36" height="36" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="var(--border-2)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke={
                            challengeRemaining <= 60
                              ? "var(--rose)"
                              : "var(--indigo)"
                          }
                          strokeWidth="3"
                          strokeDasharray="94.2"
                          strokeDashoffset={94.2 * challengeProgress}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>
                        {challengeRemaining < 60
                          ? `${challengeRemaining}s`
                          : `${Math.floor(challengeRemaining / 60)}m`}
                      </span>
                    </div>
                    <div className={cx("challenge-bar__content")}>
                      <div>⚡ Thử thách thời gian</div>
                      <div>{`${padNumber(Math.floor(challengeRemaining / 60))}:${padNumber(challengeRemaining % 60)}`}</div>
                    </div>
                    <button
                      type="button"
                      className={cx("button", "button--ghost-dark")}
                      onClick={stopChallengeTimer}
                    >
                      <AppIcon name="close" size="sm" />
                      Dừng
                    </button>
                  </div>
                ) : null}
                <textarea
                  className={cx("code-editor")}
                  spellCheck={false}
                  value={editorCode}
                  onChange={(event) => setEditorCode(event.target.value)}
                  onKeyDown={handleEditorKeyDown}
                />
                <div className={cx("output-panel")}>
                  <div className={cx("tabs", "tabs--dark")}>
                    {[
                      ["testcase", "Bộ kiểm thử"],
                      ["result", "Kết quả"],
                      ["submissions", "Lần nộp"],
                    ].map(([tabId, label]) => (
                      <button
                        type="button"
                        key={tabId}
                        className={cx(
                          "tabs__item",
                          outputTab === tabId ? "tabs__item--active" : "",
                        )}
                        onClick={() => handleOutputTabChange(tabId)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div
                    className={cx("output-panel__body")}
                    dangerouslySetInnerHTML={{ __html: outputHtml }}
                  />
                </div>
              </section>
            </div>
          ) : null}

          {currentPage === "ai-analysis" ? (
            <div className={cx("page-stack")}>
              <div className={cx("section-heading")}>
                <div>
                  <h2>Phân tích năng lực bằng AI</h2>
                  <p>Dựa trên dữ liệu học thật của tài khoản hiện tại</p>
                </div>
                <button
                  type="button"
                  className={cx("button", "button--primary")}
                  onClick={runAIAnalysis}
                  disabled={!currentUser || !canRunAiAnalysis}
                >
                  {!currentUser
                    ? "Cần đăng nhập"
                    : canRunAiAnalysis
                      ? "⚡ Phân tích ngay"
                      : "Chưa đủ dữ liệu"}
                </button>
              </div>
              {!currentUser ? (
                <div className={cx("placeholder-box")}>
                  Đăng nhập để dùng AI Phân tích.
                </div>
              ) : null}
              {currentUser && !canRunAiAnalysis ? (
                <div className={cx("placeholder-box")}>
                  Cần có dữ liệu học tập thật như theo dõi khóa học, hoàn thành
                  bài học, làm bài luyện code hoặc dùng Pomodoro trước khi phân
                  tích.
                </div>
              ) : null}
              <div className={cx("stats-grid")}>
                <StatCard
                  emoji="🎯"
                  trend={aiResult ? "RF v1" : "--"}
                  number={aiResult ? `${aiResult.skillScore}` : "--"}
                  label="Điểm năng lực"
                  progress={aiResult?.skillScore || 0}
                  color="var(--indigo)"
                />
                <StatCard
                  emoji="⏱️"
                  trend={aiResult ? "Ổn định" : "--"}
                  number={aiResult ? `${aiResult.avgTime}p` : "--"}
                  label="Tốc độ trung bình"
                  progress={Math.min(100, 100 - (aiResult?.avgTime || 0))}
                  color="var(--teal)"
                  tone="teal"
                />
                <StatCard
                  emoji="🏆"
                  trend={aiResult ? "LogReg" : "--"}
                  number={aiResult ? `${aiResult.acProbability}%` : "--"}
                  label="Tỷ lệ AC dự đoán"
                  progress={aiResult?.acProbability || 0}
                  color="var(--amber)"
                  tone="amber"
                />
                <StatCard
                  emoji="📈"
                  trend={aiResult ? "Dự báo" : "--"}
                  number={aiResult ? `Lv.${aiResult.predictedLevel}` : "--"}
                  label="Cấp độ dự đoán"
                  progress={aiResult ? aiResult.predictedLevel * 6 : 0}
                  color="var(--sky)"
                  tone="sky"
                />
              </div>
              <div className={cx("split-layout")}>
                <section className={cx("card")}>
                  <div className={cx("card__header")}>
                    <div className={cx("card__title")}>
                      <SectionTitle
                        icon="psychology"
                        label="Phân tích chi tiết"
                      />
                    </div>
                  </div>
                  {aiResult ? (
                    <>
                      <div className={cx("analysis-box")}>
                        <div>{`Điểm năng lực hiện tại: ${aiResult.skillScore}/100`}</div>
                        <div>{`Cấp độ dự đoán: ${aiResult.predictedLevel}`}</div>
                        <div>{`Số bài đã AC: ${solvedProblems}`}</div>
                      </div>
                      <div className={cx("topic-list")}>
                        {aiResult.topics.map((topic) => (
                          <div key={topic.label} className={cx("topic-row")}>
                            <div className={cx("topic-row__label")}>
                              {topic.label}
                            </div>
                            <div className={cx("topic-row__bar")}>
                              <div
                                className={cx("topic-row__fill")}
                                style={{
                                  width: `${topic.value}%`,
                                  background: topic.color,
                                }}
                              />
                            </div>
                            <div
                              className={cx("topic-row__value")}
                            >{`${topic.value}%`}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className={cx("placeholder-box")}>
                      Chưa có dữ liệu phân tích
                    </div>
                  )}
                </section>
                <div className={cx("stack-column")}>
                  <section className={cx("card")}>
                    <div className={cx("card__header")}>
                      <div className={cx("card__title")}>
                        <SectionTitle
                          icon="lightbulb"
                          label="Nhận xét và lộ trình"
                        />
                      </div>
                    </div>
                    {aiResult ? (
                      <div className={cx("feedback-list")}>
                        {aiResult.feedback.map((item) => (
                          <div
                            key={item.title}
                            className={cx(
                              "feedback-card",
                              `feedback-card--${item.tone}`,
                            )}
                          >
                            <div className={cx("feedback-card__title")}>
                              {item.title}
                            </div>
                            <div>{item.body}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={cx("placeholder-box")}>
                        Chưa có phân tích
                      </div>
                    )}
                  </section>
                  <section className={cx("card")}>
                    <div className={cx("card__header")}>
                      <div className={cx("card__title")}>
                        <SectionTitle
                          icon="target"
                          label="Gợi ý bài tiếp theo"
                        />
                      </div>
                    </div>
                    {aiResult ? (
                      <div className={cx("suggestion-list")}>
                        {aiResult.suggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={cx("suggestion-row")}
                            onClick={() => openProblem(item.id)}
                          >
                            <div className={cx("suggestion-row__name")}>
                              {item.name}
                            </div>
                            <div className={cx("suggestion-row__reason")}>
                              {item.reason}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className={cx("placeholder-box")}>Chưa có gợi ý</div>
                    )}
                  </section>
                </div>
              </div>
              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>
                    <SectionTitle
                      icon="search"
                      label="Hỗ trợ thông minh khi làm bài"
                    />
                  </div>
                </div>
                <div className={cx("hint-grid")}>
                  <button
                    type="button"
                    className={cx("hint-card")}
                    onClick={() => showAIHint("complexity")}
                  >
                    <div className={cx("hint-card__icon")}>
                      <AppIcon name="analytics" size="lg" />
                    </div>
                    <div className={cx("hint-card__title")}>
                      Phân tích độ phức tạp
                    </div>
                    <div className={cx("hint-card__desc")}>
                      Độ phức tạp thời gian và bộ nhớ của bài hiện tại
                    </div>
                  </button>
                  <button
                    type="button"
                    className={cx("hint-card")}
                    onClick={() => showAIHint("approach")}
                  >
                    <div className={cx("hint-card__icon")}>
                      <AppIcon name="lightbulb" size="lg" />
                    </div>
                    <div className={cx("hint-card__title")}>
                      Gợi ý thuật toán
                    </div>
                    <div className={cx("hint-card__desc")}>
                      AI gợi ý hướng tiếp cận phù hợp
                    </div>
                  </button>
                  <button
                    type="button"
                    className={cx("hint-card")}
                    onClick={() => showAIHint("similar")}
                  >
                    <div className={cx("hint-card__icon")}>
                      <AppIcon name="hub" size="lg" />
                    </div>
                    <div className={cx("hint-card__title")}>
                      Bài tương tự đã làm
                    </div>
                    <div className={cx("hint-card__desc")}>
                      Tìm mẫu tương tự trong lịch sử của bạn
                    </div>
                  </button>
                </div>
              </section>
            </div>
          ) : null}

          {currentPage === "admin" &&
          ["admin", "superadmin"].includes(profile?.role) ? (
            <AdminDashboard
              catalogCourses={catalogCourses}
              catalogProblems={catalogProblems}
              showToast={showToast}
            />
          ) : null}

          {currentPage === "settings" ? (
            <div className={cx("page-settings")}>
              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>Hồ sơ cá nhân</div>
                </div>
                <div className={cx("profile-card")}>
                  <div className={cx("profile-card__avatar")}>
                    {currentUser ? getInitials(currentUser.name) : "?"}
                  </div>
                  <div className={cx("profile-card__body")}>
                    <div className={cx("profile-card__name")}>
                      {currentUser?.name || "Người dùng"}
                    </div>
                    <div className={cx("profile-card__meta")}>
                      {currentUser?.email || "Chưa đăng nhập"}
                    </div>
                    <div className={cx("profile-card__badges")}>
                      <span
                        className={cx("badge", "badge--new")}
                      >{`${levelInfo.emoji} Cấp ${levelInfo.level}`}</span>
                      <span>{levelInfo.title}</span>
                    </div>
                  </div>
                </div>
                <div className={cx("xp-box")}>
                  <div className={cx("xp-box__header")}>
                    <SectionTitle icon="spark" label="Kinh nghiệm (XP)" />
                    <span>{`${score.toLocaleString()} XP tổng cộng`}</span>
                  </div>
                  <div className={cx("progress-bar")}>
                    <div
                      className={cx("progress-bar__fill")}
                      style={{
                        width: `${levelInfo.pct}%`,
                        background:
                          "linear-gradient(90deg,var(--indigo),var(--indigo-mid))",
                      }}
                    />
                  </div>
                  <div className={cx("xp-box__sub")}>
                    {levelInfo.nextLevel
                      ? `${levelInfo.xpInLevel.toLocaleString()} / ${levelInfo.xpToNext.toLocaleString()} XP • cần thêm ${(levelInfo.xpToNext - levelInfo.xpInLevel).toLocaleString()} XP để lên cấp ${levelInfo.level + 1}`
                      : "Đã đạt cấp độ tối đa."}
                  </div>
                </div>
                <div className={cx("stats-grid", "stats-grid--compact")}>
                  <MiniStat
                    label="Tổng điểm"
                    value={score.toLocaleString()}
                    tone="indigo"
                  />
                  <MiniStat
                    label="Chuỗi học"
                    value={String(streak)}
                    tone="teal"
                  />
                  <MiniStat
                    label="Ngày hoạt động"
                    value={String(daysActive)}
                    tone="emerald"
                  />
                  <MiniStat
                    label="Bài đã giải"
                    value={String(solvedProblems)}
                    tone="amber"
                  />
                </div>
              </section>

              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>
                    <SectionTitle icon="route" label="Lộ trình cấp độ" />
                  </div>
                </div>
                <div className={cx("roadmap-list")}>
                  {LEVEL_TABLE.map((item) => {
                    const isCurrent = item.level === levelInfo.level;
                    const isDone = score >= item.minXP && !isCurrent;
                    return (
                      <div
                        key={item.level}
                        className={cx(
                          "roadmap-item",
                          isCurrent ? "roadmap-item--current" : "",
                          isDone ? "roadmap-item--done" : "",
                        )}
                      >
                        <div className={cx("roadmap-item__emoji")}>
                          {item.emoji}
                        </div>
                        <div className={cx("roadmap-item__content")}>
                          <div
                            className={cx("roadmap-item__title")}
                          >{`Cấp ${item.level} • ${item.title}`}</div>
                          <div
                            className={cx("roadmap-item__meta")}
                          >{`Từ ${item.minXP.toLocaleString()} XP`}</div>
                        </div>
                        <div>
                          {isCurrent ? (
                            <SectionTitle icon="star" label="Hiện tại" />
                          ) : isDone ? (
                            <AppIcon name="done" size="sm" />
                          ) : (
                            <AppIcon name="lock" size="sm" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>Giao diện</div>
                </div>
                <div className={cx("settings-list")}>
                  <SettingRow
                    label="Chế độ tối"
                    desc="Áp dụng giao diện tối cho toàn bộ ứng dụng và lưu lại lựa chọn của bạn"
                    action={
                      <ToggleSwitch
                        checked={settings.darkMode}
                        onChange={(nextValue) =>
                          updateSettingsValue("darkMode", nextValue)
                        }
                        label="Chế độ tối"
                      />
                    }
                  />
                  <SettingRow
                    label="Cỡ chữ"
                    desc="Điều chỉnh kích thước chữ cho toàn ứng dụng"
                    action={
                      <SegmentedControl
                        options={FONT_SIZE_OPTIONS}
                        value={settings.fontSize}
                        onChange={(nextValue) =>
                          updateSettingsValue("fontSize", nextValue)
                        }
                      />
                    }
                  />
                </div>
              </section>

              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>
                    <SectionTitle icon="timer" label="Cài đặt Pomodoro" />
                  </div>
                </div>
                <div className={cx("settings-list")}>
                  <PomodoroRow
                    label="Thời gian tập trung"
                    desc="Mỗi phiên Pomodoro (phút)"
                    value={timerSettings.focus}
                    onDecrease={() =>
                      updatePomodoroSetting(
                        "focus",
                        Math.max(5, timerSettings.focus - 5),
                      )
                    }
                    onIncrease={() =>
                      updatePomodoroSetting(
                        "focus",
                        Math.min(60, timerSettings.focus + 5),
                      )
                    }
                  />
                  <PomodoroRow
                    label="Nghỉ ngắn"
                    desc="Giữa các phiên"
                    value={timerSettings.short}
                    onDecrease={() =>
                      updatePomodoroSetting(
                        "short",
                        Math.max(1, timerSettings.short - 1),
                      )
                    }
                    onIncrease={() =>
                      updatePomodoroSetting(
                        "short",
                        Math.min(15, timerSettings.short + 1),
                      )
                    }
                  />
                  <PomodoroRow
                    label="Nghỉ dài"
                    desc="Sau 4 phiên"
                    value={timerSettings.long}
                    onDecrease={() =>
                      updatePomodoroSetting(
                        "long",
                        Math.max(5, timerSettings.long - 5),
                      )
                    }
                    onIncrease={() =>
                      updatePomodoroSetting(
                        "long",
                        Math.min(30, timerSettings.long + 5),
                      )
                    }
                  />
                  <SettingRow
                    label="Âm thanh thông báo"
                    desc="Phát âm báo khi kết thúc phiên học"
                    action={
                      <ToggleSwitch
                        checked={timerSettings.sound}
                        onChange={(nextValue) =>
                          updatePomodoroSetting("sound", nextValue)
                        }
                        label="Âm thanh thông báo"
                      />
                    }
                  />
                </div>
              </section>

              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>
                    <SectionTitle icon="bell" label="Thông báo" />
                  </div>
                </div>
                <div className={cx("settings-list")}>
                  <SettingRow
                    label="Nhắc nhở học tập"
                    desc="Gửi thông báo vào giờ học"
                    action={
                      <ToggleSwitch
                        checked={settings.notif.study}
                        onChange={(nextValue) =>
                          updateNotificationSetting("study", nextValue)
                        }
                        label="Nhắc nhở học tập"
                      />
                    }
                  />
                  <SettingRow
                    label="Nhắc bài tập sắp đến hạn"
                    desc="Báo trước 1 ngày"
                    action={
                      <ToggleSwitch
                        checked={settings.notif.task}
                        onChange={(nextValue) =>
                          updateNotificationSetting("task", nextValue)
                        }
                        label="Nhắc bài tập sắp đến hạn"
                      />
                    }
                  />
                  <SettingRow
                    label="Chuỗi học hằng ngày"
                    desc="Nhắc duy trì chuỗi lúc 20:00"
                    action={
                      <ToggleSwitch
                        checked={settings.notif.streak}
                        onChange={(nextValue) =>
                          updateNotificationSetting("streak", nextValue)
                        }
                        label="Chuỗi học hằng ngày"
                      />
                    }
                  />
                </div>
              </section>

              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>
                    <SectionTitle icon="download" label="Quản lý dữ liệu" />
                  </div>
                </div>
                <div className={cx("data-actions")}>
                  <DataRow
                    title="Xuất dữ liệu học tập"
                    desc="Tải xuống toàn bộ tiến độ hiện tại"
                    action={
                      <button
                        type="button"
                        className={cx("button", "button--secondary")}
                        onClick={exportData}
                      >
                        <AppIcon name="download" size="sm" />
                        Xuất JSON
                      </button>
                    }
                  />
                  <DataRow
                    title="Đặt lại tiến độ"
                    desc="Xóa toàn bộ dữ liệu học tập trên Firebase"
                    action={
                      <button
                        type="button"
                        className={cx("button", "button--danger")}
                        onClick={resetAllData}
                      >
                        <AppIcon name="trash" size="sm" />
                        Đặt lại
                      </button>
                    }
                  />
                  <DataRow
                    title="Phiên bản ứng dụng"
                    desc="LearnFlow Firebase Edition • Bản dựng 2026"
                    action={
                      <span className={cx("badge", "badge--done")}>
                        Production
                      </span>
                    }
                  />
                </div>
              </section>
              {["admin", "superadmin"].includes(profile?.role) && (
                <section className={cx("card")}>
                  <div className={cx("card__header")}>
                    <div className={cx("card__title")}>
                      <SectionTitle icon="target" label="Quản trị hệ thống" />
                    </div>
                  </div>
                  <div className={cx("settings-list")}>
                    <div className={cx("data-row")}>
                      <div className={cx("data-row__content")}>
                        <div className={cx("data-row__title")}>
                          Truy cập Admin Dashboard
                        </div>
                        <div className={cx("data-row__desc")}>
                          Quản lý khóa học, bài tập, và người dùng.
                        </div>
                      </div>
                      <button
                        type="button"
                        className={cx("button", "button--primary")}
                        onClick={() => setCurrentPage("admin")}
                      >
                        Truy cập
                      </button>
                    </div>
                  </div>
                </section>
              )}
              <section className={cx("card")}>
                <div className={cx("card__header")}>
                  <div className={cx("card__title")}>
                    <SectionTitle icon="trash" label="Xóa tài khoản" />
                  </div>
                </div>
                <div className={cx("settings-list")}>
                  <div className={cx("data-row")}>
                    <div className={cx("data-row__content")}>
                      <div className={cx("data-row__title")}>
                        Gỡ toàn bộ tài khoản và dữ liệu của bạn
                      </div>
                      <div className={cx("data-row__desc")}>
                        Hành động này không thể hoàn tác. Toàn bộ dữ liệu user
                        trong Firebase sẽ bị xóa.
                      </div>
                    </div>
                    <button
                      type="button"
                      className={cx("button", "button--danger")}
                      onClick={handleDeleteAccount}
                      disabled={accountDeletePending}
                    >
                      <AppIcon name="trash" size="sm" />
                      {accountDeletePending ? "Đang xóa..." : "Xóa tài khoản"}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {currentPage === "profile" ? (
            <div className={cx("page-profile")}>
              <UserProfileCard
                uid={currentUser?.uid}
                currentUid={currentUser?.uid}
                darkMode={preferences.darkMode}
              />
              <ActivityFeed uid={currentUser?.uid} darkMode={preferences.darkMode} />
            </div>
          ) : null}

          {currentPage === "notification-settings" ? (
            <div className={cx("page-notifications")}>
              <NotificationPreferences
                uid={currentUser?.uid}
                darkMode={preferences.darkMode}
              />
            </div>
          ) : null}
        </div>
      </main>

      {mobileNavOpen ? (
        <div
          className={cx("mobile-nav-backdrop")}
          onClick={() => setMobileNavOpen(false)}
          role="presentation"
        >
          <aside
            className={cx("mobile-nav-drawer")}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {renderSidebar(true)}
          </aside>
        </div>
      ) : null}

      {courseDetail ? (
        <CourseDetailDrawer
          course={courseDetail}
          courseProgress={courseProgress}
          isTracked={isCurrentCourseTracked}
          onClose={() => setCourseDetailId(null)}
          onContinueLesson={continueLesson}
          onMarkLesson={markLesson}
          onTrackCourse={handleTrackCourse}
          onUntrackCourse={handleUntrackCourse}
        />
      ) : null}

      {false ? (
        <div
          className={cx("drawer-backdrop")}
          onClick={() => setCourseDetailId(null)}
          role="presentation"
        >
          <div
            className={cx("drawer")}
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <div
              className={cx("drawer__banner")}
              style={{ background: courseDetail.color }}
            >
              {courseDetail.emoji}
              <button
                type="button"
                className={cx("drawer__close")}
                onClick={() => setCourseDetailId(null)}
                aria-label="Đóng chi tiết khóa học"
              >
                <AppIcon name="close" size="sm" />
              </button>
            </div>
            <div className={cx("drawer__body")}>
              <div className={cx("drawer__title")}>{courseDetail.name}</div>
              <div
                className={cx("drawer__meta")}
              >{`${courseDetail.teacher} • ${courseDetail.category} • ${courseDetail.totalLessons} bài học`}</div>
              <div className={cx("button-row")}>
                {isCurrentCourseTracked ? (
                  <button
                    type="button"
                    className={cx("button", "button--ghost")}
                    onClick={() => handleUntrackCourse(courseDetail)}
                  >
                    Bỏ theo dõi
                  </button>
                ) : (
                  <button
                    type="button"
                    className={cx("button", "button--primary")}
                    onClick={() => handleTrackCourse(courseDetail)}
                  >
                    Theo dõi khóa học
                  </button>
                )}
              </div>
              {(() => {
                const progress = getCourseProgress(
                  courseDetail,
                  courseProgress,
                );
                const progressMap = courseProgress[courseDetail.id] || {};
                const firstUndoneIndex = courseDetail.lessons.findIndex(
                  (_, index) => !progressMap[index],
                );
                return (
                  <>
                    <div className={cx("drawer__progress")}>
                      <div className={cx("drawer__progress-header")}>
                        <span>Tiến độ</span>
                        <span
                          style={{ color: courseDetail.fill }}
                        >{`${progress.pct}%`}</span>
                      </div>
                      <div className={cx("progress-bar")}>
                        <div
                          className={cx("progress-bar__fill")}
                          style={{
                            width: `${progress.pct}%`,
                            background: courseDetail.fill,
                          }}
                        />
                      </div>
                      <div
                        className={cx("drawer__progress-sub")}
                      >{`${progress.done} / ${progress.total} bài đã hoàn thành • Còn ${progress.total - progress.done} bài`}</div>
                    </div>
                    <div className={cx("lesson-list")}>
                      {!isCurrentCourseTracked ? (
                        <div className={cx("placeholder-box")}>
                          Theo dõi khóa học trước để bắt đầu lưu tiến độ.
                        </div>
                      ) : null}
                      {courseDetail.lessons
                        .slice(0, 30)
                        .map((lesson, index) => {
                          const isDone = Boolean(progressMap[index]);
                          const isActive = index === firstUndoneIndex;
                          return (
                            <button
                              type="button"
                              key={`${courseDetail.id}-${lesson.name}-${index}`}
                              className={cx(
                                "lesson-row",
                                isDone ? "lesson-row--done" : "",
                                isActive ? "lesson-row--active" : "",
                              )}
                              onClick={() => markLesson(courseDetail.id, index)}
                            >
                              <div
                                className={cx(
                                  "lesson-row__number",
                                  isDone
                                    ? "lesson-row__number--done"
                                    : isActive
                                      ? "lesson-row__number--active"
                                      : "",
                                )}
                              >
                                {index + 1}
                              </div>
                              <div className={cx("lesson-row__content")}>
                                <div className={cx("lesson-row__name")}>
                                  {lesson.name}
                                </div>
                                <div
                                  className={cx("lesson-row__meta")}
                                >{`⏱ ${lesson.dur}`}</div>
                              </div>
                              <div className={cx("lesson-row__status")}>
                                {isDone ? (
                                  "✓"
                                ) : isActive ? (
                                  <AppIcon name="play" size="sm" />
                                ) : (
                                  "○"
                                )}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                    <div className={cx("button-row")}>
                      <button
                        type="button"
                        className={cx("button", "button--primary")}
                        onClick={continueLesson}
                      >
                        {!isCurrentCourseTracked ? (
                          "Theo dõi để bắt đầu"
                        ) : firstUndoneIndex >= 0 ? (
                          <>
                            <AppIcon name="play" size="sm" />
                            {`Tiếp tục: ${courseDetail.lessons[firstUndoneIndex].name.slice(0, 24)}...`}
                          </>
                        ) : (
                          "🏆 Đã hoàn thành"
                        )}
                      </button>
                      <button
                        type="button"
                        className={cx("button", "button--ghost")}
                        onClick={() => setCourseDetailId(null)}
                      >
                        Đóng
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      ) : null}

      {modal ? (
        <div
          className={cx("modal-backdrop")}
          onClick={() => setModal(null)}
          role="presentation"
        >
          <div
            className={cx("modal")}
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            {modal === "add-course" ? (
              <>
                <h2 className={cx("modal__title")}>
                  <SectionTitle icon="book" label="Thêm khóa học mới" />
                </h2>
                <p className={cx("modal__sub")}>
                  Điền thông tin khóa học bạn muốn theo dõi
                </p>
                <FormField label="Tên khóa học">
                  <input
                    value={forms.course.name}
                    onChange={(event) =>
                      updateForm("course", "name", event.target.value)
                    }
                    placeholder="VD: JavaScript ES2025"
                  />
                </FormField>
                <FormField label="Giảng viên">
                  <input
                    value={forms.course.teacher}
                    onChange={(event) =>
                      updateForm("course", "teacher", event.target.value)
                    }
                    placeholder="VD: Nguyễn Văn A"
                  />
                </FormField>
                <FormField label="Tổng số bài học">
                  <input
                    type="number"
                    value={forms.course.total}
                    onChange={(event) =>
                      updateForm("course", "total", event.target.value)
                    }
                    placeholder="VD: 40"
                    min="1"
                  />
                </FormField>
                <FormField label="Danh mục">
                  <select
                    value={forms.course.category}
                    onChange={(event) =>
                      updateForm("course", "category", event.target.value)
                    }
                  >
                    <option>Frontend</option>
                    <option>Backend</option>
                    <option>Khoa học dữ liệu</option>
                    <option>Thiết kế</option>
                    <option>DevOps</option>
                    <option>Khác</option>
                  </select>
                </FormField>
                <ModalActions
                  onCancel={() => setModal(null)}
                  onSubmit={addCourse}
                  submitLabel="Thêm khóa học"
                />
              </>
            ) : null}

            {modal === "add-task" ? (
              <>
                <h2 className={cx("modal__title")}>
                  <SectionTitle icon="task" label="Thêm bài tập mới" />
                </h2>
                <p className={cx("modal__sub")}>
                  Thêm nhiệm vụ học tập cần hoàn thành
                </p>
                <FormField label="Tên bài tập">
                  <input
                    value={forms.task.name}
                    onChange={(event) =>
                      updateForm("task", "name", event.target.value)
                    }
                    placeholder="VD: Làm bài tập React..."
                  />
                </FormField>
                <FormField label="Khóa học liên quan">
                  <select
                    value={forms.task.course}
                    onChange={(event) =>
                      updateForm("task", "course", event.target.value)
                    }
                  >
                    {courseNameOptions.map((courseName) => (
                      <option key={courseName}>{courseName}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Hạn nộp">
                  <input
                    type="date"
                    value={forms.task.date}
                    onChange={(event) =>
                      updateForm("task", "date", event.target.value)
                    }
                  />
                </FormField>
                <FormField label="Mức độ ưu tiên">
                  <select
                    value={forms.task.priority}
                    onChange={(event) =>
                      updateForm("task", "priority", event.target.value)
                    }
                  >
                    <option value="urgent">🔴 Gấp</option>
                    <option value="normal">🟡 Bình thường</option>
                    <option value="low">🟢 Thấp</option>
                  </select>
                </FormField>
                <FormField label="Ghi chú">
                  <textarea
                    value={forms.task.note}
                    onChange={(event) =>
                      updateForm("task", "note", event.target.value)
                    }
                    placeholder="Ghi chú thêm..."
                  />
                </FormField>
                <ModalActions
                  onCancel={() => setModal(null)}
                  onSubmit={addTask}
                  submitLabel="Thêm bài tập"
                />
              </>
            ) : null}

            {modal === "add-schedule" ? (
              <>
                <h2 className={cx("modal__title")}>
                  <SectionTitle icon="timer" label="Thêm lịch học" />
                </h2>
                <p className={cx("modal__sub")}>
                  Lên lịch cho buổi học sắp tới
                </p>
                <FormField label="Tên buổi học">
                  <input
                    value={forms.schedule.name}
                    onChange={(event) =>
                      updateForm("schedule", "name", event.target.value)
                    }
                    placeholder="VD: Học React Hooks..."
                  />
                </FormField>
                <FormField label="Thời gian bắt đầu">
                  <input
                    type="time"
                    value={forms.schedule.time}
                    onChange={(event) =>
                      updateForm("schedule", "time", event.target.value)
                    }
                  />
                </FormField>
                <FormField label="Thời lượng (phút)">
                  <input
                    type="number"
                    min="5"
                    value={forms.schedule.dur}
                    onChange={(event) =>
                      updateForm("schedule", "dur", event.target.value)
                    }
                    placeholder="45"
                  />
                </FormField>
                <FormField label="Màu sắc">
                  <select
                    value={forms.schedule.color}
                    onChange={(event) =>
                      updateForm("schedule", "color", event.target.value)
                    }
                  >
                    <option value="var(--indigo)">🟣 Tím</option>
                    <option value="var(--teal)">🟢 Xanh lá</option>
                    <option value="var(--amber)">🟡 Vàng</option>
                    <option value="var(--sky)">🔵 Xanh dương</option>
                    <option value="var(--rose)">🔴 Đỏ</option>
                  </select>
                </FormField>
                <ModalActions
                  onCancel={() => setModal(null)}
                  onSubmit={addSchedule}
                  submitLabel="Thêm lịch"
                />
              </>
            ) : null}

            {modal === "notifications" ? (
              <>
                <h2 className={cx("modal__title")}>
                  <SectionTitle icon="bell" label="Thông báo" />
                </h2>
                <p className={cx("modal__sub")}>
                  Cập nhật mới nhất dành cho bạn
                </p>
                <div className={cx("notification-list")}>
                  <div
                    className={cx(
                      "notification-card",
                      "notification-card--indigo",
                    )}
                  >
                    <div className={cx("notification-card__icon")}>
                      <AppIcon name="spark" />
                    </div>
                    <div>
                      <div
                        className={cx("notification-card__title")}
                      >{`Chuỗi ${streak} ngày! Rất tốt!`}</div>
                      <div className={cx("notification-card__text")}>
                        Hãy duy trì chuỗi học mỗi ngày.
                      </div>
                    </div>
                  </div>
                  <div
                    className={cx(
                      "notification-card",
                      "notification-card--teal",
                    )}
                  >
                    <div className={cx("notification-card__icon")}>
                      <AppIcon name="book" />
                    </div>
                    <div>
                      <div className={cx("notification-card__title")}>
                        Dữ liệu học tập đang realtime
                      </div>
                      <div className={cx("notification-card__text")}>
                        Tasks, notes, leaderboard và Pomodoro đã được đồng bộ
                        Firebase.
                      </div>
                    </div>
                  </div>
                  <div
                    className={cx(
                      "notification-card",
                      "notification-card--rose",
                    )}
                  >
                    <div className={cx("notification-card__icon")}>
                      <AppIcon name="pending" />
                    </div>
                    <div>
                      <div className={cx("notification-card__title")}>
                        Bài tập sắp đến hạn
                      </div>
                      <div className={cx("notification-card__text")}>
                        {nextTaskDeadline
                          ? `"${nextTaskDeadline.name}" • Hạn: ${formatDateVi(nextTaskDeadline.date)}`
                          : "Hãy kiểm tra danh sách bài tập của bạn."}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={cx("modal__actions", "notification-actions")}>
                  <button
                    type="button"
                    className={cx("button", "button--primary")}
                    onClick={() => setModal(null)}
                  >
                    Đã đọc tất cả
                  </button>
                </div>
              </>
            ) : null}

            {modal === "auth" ? (
              <>
                {authView === "login" ? (
                  <>
                    <h2 className={cx("modal__title")}>Chào mừng quay lại</h2>
                    <p className={cx("modal__sub")}>
                      Đăng nhập vào tài khoản LearnFlow của bạn
                    </p>
                    {authError.login ? (
                      <div className={cx("auth-error")}>{authError.login}</div>
                    ) : null}
                    <FormField label="Email">
                      <input
                        type="email"
                        value={authForm.loginEmail}
                        disabled={authPending}
                        onChange={(event) =>
                          setAuthForm((previous) => ({
                            ...previous,
                            loginEmail: event.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Mật khẩu">
                      <input
                        type="password"
                        value={authForm.loginPw}
                        disabled={authPending}
                        onChange={(event) =>
                          setAuthForm((previous) => ({
                            ...previous,
                            loginPw: event.target.value,
                          }))
                        }
                        onKeyDown={(event) =>
                          event.key === "Enter" && handleLogin()
                        }
                      />
                    </FormField>
                    <div className={cx("modal__actions")}>
                      <button
                        type="button"
                        className={cx("button", "button--primary")}
                        onClick={handleLogin}
                        disabled={authPending}
                      >
                        {authPending ? "Đang đăng nhập..." : "Đăng nhập"}
                      </button>
                      <button
                        type="button"
                        className={cx("button", "button--ghost")}
                        onClick={() => setAuthView("signup")}
                        disabled={authPending}
                      >
                        Đăng ký ngay
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className={cx("modal__title")}>Tạo tài khoản mới</h2>
                    <p className={cx("modal__sub")}>
                      Bắt đầu hành trình học tập của bạn
                    </p>
                    {authError.signup ? (
                      <div className={cx("auth-error")}>{authError.signup}</div>
                    ) : null}
                    <FormField label="Họ và tên">
                      <input
                        value={authForm.signupName}
                        disabled={authPending}
                        onChange={(event) =>
                          setAuthForm((previous) => ({
                            ...previous,
                            signupName: event.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Email">
                      <input
                        type="email"
                        value={authForm.signupEmail}
                        disabled={authPending}
                        onChange={(event) =>
                          setAuthForm((previous) => ({
                            ...previous,
                            signupEmail: event.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Mật khẩu">
                      <input
                        type="password"
                        value={authForm.signupPw}
                        disabled={authPending}
                        onChange={(event) =>
                          setAuthForm((previous) => ({
                            ...previous,
                            signupPw: event.target.value,
                          }))
                        }
                        onKeyDown={(event) =>
                          event.key === "Enter" && handleSignup()
                        }
                      />
                    </FormField>
                    <div className={cx("modal__actions")}>
                      <button
                        type="button"
                        className={cx("button", "button--primary")}
                        onClick={handleSignup}
                        disabled={authPending}
                      >
                        {authPending
                          ? "Đang tạo tài khoản..."
                          : "Tạo tài khoản"}
                      </button>
                      <button
                        type="button"
                        className={cx("button", "button--ghost")}
                        onClick={() => setAuthView("login")}
                        disabled={authPending}
                      >
                        Đăng nhập
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : null}

            {modal === "ai-hint" && aiHint ? (
              <>
                <h2 className={cx("modal__title")}>{aiHint.title}</h2>
                <p className={cx("modal__sub")}>{aiHint.subtitle}</p>
                <div className={cx("analysis-box")}>{aiHint.body}</div>
                <div className={cx("modal__actions")}>
                  <button
                    type="button"
                    className={cx("button", "button--primary")}
                    onClick={() => setModal(null)}
                  >
                    Đóng
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {challenge.open ? (
        <div
          className={cx("modal-backdrop")}
          onClick={() =>
            setChallenge((previous) => ({ ...previous, open: false }))
          }
          role="presentation"
        >
          <div
            className={cx("modal")}
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <h2 className={cx("modal__title")}>
              <SectionTitle icon="timer" label="Thử thách thời gian" />
            </h2>
            <p className={cx("modal__sub")}>
              Chọn giới hạn thời gian để tự thử thách bản thân giải bài nhanh
              hơn
            </p>
            <div className={cx("preset-grid")}>
              {[5, 10, 15, 20, 30, 45].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={cx(
                    "preset-card",
                    challenge.selectedMin === value
                      ? "preset-card--active"
                      : "",
                  )}
                  onClick={() =>
                    setChallenge((previous) => ({
                      ...previous,
                      selectedMin: value,
                      customMin: "",
                    }))
                  }
                >
                  <strong>{`${value}:00`}</strong>
                  <span>
                    {value === 5
                      ? "Nhanh"
                      : value === 10
                        ? "Vừa"
                        : value === 15
                          ? "Bình thường"
                          : value === 20
                            ? "Thoải mái"
                            : value === 30
                              ? "Khó"
                              : "Dài hơn"}
                  </span>
                </button>
              ))}
            </div>
            <FormField label="Tùy chỉnh (phút)">
              <input
                type="number"
                min="1"
                max="120"
                value={challenge.customMin}
                onChange={(event) =>
                  setChallenge((previous) => ({
                    ...previous,
                    customMin: event.target.value,
                  }))
                }
                placeholder="..."
              />
            </FormField>
            <ModalActions
              onCancel={() =>
                setChallenge((previous) => ({ ...previous, open: false }))
              }
              onSubmit={startChallengeTimer}
              submitLabel="Bắt đầu"
            />
          </div>
        </div>
      ) : null}

      {challenge.finished ? (
        <div
          className={cx("modal-backdrop")}
          onClick={() =>
            setChallenge((previous) => ({ ...previous, finished: false }))
          }
          role="presentation"
        >
          <div
            className={cx("finished-box")}
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <div className={cx("finished-box__emoji")}>⏰</div>
            <div className={cx("finished-box__title")}>Hết giờ thử thách</div>
            <div
              className={cx("finished-box__message")}
            >{`Bạn đã dùng hết ${Math.round(challenge.totalSec / 60)} phút. Hãy nhìn lại và cải thiện ở lần tiếp theo.`}</div>
            <button
              type="button"
              className={cx("button", "button--primary")}
              onClick={() =>
                setChallenge((previous) => ({ ...previous, finished: false }))
              }
            >
              Tiếp tục
            </button>
          </div>
        </div>
      ) : null}

      <div className={cx("toast", toast.open ? "toast--show" : "")}>
        <span>{toast.icon}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

function FormField({ children, label }) {
  return (
    <label className={cx("form-field")}>
      <span className={cx("form-field__label")}>{label}</span>
      {children}
    </label>
  );
}

function ModalActions({ onCancel, onSubmit, submitLabel }) {
  return (
    <div className={cx("modal__actions")}>
      <button
        type="button"
        className={cx("button", "button--ghost")}
        onClick={onCancel}
      >
        Hủy
      </button>
      <button
        type="button"
        className={cx("button", "button--primary")}
        onClick={onSubmit}
      >
        {submitLabel}
      </button>
    </div>
  );
}

function ToggleSwitch({ checked, label, onChange }) {
  return (
    <button
      type="button"
      className={cx("toggle-switch", checked ? "toggle-switch--active" : "")}
      onClick={() => onChange(!checked)}
      aria-label={label}
      aria-pressed={checked}
    >
      <span className={cx("toggle-switch__track")}>
        <span className={cx("toggle-switch__thumb")} />
      </span>
      <span className={cx("toggle-switch__text")}>
        {checked ? "Bật" : "Tắt"}
      </span>
    </button>
  );
}

function SegmentedControl({ onChange, options, value }) {
  return (
    <div
      className={cx("segmented-control")}
      role="tablist"
      aria-label="Tùy chọn cỡ chữ"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={cx(
            "segmented-control__item",
            value === option.value ? "segmented-control__item--active" : "",
          )}
          onClick={() => onChange(option.value)}
        >
          <span>{option.label}</span>
          <small>{option.desc}</small>
        </button>
      ))}
    </div>
  );
}

function SettingRow({ action, desc, label }) {
  return (
    <div className={cx("setting-row")}>
      <div>
        <div className={cx("setting-row__title")}>{label}</div>
        <div className={cx("setting-row__desc")}>{desc}</div>
      </div>
      <div>{action}</div>
    </div>
  );
}

function PomodoroRow({ desc, label, onDecrease, onIncrease, value }) {
  return (
    <div className={cx("setting-row")}>
      <div>
        <div className={cx("setting-row__title")}>{label}</div>
        <div className={cx("setting-row__desc")}>{desc}</div>
      </div>
      <div className={cx("stepper")}>
        <button type="button" onClick={onDecrease}>
          -
        </button>
        <span>{value}</span>
        <button type="button" onClick={onIncrease}>
          +
        </button>
      </div>
    </div>
  );
}

function DataRow({ action, desc, title }) {
  return (
    <div className={cx("data-row")}>
      <div>
        <div className={cx("data-row__title")}>{title}</div>
        <div className={cx("data-row__desc")}>{desc}</div>
      </div>
      <div>{action}</div>
    </div>
  );
}

function SectionTitle({ icon, label }) {
  return (
    <span className={cx("title-with-icon")}>
      <AppIcon name={icon} size="sm" />
      <span>{label}</span>
    </span>
  );
}

function StatCard({
  color,
  icon,
  emoji,
  label,
  number,
  progress,
  tone = "indigo",
  trend,
}) {
  const iconName = icon || emoji;

  return (
    <section className={cx("stat-card")}>
      <div className={cx("stat-card__header")}>
        <div className={cx("stat-card__icon", `stat-card__icon--${tone}`)}>
          <AppIcon name={iconName} size="lg" />
        </div>
        <div className={cx("trend-pill")}>{trend}</div>
      </div>
      <div className={cx("stat-card__number")}>{number}</div>
      <div className={cx("stat-card__label")}>{label}</div>
      <div className={cx("progress-bar")}>
        <div
          className={cx("progress-bar__fill")}
          style={{ width: `${progress}%`, background: color }}
        />
      </div>
    </section>
  );
}

function ProblemStat({ label, muted = false, value }) {
  return (
    <div className={cx("problem-stat", muted ? "problem-stat--muted" : "")}>
      <div className={cx("problem-stat__value")}>{value}</div>
      <div className={cx("problem-stat__label")}>{label}</div>
    </div>
  );
}

function MiniStat({ label, tone, value }) {
  return (
    <div className={cx("mini-stat", `mini-stat--${tone}`)}>
      <div className={cx("mini-stat__value")}>{value}</div>
      <div className={cx("mini-stat__label")}>{label}</div>
    </div>
  );
}

export default App;