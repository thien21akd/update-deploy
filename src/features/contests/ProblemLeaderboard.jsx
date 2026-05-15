import { useEffect, useState } from "react";
import { fetchProblemLeaderboard } from "../../services/problemLeaderboardService";
import { bindModule } from "../../utils/bem";
import styles from "./ProblemLeaderboard.module.scss";

const cx = bindModule(styles);

const PERIODS = [
  { value: "alltime", label: "All-time" },
  { value: "month", label: "This month" },
  { value: "week", label: "This week" },
];

const MEDAL_ICONS = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

/**
 * ProblemLeaderboard - Displays top 10 users by unique solved problems
 * Viewable without login
 */
export default function ProblemLeaderboard() {
  const [period, setPeriod] = useState("alltime");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch leaderboard when period changes
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchProblemLeaderboard(period);
        setLeaderboard(data);
      } catch (err) {
        setError("Failed to load leaderboard");
        console.error(err);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [period]);

  return (
    <div className={cx("problem-leaderboard")}>
      <div className={cx("problem-leaderboard__header")}>
        <h2 className={cx("problem-leaderboard__title")}>
          🏆 Problem Leaderboard
        </h2>
        <p className={cx("problem-leaderboard__subtitle")}>
          Top 10 users ranked by unique solved problems
        </p>
      </div>

      {/* Filter Tabs */}
      <div className={cx("problem-leaderboard__filters")}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            className={
              period === p.value
                ? cx(
                    "problem-leaderboard__filter-btn",
                    "problem-leaderboard__filter-btn--active",
                  )
                : cx("problem-leaderboard__filter-btn")
            }
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className={cx("problem-leaderboard__loading")}>
          Loading leaderboard...
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className={cx("problem-leaderboard__error")}>{error}</div>
      )}

      {/* Leaderboard Table */}
      {!loading && leaderboard.length > 0 && (
        <div className={cx("problem-leaderboard__table-container")}>
          <table className={cx("problem-leaderboard__table")}>
            <thead>
              <tr className={cx("problem-leaderboard__header-row")}>
                <th
                  className={cx(
                    "problem-leaderboard__col",
                    "problem-leaderboard__col--rank",
                  )}
                >
                  Rank
                </th>
                <th
                  className={cx(
                    "problem-leaderboard__col",
                    "problem-leaderboard__col--username",
                  )}
                >
                  Username
                </th>
                <th
                  className={cx(
                    "problem-leaderboard__col",
                    "problem-leaderboard__col--count",
                  )}
                >
                  Solved Count
                </th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user) => {
                const isMedal = user.rank <= 3;
                const medalIcon = MEDAL_ICONS[user.rank];
                const rowClasses = [cx("problem-leaderboard__row")];

                if (isMedal) {
                  rowClasses.push(
                    cx("problem-leaderboard__row--medal"),
                    cx(`problem-leaderboard__row--rank${user.rank}`),
                  );
                }

                return (
                  <tr key={user.uid} className={rowClasses.join(" ")}>
                    <td
                      className={cx(
                        "problem-leaderboard__col",
                        "problem-leaderboard__col--rank",
                      )}
                    >
                      {isMedal ? (
                        <span className={cx("problem-leaderboard__medal")}>
                          {medalIcon} {user.rank}
                        </span>
                      ) : (
                        <span className={cx("problem-leaderboard__rank-num")}>
                          {user.rank}
                        </span>
                      )}
                    </td>
                    <td
                      className={cx(
                        "problem-leaderboard__col",
                        "problem-leaderboard__col--username",
                      )}
                    >
                      <span className={cx("problem-leaderboard__username")}>
                        {user.username}
                      </span>
                    </td>
                    <td
                      className={cx(
                        "problem-leaderboard__col",
                        "problem-leaderboard__col--count",
                      )}
                    >
                      <span className={cx("problem-leaderboard__count")}>
                        {user.count}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && leaderboard.length === 0 && !error && (
        <div className={cx("problem-leaderboard__empty")}>
          <p>No data available for this period</p>
        </div>
      )}
    </div>
  );
}
