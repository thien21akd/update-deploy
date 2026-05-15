/**
 * Mapping từ tag tiếng Anh sang tiếng Việt
 */
const TAG_TRANSLATION = {
  'array': 'Mảng',
  'hashing': 'Bảng băm',
  'two pointers': 'Hai con trỏ',
  'sliding windows': 'Cửa sổ trượt',
  'string': 'Chuỗi',
  'simulation': 'Mô phỏng',
  'greedy': 'Tham lam',
  'Boyer Moore': 'Boyer Moore',
  'sorting': 'Sắp xếp',
  'backtracking': 'Quay lui',
  'dfs': 'DFS',
  'bfs': 'BFS',
  'prefix sum': 'Tiền tố tổng',
  'suffix decomposition': 'Phân tích hậu tố',
  'binary search': 'Tìm kiếm nhị phân',
  'binary search partition': 'Phân vùng tìm kiếm nhị phân',
  'dp': 'Quy hoạch động',
  'tree': 'Cây',
  'heap': 'Heap',
  'data structures': 'Cấu trúc dữ liệu',
  'linked list': 'Danh sách liên kết',
  'stack': 'Ngăn xếp',
  'design': 'Thiết kế',
  'topo': 'Sắp xếp tôpô',
  'dsu': 'Union-Find',
  'trie': 'Trie',
  'math': 'Toán học',
  'palindrome': 'Palindrome',
  'bit manipulation': 'Thao tác bit',
  'divide and conquer': 'Chia để trị',
  'memoization': 'Ghi nhớ',
  'quickselect': 'Quickselect',
  'binary tree': 'Cây nhị phân',
  'recursion': 'Đệ quy',
  'binary search on answer': 'Tìm kiếm nhị phân trên đáp án',
};

/**
 * Ánh xạ bài toán sang tags tiếng Việt
 */
const PROBLEM_TOPIC_MAP_VN = {
  '1': ['Mảng', 'Bảng băm', 'Hai con trỏ'],
  '2': ['Danh sách liên kết', 'Toán học'],
  '3': ['Cửa sổ trượt', 'Chuỗi', 'Bảng băm'],
  '4': ['Phân vùng tìm kiếm nhị phân'],
  '5': ['Hai con trỏ', 'Palindrome', 'Chuỗi'],
  '6': ['Chuỗi', 'Mô phỏng'],
  '7': ['Toán học', 'Mô phỏng'],
  '8': ['Mô phỏng', 'Chuỗi'],
  '9': ['Toán học', 'Palindrome'],
  '10': ['Quy hoạch động', 'Chuỗi'],
  '11': ['Hai con trỏ', 'Tham lam', 'Mảng'],
  '12': ['Chuỗi', 'Bảng băm', 'Tham lam'],
  '13': ['Chuỗi', 'Tham lam'],
  '14': ['Chuỗi'],
  '15': ['Sắp xếp', 'Hai con trỏ'],
  '16': ['Quay lui', 'DFS', 'Chuỗi'],
  '17': ['Chuỗi', 'Ngăn xếp'],
  '18': ['Danh sách liên kết', 'Mảng'],
  '19': ['Quay lui', 'DFS', 'Chuỗi'],
  '20': ['Heap', 'Cấu trúc dữ liệu'],
  '21': ['Tìm kiếm nhị phân', 'Mảng'],
  '22': ['Tìm kiếm nhị phân', 'Mảng'],
  '23': ['Quy hoạch động'],
  '24': ['Cây', 'DFS'],
  '25': ['Cây', 'DFS', 'BFS'],
  '26': ['Cây', 'DFS', 'BFS'],
  '27': ['Tham lam', 'Mảng'],
  '28': ['Thao tác bit', 'Mảng'],
  '29': ['Mảng', 'Danh sách liên kết', 'Hai con trỏ'],
  '30': ['Ngăn xếp', 'Thiết kế'],
  '31': ['Danh sách liên kết', 'Hai con trỏ', 'Mảng'],
  '32': ['Tham lam', 'Boyer Moore', 'Mảng'],
  '33': ['Quy hoạch động', 'Mảng'],
  '34': ['Danh sách liên kết', 'Mảng'],
  '35': ['Sắp xếp tôpô', 'DFS', 'BFS'],
  '36': ['Trie'],
  '37': ['Cấu trúc dữ liệu', 'Heap'],
  '38': ['DFS', 'BFS', 'Union-Find'],
  '39': ['Mảng', 'Tiền tố tổng'],
  '40': ['Cấu trúc dữ liệu', 'Heap'],
};

const problem = (id, name, diff, tags, ac, extras = {}) => ({
  id,
  name,
  diff,
  tags,
  ac,
  description: `Bài toán ${name}. Đây là bài luyện tập lập trình.`,
  examples: [{ input: "Xem đề bài chi tiết", output: "" }],
  constraints: ["Xem chi tiết"],
  testcases: [{ input: "// Trường hợp kiểm thử", expected: "// Kết quả" }],
  starter: {
    python: `class Solution:\n    def solve(self):\n        # ${name}\n        pass\n`,
    javascript: `var solve = function() {\n  // ${name}\n};\n`,
    java: `class Solution {\n  public void solve() {\n    // ${name}\n  }\n}\n`,
    cpp: `class Solution {\npublic:\n  void solve() {\n    // ${name}\n  }\n};\n`,
  },
  ...extras,
});

