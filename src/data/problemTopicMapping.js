/**
 * Mapping between problem IDs and ML training topics
 * Multi-label classification dataset for problem tagging system
 *
 * IMPORTANT: Problems can have MULTIPLE topics
 * Each problem's topics should match the training dataset topics exactly
 */

export const PROBLEM_TOPIC_MAP = {
  // Easy problems
  '1': ['array', 'hashing', 'two pointers'],
  '3': ['sliding windows', 'hashing'],
  '6': ['string', 'simulation'],
  '8': ['simulation', 'string'],
  '11': ['two pointers', 'greedy', 'array'],
  '12': ['string', 'hashing', 'greedy'],
  '13': ['string', 'greedy'],
  '14': ['string'],
  '15': ['sorting', 'two pointers'],
  '16': ['backtracking', 'dfs', 'string'],
  '17': ['string', 'stack'],
  '32': ['greedy', 'Boyer Moore', 'array'],
  '39': ['prefix sum', 'suffix decomposition'],

  // Medium problems - Binary Search
  '4': ['binary search partition'],
  '5': ['two pointers', 'palindrome', 'string'],
  '10': ['dp', 'string'],
  '21': ['binary search', 'array'],
  '22': ['binary search', 'array'],
  '23': ['dp'],
  '33': ['dp', 'array'],

  // Medium problems - Trees & Graphs
  '24': ['binary tree', 'dfs'],
  '25': ['binary tree', 'dfs', 'bfs'],
  '26': ['binary tree', 'dfs', 'bfs'],
  '35': ['topo', 'dfs', 'bfs'],
  '38': ['dfs', 'bfs', 'dsu'],

  // Data Structures
  '2': ['data structures', 'linked list'],
  '18': ['linked list', 'array'],
  '20': ['heap', 'data structures'],
  '29': ['array', 'linked list', 'two pointers'],
  '30': ['stack', 'design'],
  '31': ['linked list', 'two pointers', 'array'],
  '34': ['linked list', 'array'],
  '36': ['trie'],
  '37': ['data structures', 'heap'],
  '40': ['data structures', 'heap'],

  // Math & Bit operations
  '7': ['math', 'simulation'],
  '9': ['math', 'palindrome'],
  '19': ['backtracking', 'dfs', 'string'],
  '27': ['greedy', 'array'],
  '28': ['bit manipulation', 'array'],
};

/**
 * Full topic space (ML label space)
 * MUST match exactly with PATTERNS in train_rf_from_csv.py
 */
