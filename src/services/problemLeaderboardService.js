import { readValue } from "./databaseService";

/**
 * Fetch problem leaderboard from precomputed leaderboard node
 * Data is computed and maintained by Firebase Cloud Function
 * @param {'week' | 'month' | 'alltime'} period
 * @returns {Promise<Array>} Array of top 10 users
 */
export async function fetchProblemLeaderboard(period = "alltime") {
  try {
    // Map period to field name in leaderboard node
    const solvedField = `solved_${period}`;
    const timestampField = `last_ac_${period}`;

    const leaderboardData = await readValue("leaderboard");

    // DEBUG Ở ĐÂY:
    console.log("--- DEBUG LEADERBOARD ---");
    console.log("Period:", period);
    console.log("Field looking for:", solvedField);
    console.log("Raw data from DB:", leaderboardData);

    if (!leaderboardData || typeof leaderboardData !== "object") {
      return [];
    }

    const leaderboardEntries = [];

    // Process each user from leaderboard node
    Object.entries(leaderboardData).forEach(([uid, userEntry]) => {
      if (!userEntry || typeof userEntry !== "object") return;

      const count = userEntry.score || 0;
      const latestAcTimestamp = userEntry[timestampField] || 0;

      if (count > 0) {
        leaderboardEntries.push({
          uid,
          username: userEntry.name || "Người dùng LearnFlow",
          count,
          latestAcTimestamp,
        });
      }
    });

    // Sort by count (desc) then by latestAcTimestamp (desc) then by username (asc)
    leaderboardEntries.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (b.latestAcTimestamp !== a.latestAcTimestamp) {
        return b.latestAcTimestamp - a.latestAcTimestamp;
      }
      return (a.username || "").localeCompare(b.username || "");
    });

    // Return top 10 with ranks
    return leaderboardEntries.slice(0, 10).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  } catch (error) {
    console.error("Error fetching problem leaderboard:", error);
    return [];
  }
}

/**
 * Real-time subscription to problem leaderboard
 * @param {Function} callback - Called with leaderboard data
 * @param {Function} errorCallback - Called on error
 * @param {'week' | 'month' | 'alltime'} period
 * @returns {Function} Unsubscribe function
 */
export function subscribeToProblemLeaderboard(
  callback,
  errorCallback,
  period = "alltime",
) {
  // Note: This uses readValue for simplicity. In production, consider using
  // onValue for real-time updates, but that requires polling or using a cloud function.
  let isSubscribed = true;

  const fetchData = async () => {
    try {
      const data = await fetchProblemLeaderboard(period);
      if (isSubscribed) {
        callback(data);
      }
    } catch (error) {
      if (isSubscribed) {
        errorCallback?.(error);
      }
    }
  };

  // Fetch immediately
  fetchData();

  // Set up polling (every 10 seconds)
  const pollInterval = setInterval(fetchData, 10000);

  // Return unsubscribe function
  return () => {
    isSubscribed = false;
    clearInterval(pollInterval);
  };
}