export const PROBLEMS = [
  problem(
    1,
    "Hai số có tổng bằng mục tiêu",
    "easy",
    PROBLEM_TOPIC_MAP_VN['1'],
    "0%",
    {
      description:
        "Cho một mảng số nguyên `nums` và một số nguyên `target`, hãy trả về chỉ số của **hai phần tử** sao cho tổng của chúng bằng `target`.\n\nBạn có thể giả sử rằng mỗi đầu vào có **đúng một** lời giải, và bạn không được sử dụng cùng một phần tử hai lần.\n\nBạn có thể trả về kết quả theo bất kỳ thứ tự nào.",
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explain: "Vì nums[0] + nums[1] = 2 + 7 = 9, ta trả về [0, 1].",
        },
        {
          input: "nums = [3,2,4], target = 6",
          output: "[1,2]",
          explain: "nums[1] + nums[2] = 2 + 4 = 6.",
        },
        { input: "nums = [3,3], target = 6", output: "[0,1]" },
      ],
      constraints: [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Chỉ tồn tại đúng một đáp án hợp lệ.",
      ],
      testcases: [
        { input: "nums = [2,7,11,15]\ntarget = 9", expected: "[0,1]" },
        { input: "nums = [3,2,4]\ntarget = 6", expected: "[1,2]" },
        { input: "nums = [3,3]\ntarget = 6", expected: "[0,1]" },
      ],
      starter: {
        python:
          "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass\n",
        javascript: "var twoSum = function(nums, target) {\n  \n};\n",
        java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};\n",
      },
    },
  ),

  problem(
    2,
    "Cộng hai số",
    "medium",
    PROBLEM_TOPIC_MAP_VN['2'],
    "0%",
    {
      description:
        "Cho hai **danh sách liên kết không rỗng** biểu diễn hai số nguyên không âm. Các chữ số được lưu theo thứ tự **ngược** và mỗi nút chứa một chữ số. Hãy cộng hai số và trả về tổng dưới dạng danh sách liên kết.\n\nBạn có thể giả định hai số không có số 0 đứng đầu, ngoại trừ chính số 0.",
      examples: [
        {
          input: "l1 = [2,4,3], l2 = [5,6,4]",
          output: "[7,0,8]",
          explain: "342 + 465 = 807.",
        },
        { input: "l1 = [0], l2 = [0]", output: "[0]" },
        {
          input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]",
          output: "[8,9,9,9,0,0,0,1]",
        },
      ],
      constraints: [
        "Số lượng nút trong mỗi danh sách liên kết nằm trong khoảng [1, 100].",
        "0 <= Node.val <= 9",
        "Đảm bảo danh sách biểu diễn một số không có số 0 đứng đầu.",
      ],
      testcases: [
        { input: "l1 = [2,4,3]\nl2 = [5,6,4]", expected: "[7,0,8]" },
        { input: "l1 = [0]\nl2 = [0]", expected: "[0]" },
        {
          input: "l1 = [9,9,9,9,9,9,9]\nl2 = [9,9,9,9]",
          expected: "[8,9,9,9,0,0,0,1]",
        },
      ],
      starter: {
        python:
          "class Solution:\n    def addTwoNumbers(self, l1, l2):\n        pass\n",
        javascript: "var addTwoNumbers = function(l1, l2) {\n  \n};\n",
        java: "class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        return null;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        return nullptr;\n    }\n};\n",
      },
    },
  ),

  problem(
    3,
    "Chuỗi con dài nhất không lặp ký tự",
    "medium",
    PROBLEM_TOPIC_MAP_VN['3'],
    "0%",
    {
      description:
        "Cho một chuỗi `s`, hãy tìm độ dài của **chuỗi con dài nhất** không chứa các ký tự lặp lại.",
      examples: [
        {
          input: 's = "abcabcbb"',
          output: "3",
          explain: 'Chuỗi con là "abc" với độ dài 3.',
        },
        {
          input: 's = "bbbbb"',
          output: "1",
          explain: 'Chuỗi con là "b" với độ dài 1.',
        },
        {
          input: 's = "pwwkew"',
          output: "3",
          explain: 'Chuỗi con là "wke" với độ dài 3.',
        },
      ],
      constraints: [
        "0 <= s.length <= 5 * 10^4",
        "s bao gồm các chữ cái tiếng Anh, chữ số, ký tự đặc biệt và khoảng trắng.",
      ],
      testcases: [
        { input: 's = "abcabcbb"', expected: "3" },
        { input: 's = "bbbbb"', expected: "1" },
        { input: 's = "pwwkew"', expected: "3" },
        { input: 's = ""', expected: "0" },
      ],
      starter: {
        python:
          "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass\n",
        javascript: "var lengthOfLongestSubstring = function(s) {\n  \n};\n",
        java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    4,
    "Trung vị của hai mảng đã sắp xếp",
    "hard",
    PROBLEM_TOPIC_MAP_VN['4'],
    "0%",
    {
      description:
        "Cho hai mảng đã sắp xếp tăng dần `nums1` và `nums2` có kích thước lần lượt là `m` và `n`, hãy trả về **trung vị** của hai mảng đã gộp.\n\nĐộ phức tạp thời gian yêu cầu phải là `O(log(m+n))`.",
      examples: [
        {
          input: "nums1 = [1,3], nums2 = [2]",
          output: "2.00000",
          explain: "Mảng gộp = [1,2,3], trung vị = 2.",
        },
        {
          input: "nums1 = [1,2], nums2 = [3,4]",
          output: "2.50000",
          explain: "Mảng gộp = [1,2,3,4], trung vị = (2+3)/2 = 2.5.",
        },
      ],
      constraints: [
        "nums1.length == m",
        "nums2.length == n",
        "0 <= m <= 1000",
        "0 <= n <= 1000",
        "1 <= m + n <= 2000",
        "-10^6 <= nums1[i], nums2[i] <= 10^6",
      ],
      testcases: [
        { input: "nums1 = [1,3]\nnums2 = [2]", expected: "2.00000" },
        { input: "nums1 = [1,2]\nnums2 = [3,4]", expected: "2.50000" },
        { input: "nums1 = []\nnums2 = [1]", expected: "1.00000" },
      ],
      starter: {
        python:
          "class Solution:\n    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:\n        pass\n",
        javascript:
          "var findMedianSortedArrays = function(nums1, nums2) {\n  \n};\n",
        java: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        return 0.0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        return 0.0;\n    }\n};\n",
      },
    },
  ),

  problem(
    5,
    "Chuỗi con Palindrome dài nhất",
    "medium",
    PROBLEM_TOPIC_MAP_VN['5'],
    "0%",
    {
      description:
        "Cho một chuỗi `s`, hãy trả về **chuỗi con Palindrome dài nhất** trong `s`.",
      examples: [
        {
          input: 's = "babad"',
          output: '"bab" hoặc "aba"',
          explain: 'Cả "bab" và "aba" đều là đáp án hợp lệ.',
        },
        {
          input: 's = "ac"',
          output: '"a" hoặc "c"',
        },
      ],
      constraints: [
        "1 <= s.length <= 1000",
        "s bao gồm các chữ cái tiếng Anh và chữ số.",
      ],
      testcases: [
        { input: 's = "babad"', expected: '"bab"' },
        { input: 's = "ac"', expected: '"a"' },
        { input: 's = "a"', expected: '"a"' },
      ],
      starter: {
        python:
          "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        pass\n",
        javascript: "var longestPalindrome = function(s) {\n  \n};\n",
        java: "class Solution {\n    public String longestPalindrome(String s) {\n        return \"\";\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    string longestPalindrome(string s) {\n        return \"\";\n    }\n};\n",
      },
    },
  ),

  problem(
    6,
    "Chuyển đổi ZigZag",
    "medium",
    PROBLEM_TOPIC_MAP_VN['6'],
    "0%",
    {
      description:
        'Chuỗi "PAYPALISHIRING" được viết theo một hình zigzag trên một số hàng nhất định, sau đó đọc theo từng hàng.\n\nVí dụ, với n = 3:\n```\nP   A   H   N\nA P L S I I G\nY   I   R\n```\nSau đó kết hợp lại: "PAHNAPLSIIYIR"',
      examples: [
        {
          input: 's = "PAYPALISHIRING", numRows = 3',
          output: '"PAHNAPLSIIYIR"',
        },
        {
          input: 's = "PAYPALISHIRING", numRows = 4',
          output: '"PINALSIGYAHRPI"',
        },
      ],
      constraints: [
        "1 <= s.length <= 1000",
        "1 <= numRows <= 1000",
      ],
      testcases: [
        { input: 's = "PAYPALISHIRING"\nnumRows = 3', expected: '"PAHNAPLSIIYIR"' },
        { input: 's = "PAYPALISHIRING"\nnumRows = 4', expected: '"PINALSIGYAHRPI"' },
      ],
      starter: {
        python:
          "class Solution:\n    def convert(self, s: str, numRows: int) -> str:\n        pass\n",
        javascript: "var convert = function(s, numRows) {\n  \n};\n",
        java: "class Solution {\n    public String convert(String s, int numRows) {\n        return \"\";\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    string convert(string s, int numRows) {\n        return \"\";\n    }\n};\n",
      },
    },
  ),

  problem(
    7,
    "Đảo ngược số nguyên",
    "medium",
    PROBLEM_TOPIC_MAP_VN['7'],
    "0%",
    {
      description:
        "Cho một số nguyên `x`, hãy trả về `x` với các chữ số của nó được đảo ngược. Nếu việc đảo ngược này dẫn đến tràn số (vượt quá 32-bit), hãy trả về `0`.",
      examples: [
        { input: "x = 123", output: "321" },
        { input: "x = -123", output: "-321" },
        { input: "x = 120", output: "21" },
        { input: "x = 0", output: "0" },
      ],
      constraints: [
        "-2^31 <= x <= 2^31 - 1",
      ],
      testcases: [
        { input: "x = 123", expected: "321" },
        { input: "x = -123", expected: "-321" },
        { input: "x = 120", expected: "21" },
      ],
      starter: {
        python:
          "class Solution:\n    def reverse(self, x: int) -> int:\n        pass\n",
        javascript: "var reverse = function(x) {\n  \n};\n",
        java: "class Solution {\n    public int reverse(int x) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int reverse(int x) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    8,
    "Chuyển đổi chuỗi thành số nguyên (atoi)",
    "medium",
    PROBLEM_TOPIC_MAP_VN['8'],
    "0%",
    {
      description:
        'Hãy thực hiện hàm `myAtoi(string s)` chuyển đổi chuỗi thành số nguyên 32-bit.\n\nThuật toán:\n1. Bỏ qua các khoảng trắng ở đầu.\n2. Kiểm tra xem ký tự tiếp theo có phải dấu (+/-) hay không. Đọc ký tự cho đến khi gặp ký tự không phải là chữ số. Chuỗi còn lại bị bỏ qua.\n3. Chuyển đổi các chữ số đã đọc thành số nguyên.',
      examples: [
        { input: 's = "42"', output: "42" },
        { input: 's = " -42"', output: "-42" },
        { input: 's = "4193 with words"', output: "4193" },
      ],
      constraints: [
        "0 <= s.length <= 200",
        's bao gồm các chữ cái tiếng Anh, chữ số, dấu cách, "+", "-" và ".".',
      ],
      testcases: [
        { input: 's = "42"', expected: "42" },
        { input: 's = " -42"', expected: "-42" },
        { input: 's = "4193 with words"', expected: "4193" },
      ],
      starter: {
        python:
          "class Solution:\n    def myAtoi(self, s: str) -> int:\n        pass\n",
        javascript: "var myAtoi = function(s) {\n  \n};\n",
        java: "class Solution {\n    public int myAtoi(String s) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int myAtoi(string s) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    9,
    "Palindrome Number",
    "easy",
    PROBLEM_TOPIC_MAP_VN['9'],
    "0%",
    {
      description:
        "Cho một số nguyên `x`, hãy kiểm tra xem nó có phải là palindrome hay không mà không chuyển đổi nó thành chuỗi.",
      examples: [
        { input: "x = 121", output: "true" },
        { input: "x = -121", output: "false", explain: "Từ trái sang phải, nó là -121. Từ phải sang trái, nó là 121-. Do đó nó không phải là palindrome." },
        { input: "x = 10", output: "false", explain: "Từ phải sang trái, nó là 01, không bằng 10." },
      ],
      constraints: [
        "-2^31 <= x <= 2^31 - 1",
      ],
      testcases: [
        { input: "x = 121", expected: "true" },
        { input: "x = -121", expected: "false" },
        { input: "x = 10", expected: "false" },
      ],
      starter: {
        python:
          "class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        pass\n",
        javascript: "var isPalindrome = function(x) {\n  \n};\n",
        java: "class Solution {\n    public boolean isPalindrome(int x) {\n        return false;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        return false;\n    }\n};\n",
      },
    },
  ),

  problem(
    10,
    "Biểu thức chính quy",
    "hard",
    PROBLEM_TOPIC_MAP_VN['10'],
    "0%",
    {
      description:
        'Hãy thực hiện hỗ trợ cho `\'.\' (bất kỳ ký tự nào)` và `\'*\' (0 hoặc nhiều phần tử trước đó)`.',
      examples: [
        { input: 's = "aa", p = "a"', output: "false" },
        { input: 's = "aa", p = "a*"', output: "true" },
      ],
      constraints: [
        "1 <= s.length <= 20",
        "1 <= p.length <= 30",
      ],
      testcases: [
        { input: 's = "aa"\np = "a"', expected: "false" },
        { input: 's = "aa"\np = "a*"', expected: "true" },
      ],
      starter: {
        python:
          "class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        pass\n",
        javascript: "var isMatch = function(s, p) {\n  \n};\n",
        java: "class Solution {\n    public boolean isMatch(String s, String p) {\n        return false;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    bool isMatch(string s, string p) {\n        return false;\n    }\n};\n",
      },
    },
  ),

  problem(
    11,
    "Bình chứa nhiều nước nhất",
    "medium",
    PROBLEM_TOPIC_MAP_VN['11'],
    "0%",
    {
      description:
        "Cho một mảng `height` của độ dài `n`. Bạn được cho hai con trỏ, trái và phải để biểu diễn hai đường thẳng đứng. Hãy tìm hai đường sao cho chúng cùng với trục x tạo thành một hộp chứa nhiều nước nhất.",
      examples: [
        { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49" },
        { input: "height = [1,1]", output: "1" },
      ],
      constraints: [
        "n == height.length",
        "2 <= n <= 10^5",
        "0 <= height[i] <= 10^4",
      ],
      testcases: [
        { input: "height = [1,8,6,2,5,4,8,3,7]", expected: "49" },
        { input: "height = [1,1]", expected: "1" },
      ],
      starter: {
        python:
          "class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        pass\n",
        javascript: "var maxArea = function(height) {\n  \n};\n",
        java: "class Solution {\n    public int maxArea(int[] height) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    12,
    "Chuyển đổi số nguyên thành chữ số La Mã",
    "medium",
    PROBLEM_TOPIC_MAP_VN['12'],
    "0%",
    {
      description:
        "Cho một số nguyên `num`, hãy trả về nó dưới dạng chữ số La Mã.",
      examples: [
        { input: "num = 3", output: '"III"' },
        { input: "num = 58", output: '"LVIII"' },
        { input: "num = 1994", output: '"MCMXCIV"' },
      ],
      constraints: [
        "1 <= num <= 3999",
      ],
      testcases: [
        { input: "num = 3", expected: '"III"' },
        { input: "num = 58", expected: '"LVIII"' },
        { input: "num = 1994", expected: '"MCMXCIV"' },
      ],
      starter: {
        python:
          "class Solution:\n    def intToRoman(self, num: int) -> str:\n        pass\n",
        javascript: "var intToRoman = function(num) {\n  \n};\n",
        java: "class Solution {\n    public String intToRoman(int num) {\n        return \"\";\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    string intToRoman(int num) {\n        return \"\";\n    }\n};\n",
      },
    },
  ),

  problem(
    13,
    "Chữ số La Mã thành số nguyên",
    "easy",
    PROBLEM_TOPIC_MAP_VN['13'],
    "0%",
    {
      description:
        "Cho một chuỗi `s` chứa các chữ số La Mã, hãy chuyển đổi nó thành số nguyên.",
      examples: [
        { input: 's = "III"', output: "3" },
        { input: 's = "LVIII"', output: "58" },
        { input: 's = "MCMXCIV"', output: "1994" },
      ],
      constraints: [
        "1 <= s.length <= 15",
        "s chứa các ký tự \'I\', \'V\', \'X\', \'L\', \'C\', \'D\', \'M\'.",
      ],
      testcases: [
        { input: 's = "III"', expected: "3" },
        { input: 's = "LVIII"', expected: "58" },
        { input: 's = "MCMXCIV"', expected: "1994" },
      ],
      starter: {
        python:
          "class Solution:\n    def romanToInt(self, s: str) -> int:\n        pass\n",
        javascript: "var romanToInt = function(s) {\n  \n};\n",
        java: "class Solution {\n    public int romanToInt(String s) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int romanToInt(string s) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    14,
    "Tiền tố chung dài nhất",
    "easy",
    PROBLEM_TOPIC_MAP_VN['14'],
    "0%",
    {
      description:
        "Cho một mảng chuỗi `strs`, hãy tìm **tiền tố chung dài nhất** giữa tất cả các chuỗi. Nếu không có tiền tố chung, hãy trả về một chuỗi rỗng.",
      examples: [
        { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
        { input: 'strs = ["dog","racecar","car"]', output: '""' },
      ],
      constraints: [
        "1 <= strs.length <= 200",
        "0 <= strs[i].length <= 200",
        "strs[i] chỉ chứa các chữ cái tiếng Anh chữ thường.",
      ],
      testcases: [
        { input: 'strs = ["flower","flow","flight"]', expected: '"fl"' },
        { input: 'strs = ["dog","racecar","car"]', expected: '""' },
      ],
      starter: {
        python:
          "class Solution:\n    def longestCommonPrefix(self, strs: list[str]) -> str:\n        pass\n",
        javascript: "var longestCommonPrefix = function(strs) {\n  \n};\n",
        java: "class Solution {\n    public String longestCommonPrefix(String[] strs) {\n        return \"\";\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    string longestCommonPrefix(vector<string>& strs) {\n        return \"\";\n    }\n};\n",
      },
    },
  ),

  problem(
    15,
    "Ba số có tổng bằng 0",
    "medium",
    PROBLEM_TOPIC_MAP_VN['15'],
    "0%",
    {
      description:
        "Cho một mảng số nguyên `nums`, hãy trả về tất cả **ba bộ ba khác nhau** mà tổng của chúng bằng 0.",
      examples: [
        { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
        { input: "nums = [0,0,0,0]", output: "[[0,0,0]]" },
      ],
      constraints: [
        "3 <= nums.length <= 3000",
        "-10^5 <= nums[i] <= 10^5",
      ],
      testcases: [
        { input: "nums = [-1,0,1,2,-1,-4]", expected: "[[-1,-1,2],[-1,0,1]]" },
        { input: "nums = [0,0,0,0]", expected: "[[0,0,0]]" },
      ],
      starter: {
        python:
          "class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:\n        pass\n",
        javascript: "var threeSum = function(nums) {\n  \n};\n",
        java: "class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        return new ArrayList<>();\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        return {};\n    }\n};\n",
      },
    },
  ),

  problem(
    16,
    "Tổng gần nhất của ba",
    "medium",
    PROBLEM_TOPIC_MAP_VN['16'],
    "0%",
    {
      description:
        "Cho một mảng số nguyên `nums` và một số nguyên `target`, hãy tìm **ba bộ ba** mà tổng của chúng **gần nhất với `target`**.",
      examples: [
        { input: "nums = [-1,2,1,-4], target = 1", output: "2", explain: "Tổng gần nhất là 2 (-1 + 2 + 1 = 2)." },
      ],
      constraints: [
        "3 <= nums.length <= 500",
        "-1000 <= nums[i] <= 1000",
        "-10^4 <= target <= 10^4",
      ],
      testcases: [
        { input: "nums = [-1,2,1,-4]\ntarget = 1", expected: "2" },
      ],
      starter: {
        python:
          "class Solution:\n    def threeSumClosest(self, nums: list[int], target: int) -> int:\n        pass\n",
        javascript: "var threeSumClosest = function(nums, target) {\n  \n};\n",
        java: "class Solution {\n    public int threeSumClosest(int[] nums, int target) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int threeSumClosest(vector<int>& nums, int target) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    17,
    "Các kết hợp chữ cái từ số điện thoại",
    "medium",
    PROBLEM_TOPIC_MAP_VN['17'],
    "0%",
    {
      description:
        "Cho một chuỗi `digits` chứa các chữ số từ 2-9, hãy trả về tất cả các kết hợp chữ cái mà các chữ số có thể biểu diễn. Hãy trả về câu trả lời theo bất kỳ thứ tự nào.",
      examples: [
        { input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' },
        { input: 'digits = ""', output: '[]' },
      ],
      constraints: [
        "0 <= digits.length <= 4",
        "digits[i] là một chữ số trong khoảng [\'2\', \'9\'].",
      ],
      testcases: [
        { input: 'digits = "23"', expected: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' },
        { input: 'digits = ""', expected: '[]' },
      ],
      starter: {
        python:
          "class Solution:\n    def letterCombinations(self, digits: str) -> list[str]:\n        pass\n",
        javascript: "var letterCombinations = function(digits) {\n  \n};\n",
        java: "class Solution {\n    public List<String> letterCombinations(String digits) {\n        return new ArrayList<>();\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    vector<string> letterCombinations(string digits) {\n        return {};\n    }\n};\n",
      },
    },
  ),

  problem(
    18,
    "Bộ bốn tổng",
    "medium",
    PROBLEM_TOPIC_MAP_VN['18'],
    "0%",
    {
      description:
        "Cho một mảng `nums` gồm `n` số nguyên, hãy trả về **tất cả bộ bốn khác nhau** mà tổng của chúng bằng một `target`.",
      examples: [
        { input: "nums = [1000000000,1000000000,1000000000,1000000000], target = -294967296", output: "[]" },
      ],
      constraints: [
        "1 <= nums.length <= 200",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
      ],
      testcases: [
        { input: "nums = [1000000000,1000000000,1000000000,1000000000]\ntarget = -294967296", expected: "[]" },
      ],
      starter: {
        python:
          "class Solution:\n    def fourSum(self, nums: list[int], target: int) -> list[list[int]]:\n        pass\n",
        javascript: "var fourSum = function(nums, target) {\n  \n};\n",
        java: "class Solution {\n    public List<List<Integer>> fourSum(int[] nums, int target) {\n        return new ArrayList<>();\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    vector<vector<int>> fourSum(vector<int>& nums, int target) {\n        return {};\n    }\n};\n",
      },
    },
  ),

  problem(
    19,
    "Xóa nút thứ N từ cuối danh sách",
    "medium",
    PROBLEM_TOPIC_MAP_VN['19'],
    "0%",
    {
      description:
        "Cho đầu của danh sách liên kết, hãy xóa **nút thứ `n` từ cuối** danh sách và trả về đầu danh sách.",
      examples: [
        { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]" },
      ],
      constraints: [
        "Số lượng nút trong danh sách là `sz`.",
        "1 <= sz <= 30",
        "0 <= Node.val <= 100",
        "1 <= n <= sz",
      ],
      testcases: [
        { input: "head = [1,2,3,4,5]\nn = 2", expected: "[1,2,3,5]" },
      ],
      starter: {
        python:
          "class Solution:\n    def removeNthFromEnd(self, head, n: int):\n        pass\n",
        javascript: "var removeNthFromEnd = function(head, n) {\n  \n};\n",
        java: "class Solution {\n    public ListNode removeNthFromEnd(ListNode head, int n) {\n        return null;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    ListNode* removeNthFromEnd(ListNode* head, int n) {\n        return nullptr;\n    }\n};\n",
      },
    },
  ),

  problem(
    20,
    "Dấu ngoặc hợp lệ",
    "easy",
    PROBLEM_TOPIC_MAP_VN['20'],
    "0%",
    {
      description:
        "Cho một chuỗi `s` chỉ chứa các ký tự \'(\', \')\', \'{\', \'}\', \'[\' và \']\', hãy xác định xem chuỗi đó có hợp lệ hay không.",
      examples: [
        { input: 's = "()"', output: "true" },
        { input: 's = "()[]{}"', output: "true" },
        { input: 's = "(]"', output: "false" },
      ],
      constraints: [
        "1 <= s.length <= 10^4",
        "s chỉ bao gồm các dấu ngoặc đơn \'()\', dấu ngoặc kép \'[]\' và dấu ngoặc nhọn \'{}\'.",
      ],
      testcases: [
        { input: 's = "()"', expected: "true" },
        { input: 's = "()[]{}"', expected: "true" },
        { input: 's = "(]"', expected: "false" },
      ],
      starter: {
        python:
          "class Solution:\n    def isValid(self, s: str) -> bool:\n        pass\n",
        javascript: "var isValid = function(s) {\n  \n};\n",
        java: "class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};\n",
      },
    },
  ),

  problem(
    21,
    "Gộp hai danh sách liên kết đã sắp xếp",
    "easy",
    PROBLEM_TOPIC_MAP_VN['21'],
    "0%",
    {
      description:
        "Cho hai danh sách liên kết đã sắp xếp từ nhỏ đến lớn, hãy gộp chúng thành một danh sách liên kết đã sắp xếp mới.",
      examples: [
        { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      ],
      constraints: [
        "Số lượng nút trong cả hai danh sách nằm trong khoảng [0, 50].",
        "-100 <= Node.val <= 100",
      ],
      testcases: [
        { input: "list1 = [1,2,4]\nlist2 = [1,3,4]", expected: "[1,1,2,3,4,4]" },
      ],
      starter: {
        python:
          "class Solution:\n    def mergeTwoLists(self, list1, list2):\n        pass\n",
        javascript: "var mergeTwoLists = function(list1, list2) {\n  \n};\n",
        java: "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        return null;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        return nullptr;\n    }\n};\n",
      },
    },
  ),

  problem(
    22,
    "Tạo dấu ngoặc",
    "medium",
    PROBLEM_TOPIC_MAP_VN['22'],
    "0%",
    {
      description:
        "Cho `n` cặp dấu ngoặc, hãy viết một hàm tạo tất cả các kết hợp **dấu ngoặc hợp lệ**.",
      examples: [
        { input: "n = 3", output: '["((()))","(()())","(())()","()(())","()()()"]' },
      ],
      constraints: [
        "1 <= n <= 8",
      ],
      testcases: [
        { input: "n = 3", expected: '["((()))","(()())","(())()","()(())","()()()"]' },
      ],
      starter: {
        python:
          "class Solution:\n    def generateParenthesis(self, n: int) -> list[str]:\n        pass\n",
        javascript: "var generateParenthesis = function(n) {\n  \n};\n",
        java: "class Solution {\n    public List<String> generateParenthesis(int n) {\n        return new ArrayList<>();\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    vector<string> generateParenthesis(int n) {\n        return {};\n    }\n};\n",
      },
    },
  ),

  problem(
    23,
    "Gộp danh sách liên kết k",
    "hard",
    PROBLEM_TOPIC_MAP_VN['23'],
    "0%",
    {
      description:
        "Cho một mảng `lists` gồm `k` danh sách liên kết đã sắp xếp, hãy gộp tất cả các danh sách thành một danh sách liên kết đã sắp xếp duy nhất.",
      examples: [
        { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,1,3,4,4,5,6]" },
      ],
      constraints: [
        "k == lists.length",
        "0 <= k <= 10^4",
        "0 <= lists[i].length <= 500",
        "-10^4 <= lists[i][j] <= 10^4",
      ],
      testcases: [
        { input: "lists = [[1,4,5],[1,3,4],[2,6]]", expected: "[1,1,2,1,3,4,4,5,6]" },
      ],
      starter: {
        python:
          "class Solution:\n    def mergeKLists(self, lists: list) -> list:\n        pass\n",
        javascript: "var mergeKLists = function(lists) {\n  \n};\n",
        java: "class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        return null;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        return nullptr;\n    }\n};\n",
      },
    },
  ),

  problem(
    24,
    "Hoán đổi các nút theo từng cặp",
    "medium",
    PROBLEM_TOPIC_MAP_VN['24'],
    "0%",
    {
      description:
        "Cho đầu của danh sách liên kết, hãy hoán đổi từng cặp nút kế tiếp nhau và trả về đầu danh sách.",
      examples: [
        { input: "head = [1,2,3,4]", output: "[2,1,4,3]" },
      ],
      constraints: [
        "Số lượng nút trong danh sách nằm trong khoảng [0, 100].",
        "0 <= Node.val <= 100",
      ],
      testcases: [
        { input: "head = [1,2,3,4]", expected: "[2,1,4,3]" },
      ],
      starter: {
        python:
          "class Solution:\n    def swapPairs(self, head):\n        pass\n",
        javascript: "var swapPairs = function(head) {\n  \n};\n",
        java: "class Solution {\n    public ListNode swapPairs(ListNode head) {\n        return null;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    ListNode* swapPairs(ListNode* head) {\n        return nullptr;\n    }\n};\n",
      },
    },
  ),

  problem(
    25,
    "Đảo ngược các nút trong k-Group",
    "hard",
    PROBLEM_TOPIC_MAP_VN['25'],
    "0%",
    {
      description:
        "Cho đầu của danh sách liên kết, hãy đảo ngược các nút trong mỗi nhóm k và trả về danh sách đã sửa đổi.",
      examples: [
        { input: "head = [1,2,3,4,5], k = 2", output: "[2,1,4,3,5]" },
      ],
      constraints: [
        "Số lượng nút trong danh sách nằm trong khoảng [1, 5000].",
        "1 <= k <= Số lượng nút",
        "0 <= Node.val <= 1000",
      ],
      testcases: [
        { input: "head = [1,2,3,4,5]\nk = 2", expected: "[2,1,4,3,5]" },
      ],
      starter: {
        python:
          "class Solution:\n    def reverseKGroup(self, head, k: int):\n        pass\n",
        javascript: "var reverseKGroup = function(head, k) {\n  \n};\n",
        java: "class Solution {\n    public ListNode reverseKGroup(ListNode head, int k) {\n        return null;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    ListNode* reverseKGroup(ListNode* head, int k) {\n        return nullptr;\n    }\n};\n",
      },
    },
  ),

  problem(
    26,
    "Xóa các phần tử trùng lặp từ mảng đã sắp xếp",
    "easy",
    PROBLEM_TOPIC_MAP_VN['26'],
    "0%",
    {
      description:
        "Cho một mảng đã sắp xếp `nums` **tại chỗ** sao cho mỗi phần tử duy nhất xuất hiện **chỉ một lần**. Trả về số phần tử duy nhất trong `nums`.",
      examples: [
        { input: "nums = [1,1,2]", output: "2, nums = [1,2,_]" },
      ],
      constraints: [
        "1 <= nums.length <= 3 * 10^4",
        "-100 <= nums[i] <= 100",
        "nums đã được sắp xếp tăng dần.",
      ],
      testcases: [
        { input: "nums = [1,1,2]", expected: "2" },
      ],
      starter: {
        python:
          "class Solution:\n    def removeDuplicates(self, nums: list[int]) -> int:\n        pass\n",
        javascript: "var removeDuplicates = function(nums) {\n  \n};\n",
        java: "class Solution {\n    public int removeDuplicates(int[] nums) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int removeDuplicates(vector<int>& nums) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    27,
    "Xóa phần tử",
    "easy",
    PROBLEM_TOPIC_MAP_VN['27'],
    "0%",
    {
      description:
        "Cho một mảng `nums` và một giá trị `val`, hãy xóa tất cả các trường hợp của `val` **tại chỗ**. Trả về số phần tử không bằng `val`.",
      examples: [
        { input: "nums = [3,2,2,3], val = 3", output: "2, nums = [2,2,_,_]" },
      ],
      constraints: [
        "0 <= nums.length <= 100",
        "0 <= nums[i] <= 50",
        "0 <= val <= 100",
      ],
      testcases: [
        { input: "nums = [3,2,2,3]\nval = 3", expected: "2" },
      ],
      starter: {
        python:
          "class Solution:\n    def removeElement(self, nums: list[int], val: int) -> int:\n        pass\n",
        javascript: "var removeElement = function(nums, val) {\n  \n};\n",
        java: "class Solution {\n    public int removeElement(int[] nums, int val) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int removeElement(vector<int>& nums, int val) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    28,
    "Tìm chỉ mục đầu tiên của chuỗi con",
    "easy",
    PROBLEM_TOPIC_MAP_VN['28'],
    "0%",
    {
      description:
        "Cho hai chuỗi `haystack` và `needle`, hãy trả về chỉ mục lần xuất hiện đầu tiên của `needle` trong `haystack`, hoặc `-1` nếu `needle` không phải là một phần của `haystack`.",
      examples: [
        { input: 'haystack = "sadbutsad", needle = "sad"', output: "0" },
      ],
      constraints: [
        "1 <= haystack.length, needle.length <= 10^4",
      ],
      testcases: [
        { input: 'haystack = "sadbutsad"\nneedle = "sad"', expected: "0" },
      ],
      starter: {
        python:
          "class Solution:\n    def strStr(self, haystack: str, needle: str) -> int:\n        pass\n",
        javascript: "var strStr = function(haystack, needle) {\n  \n};\n",
        java: "class Solution {\n    public int strStr(String haystack, String needle) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int strStr(string haystack, string needle) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    29,
    "Chia hai số nguyên",
    "medium",
    PROBLEM_TOPIC_MAP_VN['29'],
    "0%",
    {
      description:
        "Cho hai số nguyên `dividend` và `divisor`, hãy chia hai số và trả về thương. Cắt ngắn kết quả đến số nguyên gần nhất **hướng tới 0**.",
      examples: [
        { input: "dividend = 10, divisor = 3", output: "3" },
      ],
      constraints: [
        "-2^31 <= dividend, divisor <= 2^31 - 1",
        "divisor != 0",
      ],
      testcases: [
        { input: "dividend = 10\ndivisor = 3", expected: "3" },
      ],
      starter: {
        python:
          "class Solution:\n    def divide(self, dividend: int, divisor: int) -> int:\n        pass\n",
        javascript: "var divide = function(dividend, divisor) {\n  \n};\n",
        java: "class Solution {\n    public int divide(int dividend, int divisor) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int divide(int dividend, int divisor) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    30,
    "Toàn bộ ký tự cảnh báo từ từ điển",
    "hard",
    PROBLEM_TOPIC_MAP_VN['30'],
    "0%",
    {
      description:
        "Bạn được cấp một danh sách các từ và một chuỗi `s`. Hãy tìm tất cả các chỉ mục bắt đầu trong `s` nơi một chuỗi từ danh sách này bắt đầu. Mỗi ký tự trong `s` sẽ chỉ được sử dụng một lần.",
      examples: [
        { input: 's = "barfoothefoobarman", words = ["foo","bar"]', output: "[0,9]" },
      ],
      constraints: [
        "1 <= s.length <= 10^4",
        "words.length >= 1",
        "1 <= words[i].length <= 30",
      ],
      testcases: [
        { input: 's = "barfoothefoobarman"\nwords = ["foo","bar"]', expected: "[0,9]" },
      ],
      starter: {
        python:
          "class Solution:\n    def findSubstring(self, s: str, words: list[str]) -> list[int]:\n        pass\n",
        javascript: "var findSubstring = function(s, words) {\n  \n};\n",
        java: "class Solution {\n    public List<Integer> findSubstring(String s, String[] words) {\n        return new ArrayList<>();\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    vector<int> findSubstring(string s, vector<string>& words) {\n        return {};\n    }\n};\n",
      },
    },
  ),

  problem(
    31,
    "Hoán vị tiếp theo",
    "medium",
    PROBLEM_TOPIC_MAP_VN['31'],
    "0%",
    {
      description:
        "Cho một mảng số nguyên `nums`, hãy sửa đổi nó **tại chỗ** thành **hoán vị tiếp theo** của nó. Nếu không tồn tại hoán vị tiếp theo, hãy sắp xếp nó thành **hoán vị nhỏ nhất** (tức là theo thứ tự được sắp xếp).",
      examples: [
        { input: "nums = [1,2,3]", output: "[1,3,2]" },
      ],
      constraints: [
        "1 <= nums.length <= 100",
        "0 <= nums[i] <= 100",
      ],
      testcases: [
        { input: "nums = [1,2,3]", expected: "[1,3,2]" },
      ],
      starter: {
        python:
          "class Solution:\n    def nextPermutation(self, nums: list[int]) -> None:\n        pass\n",
        javascript: "var nextPermutation = function(nums) {\n  \n};\n",
        java: "class Solution {\n    public void nextPermutation(int[] nums) {}\n}\n",
        cpp: "class Solution {\npublic:\n    void nextPermutation(vector<int>& nums) {}\n};\n",
      },
    },
  ),

  problem(
    32,
    "Chuỗi con dài nhất hợp lệ chứa dấu ngoặc",
    "hard",
    PROBLEM_TOPIC_MAP_VN['32'],
    "0%",
    {
      description:
        "Cho một chuỗi chỉ chứa `'('` và `')'`, hãy tìm độ dài của **chuỗi con dài nhất** chứa các dấu ngoặc hợp lệ.",
      examples: [
        { input: 's = "(()"', output: "2" },
        { input: 's = ")()())\\"', output: "4" },
      ],
      constraints: [
        "0 <= s.length <= 3 * 10^4",
        "s[i] là \'(\' hoặc \')\' .",
      ],
      testcases: [
        { input: 's = "(()"', expected: "2" },
        { input: 's = ")()())\\"', expected: "4" },
      ],
      starter: {
        python:
          "class Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        pass\n",
        javascript: "var longestValidParentheses = function(s) {\n  \n};\n",
        java: "class Solution {\n    public int longestValidParentheses(String s) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int longestValidParentheses(string s) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    33,
    "Tìm kiếm trong mảng được xoay",
    "medium",
    PROBLEM_TOPIC_MAP_VN['33'],
    "0%",
    {
      description:
        "Cho một mảng được xoay và một giá trị `target`, hãy tìm `target` nếu nó tồn tại trong mảng, nếu không hãy trả về -1.",
      examples: [
        { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
      ],
      constraints: [
        "1 <= nums.length <= 5000",
        "-10^4 <= nums[i] <= 10^4",
        "Tất cả các giá trị của `nums` là duy nhất.",
      ],
      testcases: [
        { input: "nums = [4,5,6,7,0,1,2]\ntarget = 0", expected: "4" },
      ],
      starter: {
        python:
          "class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        pass\n",
        javascript: "var search = function(nums, target) {\n  \n};\n",
        java: "class Solution {\n    public int search(int[] nums, int target) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    34,
    "Tìm vị trí đầu tiên và cuối cùng của phần tử trong mảng đã sắp xếp",
    "medium",
    PROBLEM_TOPIC_MAP_VN['34'],
    "0%",
    {
      description:
        "Cho một mảng số nguyên `nums` đã sắp xếp tăng dần và một số nguyên `target`, hãy tìm vị trí bắt đầu và kết thúc của `target` trong `nums`. Nếu `target` không tìm thấy trong `nums`, hãy trả về `[-1, -1]`.",
      examples: [
        { input: "nums = [5,7,7,8,8,10], target = 8", output: "[3,4]" },
      ],
      constraints: [
        "0 <= nums.length <= 10^5",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
      ],
      testcases: [
        { input: "nums = [5,7,7,8,8,10]\ntarget = 8", expected: "[3,4]" },
      ],
      starter: {
        python:
          "class Solution:\n    def searchRange(self, nums: list[int], target: int) -> list[int]:\n        pass\n",
        javascript: "var searchRange = function(nums, target) {\n  \n};\n",
        java: "class Solution {\n    public int[] searchRange(int[] nums, int target) {\n        return new int[]{};\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    vector<int> searchRange(vector<int>& nums, int target) {\n        return {};\n    }\n};\n",
      },
    },
  ),

  problem(
    35,
    "Vị trí chèn tìm kiếm",
    "easy",
    PROBLEM_TOPIC_MAP_VN['35'],
    "0%",
    {
      description:
        "Cho một mảng sắp xếp và một giá trị mục tiêu, hãy trả về chỉ mục nếu giá trị mục tiêu được tìm thấy. Nếu không, hãy trả về chỉ mục nơi nó sẽ được nếu nó được chèn vào theo thứ tự.",
      examples: [
        { input: "nums = [1,3,5,6], target = 5", output: "2" },
      ],
      constraints: [
        "1 <= nums.length <= 10^4",
        "-10^4 <= nums[i] <= 10^4",
        "-10^4 <= target <= 10^4",
      ],
      testcases: [
        { input: "nums = [1,3,5,6]\ntarget = 5", expected: "2" },
      ],
      starter: {
        python:
          "class Solution:\n    def searchInsert(self, nums: list[int], target: int) -> int:\n        pass\n",
        javascript: "var searchInsert = function(nums, target) {\n  \n};\n",
        java: "class Solution {\n    public int searchInsert(int[] nums, int target) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int searchInsert(vector<int>& nums, int target) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    36,
    "Cài đặt Trie",
    "medium",
    PROBLEM_TOPIC_MAP_VN['36'],
    "0%",
    {
      description:
        "Trie (hay tiền tố cây) là một cấu trúc dữ liệu dạng cây dùng để lưu trữ và tìm kiếm chuỗi hiệu quả.\n\nCài đặt lớp `Trie`:\n- `Trie()` khởi tạo trie.\n- `void insert(String word)` chèn `word` vào trie.\n- `boolean search(String word)` trả về `true` nếu `word` tồn tại trong trie.\n- `boolean startsWith(String prefix)` trả về `true` nếu có từ trong trie bắt đầu bằng `prefix`.",
      examples: [
        {
          input:
            '["Trie","insert","search","search","startsWith","insert","search"]\n[[],["apple"],["apple"],["app"],["app"],["app"],["app"]]',
          output: "[null,null,true,false,true,null,true]",
        },
      ],
      constraints: [
        "1 <= word.length, prefix.length <= 2000",
        "word và prefix chỉ chứa chữ thường tiếng Anh.",
        "Tối đa 3 * 10^4 lời gọi insert, search và startsWith.",
      ],
      testcases: [
        {
          input:
            'ops = ["Trie","insert","search","search","startsWith","insert","search"]\nvals = [[],["apple"],["apple"],["app"],["app"],["app"],["app"]]',
          expected: "[null,null,true,false,true,null,true]",
        },
      ],
      starter: {
        python:
          "class Trie:\n    def __init__(self):\n        pass\n\n    def insert(self, word: str) -> None:\n        pass\n\n    def search(self, word: str) -> bool:\n        pass\n\n    def startsWith(self, prefix: str) -> bool:\n        pass\n",
        javascript:
          "var Trie = function() {};\nTrie.prototype.insert = function(word) {};\nTrie.prototype.search = function(word) { return false; };\nTrie.prototype.startsWith = function(prefix) { return false; };\n",
        java: "class Trie {\n    public Trie() {}\n    public void insert(String word) {}\n    public boolean search(String word) { return false; }\n    public boolean startsWith(String prefix) { return false; }\n}\n",
        cpp: "class Trie {\npublic:\n    Trie() {}\n    void insert(string word) {}\n    bool search(string word) { return false; }\n    bool startsWith(string prefix) { return false; }\n};\n",
      },
    },
  ),

  problem(
    37,
    "Phần tử lớn thứ k",
    "medium",
    PROBLEM_TOPIC_MAP_VN['37'],
    "0%",
    {
      description:
        "Cho mảng số nguyên `nums` và số nguyên `k`, hãy trả về **phần tử lớn thứ `k`** trong mảng đã sắp xếp.\n\nLưu ý: Phần tử lớn thứ `k` trong thứ tự sắp xếp, không phải phần tử duy nhất thứ `k`.",
      examples: [
        { input: "nums = [3,2,1,5,6,4], k = 2", output: "5" },
        { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4" },
      ],
      constraints: [
        "1 <= k <= nums.length <= 10^5",
        "-10^4 <= nums[i] <= 10^4",
      ],
      testcases: [
        { input: "nums = [3,2,1,5,6,4]\nk = 2", expected: "5" },
        { input: "nums = [3,2,3,1,2,4,5,5,6]\nk = 4", expected: "4" },
        { input: "nums = [1]\nk = 1", expected: "1" },
      ],
      starter: {
        python:
          "class Solution:\n    def findKthLargest(self, nums: list[int], k: int) -> int:\n        pass\n",
        javascript: "var findKthLargest = function(nums, k) {\n  \n};\n",
        java: "class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    38,
    "Số lượng hòn đảo",
    "medium",
    PROBLEM_TOPIC_MAP_VN['38'],
    "0%",
    {
      description:
        'Cho lưới `m x n` gồm các ký tự `"1"` (đất liền) và `"0"` (nước), hãy đếm **số lượng hòn đảo**.\n\nMột hòn đảo được bao quanh bởi nước và được tạo thành bằng cách kết nối các đất liền liền kề theo chiều ngang hoặc dọc. Bạn có thể giả định bốn cạnh của lưới đều là nước.',
      examples: [
        {
          input:
            'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
          output: "1",
        },
        {
          input:
            'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
          output: "3",
        },
      ],
      constraints: [
        "m == grid.length",
        "n == grid[i].length",
        "1 <= m, n <= 300",
        'grid[i][j] là "0" hoặc "1".',
      ],
      testcases: [
        {
          input:
            'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
          expected: "1",
        },
        {
          input:
            'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
          expected: "3",
        },
      ],
      starter: {
        python:
          "class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        pass\n",
        javascript: "var numIslands = function(grid) {\n  \n};\n",
        java: "class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        return 0;\n    }\n};\n",
      },
    },
  ),

  problem(
    39,
    "Tích của mảng trừ chính nó",
    "medium",
    PROBLEM_TOPIC_MAP_VN['39'],
    "0%",
    {
      description:
        "Cho mảng số nguyên `nums`, hãy trả về mảng `answer` sao cho `answer[i]` bằng **tích của tất cả phần tử trong `nums` ngoại trừ `nums[i]`**.\n\nTích của bất kỳ tiền tố hoặc hậu tố nào của `nums` đều đảm bảo vừa với số nguyên 32-bit.\n\n**Yêu cầu**: Không được dùng phép chia và độ phức tạp `O(n)`.",
      examples: [
        { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
        { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
      ],
      constraints: [
        "2 <= nums.length <= 10^5",
        "-30 <= nums[i] <= 30",
        "Đảm bảo tích của bất kỳ tiền tố hoặc hậu tố nào đều vừa với số nguyên 32-bit.",
      ],
      testcases: [
        { input: "nums = [1,2,3,4]", expected: "[24,12,8,6]" },
        { input: "nums = [-1,1,0,-3,3]", expected: "[0,0,9,0,0]" },
        { input: "nums = [2,3,4,5]", expected: "[60,40,30,24]" },
      ],
      starter: {
        python:
          "class Solution:\n    def productExceptSelf(self, nums: list[int]) -> list[int]:\n        pass\n",
        javascript: "var productExceptSelf = function(nums) {\n  \n};\n",
        java: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        return new int[]{};\n    }\n}\n",
        cpp: "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        return {};\n    }\n};\n",
      },
    },
  ),

  problem(
    40,
    "Tìm trung vị từ luồng dữ liệu",
    "hard",
    PROBLEM_TOPIC_MAP_VN['40'],
    "0%",
    {
      description:
        "Trung vị là giá trị ở giữa trong danh sách đã sắp xếp. Nếu có **số chẵn** phần tử, trung vị là trung bình của hai phần tử giữa.\n\nCài đặt lớp `MedianFinder`:\n- `MedianFinder()` khởi tạo đối tượng.\n- `void addNum(int num)` thêm số nguyên `num` từ luồng dữ liệu vào cấu trúc dữ liệu.\n- `double findMedian()` trả về trung vị của tất cả các phần tử đã thêm cho đến nay.",
      examples: [
        {
          input:
            '["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]\n[[],[1],[2],[],[3],[]]',
          output: "[null,null,null,1.5,null,2.0]",
          explain:
            "Sau [1,2]: trung vị = (1+2)/2 = 1.5. Sau [1,2,3]: trung vị = 2.0.",
        },
      ],
      constraints: [
        "-10^5 <= num <= 10^5",
        "Luôn có ít nhất một phần tử trước khi gọi findMedian.",
        "Tối đa 5 * 10^4 lời gọi addNum và findMedian.",
      ],
      testcases: [
        {
          input:
            'ops = ["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]\nvals = [[],[1],[2],[],[3],[]]',
          expected: "[null,null,null,1.5,null,2.0]",
        },
      ],
      starter: {
        python:
          "class MedianFinder:\n    def __init__(self):\n        pass\n\n    def addNum(self, num: int) -> None:\n        pass\n\n    def findMedian(self) -> float:\n        pass\n",
        javascript:
          "var MedianFinder = function() {};\nMedianFinder.prototype.addNum = function(num) {};\nMedianFinder.prototype.findMedian = function() { return 0.0; };\n",
        java: "class MedianFinder {\n    public MedianFinder() {}\n    public void addNum(int num) {}\n    public double findMedian() { return 0.0; }\n}\n",
        cpp: "class MedianFinder {\npublic:\n    MedianFinder() {}\n    void addNum(int num) {}\n    double findMedian() { return 0.0; }\n};\n",
      },
    },
  ),
];