export const TOPICS_ML = [
  'array',
  'bfs',
  'simulation',
  'dfs',
  'hashing',
  'divide and conquer',
  'string',
  'sliding windows',
  'linked list',
  'binary tree',
  'memoization',
  'two pointers',
  'heap',
  'palindrome',
  'stack',
  'backtracking',
  'quickselect',
  'dp',
  'suffix decomposition',
  'sorting',
  'topo',
  'greedy',
  'bit manipulation',
  'design',
  'Boyer Moore',
  'prefix sum',
  'math',
  'trie',
  'binary search',
  'binary search on answer',
  'binary search partition',
  'dsu',
  'recursion',
  'data structures',
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get topic list for a problem by ID
 * @param {number | string} problemId - Problem ID
 * @returns {Array<string>} List of topics for this problem
 */
export function getProblemTopic(problemId) {
  const key = String(problemId);
  const topics = PROBLEM_TOPIC_MAP[key];
  
  if (!topics) {
    console.warn(`Problem ${problemId} not found in mapping`);
    return [];
  }
  
  // Ensure lowercase and trimmed
  return topics.map(t => String(t).toLowerCase().trim());
}

/**
 * Get all problems in a specific topic
 * Handles multi-label: problems can have multiple topics
 * @param {string} topic - Topic name
 * @returns {Array<number>} List of problem IDs with this topic
 */
export function getProblemsInTopic(topic) {
  const targetTopic = String(topic).toLowerCase().trim();
  
  return Object.entries(PROBLEM_TOPIC_MAP)
    .filter(([_, tags]) => {
      // Case-insensitive matching
      return tags.some(t => String(t).toLowerCase().trim() === targetTopic);
    })
    .map(([id]) => Number(id))
    .sort((a, b) => a - b);
}

/**
 * Get topic distribution for a set of problems
 * Counts how many problems in each topic
 * @param {Array<number>} problemIds - List of problem IDs
 * @returns {Object} Distribution: {topic: count}
 */
export function getTopicDistribution(problemIds) {
  const distribution = {};

  // Initialize all topics with 0
  TOPICS_ML.forEach((topic) => {
    distribution[topic] = 0;
  });

  // Count problems per topic
  problemIds.forEach((id) => {
    const tags = getProblemTopic(id);

    tags.forEach((tag) => {
      const key = String(tag).toLowerCase().trim();
      if (key in distribution) {
        distribution[key]++;
      }
    });
  });

  return distribution;
}

/**
 * Convert problem -> multi-hot vector (ML READY FEATURE)
 * Each dimension represents whether problem covers that topic
 * @param {number | string} problemId - Problem ID
 * @returns {Object} Vector: {topic: 0|1}
 */
export function getProblemVector(problemId) {
  const tags = new Set(
    getProblemTopic(problemId).map(t => String(t).toLowerCase().trim())
  );

  const vector = {};

  TOPICS_ML.forEach((topic) => {
    const key = String(topic).toLowerCase().trim();
    vector[key] = tags.has(key) ? 1 : 0;
  });

  return vector;
}

/**
 * Convert dataset -> ML matrix for batch processing
 * @param {Array<number>} problemIds - List of problem IDs
 * @returns {Array<Object>} Array of feature vectors
 */
export function buildFeatureMatrix(problemIds) {
  return problemIds.map((id) => getProblemVector(id));
}

/**
 * Validate problem topic mapping consistency
 * Checks if all topics in mapping are valid
 * @returns {Object} Validation report
 */
export function validateTopicMapping() {
  const report = {
    valid: true,
    errors: [],
    warnings: [],
  };

  const validTopics = new Set(TOPICS_ML.map(t => String(t).toLowerCase().trim()));

  for (const [problemId, topics] of Object.entries(PROBLEM_TOPIC_MAP)) {
    if (!Array.isArray(topics)) {
      report.valid = false;
      report.errors.push(`Problem ${problemId}: topics is not an array`);
      continue;
    }

    for (const topic of topics) {
      const normalized = String(topic).toLowerCase().trim();
      if (!validTopics.has(normalized)) {
        report.valid = false;
        report.errors.push(
          `Problem ${problemId}: unknown topic "${topic}"`
        );
      }
    }

    if (topics.length === 0) {
      report.warnings.push(`Problem ${problemId}: has no topics`);
    }
  }

  return report;
}

/**
 * Get summary statistics about the mapping
 * @returns {Object} Statistics
 */
export function getMappingStats() {
  const problemIds = Object.keys(PROBLEM_TOPIC_MAP).map(Number);
  const allTopics = [];

  for (const topics of Object.values(PROBLEM_TOPIC_MAP)) {
    allTopics.push(...topics);
  }

  const topicCounts = {};
  allTopics.forEach((topic) => {
    const key = String(topic).toLowerCase().trim();
    topicCounts[key] = (topicCounts[key] || 0) + 1;
  });

  return {
    totalProblems: problemIds.length,
    totalMappings: allTopics.length,
    avgTopicsPerProblem: (allTopics.length / problemIds.length).toFixed(2),
    uniqueTopicsCovered: Object.keys(topicCounts).length,
    topicsInMLSpace: TOPICS_ML.length,
    topicFrequency: topicCounts,
  };
}

/**
 * Search for problems by topic (case-insensitive)
 * @param {string} query - Topic query string
 * @returns {Array<number>} Matching problem IDs
 */
export function searchProblemsByTopic(query) {
  const q = String(query).toLowerCase().trim();
  
  return Object.entries(PROBLEM_TOPIC_MAP)
    .filter(([_, tags]) => {
      return tags.some(t => String(t).toLowerCase().includes(q));
    })
    .map(([id]) => Number(id))
    .sort((a, b) => a - b);
}

/**
 * Get problems by difficulty (requires catalog)
 * @param {string} difficulty - Difficulty level: easy, medium, hard
 * @param {Array} catalogProblems - Problem catalog with difficulty info
 * @returns {Array<number>} Problem IDs at this difficulty
 */
export function getProblemsByDifficulty(difficulty, catalogProblems) {
  const target = String(difficulty).toLowerCase();
  
  return catalogProblems
    .filter(p => String(p.diff).toLowerCase() === target)
    .map(p => p.id)
    .filter(id => id in PROBLEM_TOPIC_MAP);
}

/**
 * Find related problems (same topics)
 * @param {number | string} problemId - Reference problem ID
 * @returns {Array<number>} Related problem IDs (excluding the reference)
 */
export function findRelatedProblems(problemId) {
  const refTopics = new Set(
    getProblemTopic(problemId).map(t => String(t).toLowerCase().trim())
  );

  const related = [];

  for (const [id, topics] of Object.entries(PROBLEM_TOPIC_MAP)) {
    const numId = Number(id);
    if (numId === Number(problemId)) continue;

    // Check overlap
    const overlap = topics.some(t => {
      const normalized = String(t).toLowerCase().trim();
      return refTopics.has(normalized);
    });

    if (overlap) {
      related.push(numId);
    }
  }

  return related.sort((a, b) => a - b);
}

// ============================================================
// INITIALIZATION & VALIDATION
// ============================================================

// Validate mapping on module load (development only)
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
  const validation = validateTopicMapping();
  if (!validation.valid) {
    console.warn('⚠️ Topic mapping validation failed:', validation);
  }
}

// Export stats for debugging
export const MAPPING_STATS = getMappingStats();