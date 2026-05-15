import random
import math
import pandas as pd
from datetime import datetime, timedelta

TOPICS = [
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
]

DIFFICULTY_MAP = {"easy": 1, "medium": 2, "hard": 3}


def sigmoid(x):
    return 1 / (1 + math.exp(-x))


def generate_problem_bank():
    problems = []
    pid = 1
    for topic in TOPICS:
        for diff in ["easy", "medium", "hard"]:
            for _ in range(30):
                problems.append({
                    "problemId": f"P{pid:05d}",
                    "topic": topic,
                    "difficulty": diff
                })
                pid += 1
    return problems


def generate_user_profile(weak_topic=None):
    """
    skill range [0..1]
    if weak_topic exists -> force low skill for that topic
    """
    profile = {}
    base = random.uniform(0.35, 0.85)

    for t in TOPICS:
        profile[t] = max(0.05, min(0.95, random.gauss(base, 0.15)))

    if weak_topic is not None:
        if weak_topic not in profile:
            raise ValueError(f"weak_topic '{weak_topic}' not in TOPICS")
        profile[weak_topic] = random.uniform(0.05, 0.25)

    return profile


def generate_submissions_for_user(user_id, problems, profile, min_sub=40, max_sub=140):
    n_sub = random.randint(min_sub, max_sub)
    now = datetime.now()

    submissions = []

    for _ in range(n_sub):
        prob = random.choice(problems)
        topic = prob["topic"]
        diff = prob["difficulty"]
        diff_val = DIFFICULTY_MAP[diff]

        diff_penalty = 0.25 * (diff_val - 1)

        p_ac = sigmoid((profile[topic] - diff_penalty) * 4)
        p_ac += random.uniform(-0.07, 0.07)
        p_ac = max(0.01, min(0.99, p_ac))

        result = "AC" if random.random() < p_ac else "WA"

        base_time = 300 + diff_val * 600
        time_spent = int(base_time * (1.4 - profile[topic]) * random.uniform(0.7, 1.5))

        wrong_count = random.randint(2, 8) if result == "WA" else random.randint(0, 3)

        ts = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))

        submissions.append({
            "userId": user_id,
            "problemId": prob["problemId"],
            "topic": topic,
            "difficulty": diff,
            "result": result,
            "timeSpent": time_spent,
            "wrongCount": wrong_count,
            "timestamp": ts.isoformat()
        })

    return submissions


def build_exact_user_distribution(n_users, distribution):
    total_weight = sum(distribution.values())
    if abs(total_weight - 1.0) > 1e-6:
        raise ValueError("Distribution weights must sum to 1.0")

    for key in distribution:
        if key != "none" and key not in TOPICS:
            raise ValueError(f"Distribution key '{key}' is not in TOPICS")

    counts = {}
    assigned = []

    for key, w in distribution.items():
        counts[key] = int(n_users * w)

    remainder = n_users - sum(counts.values())

    frac = sorted(
        distribution.items(),
        key=lambda x: (n_users * x[1]) - int(n_users * x[1]),
        reverse=True
    )

    idx = 0
    while remainder > 0:
        key = frac[idx % len(frac)][0]
        counts[key] += 1
        remainder -= 1
        idx += 1

    for key, c in counts.items():
        assigned.extend([None if key == "none" else key] * c)

    random.shuffle(assigned)
    return assigned, counts


def generate_dataset_csv_exact(n_users=2000, output_csv="submissions.csv", distribution=None):
    if distribution is None:
        distribution = {
            "none": 0.40,
            "dp": 0.15,
            "bfs": 0.10,
            "dfs": 0.10,
            "binary search": 0.10,
            "greedy": 0.10,
            "trie": 0.05
        }

    problems = generate_problem_bank()
    weak_assignments, counts = build_exact_user_distribution(n_users, distribution)

    all_submissions = []

    for i in range(1, n_users + 1):
        user_id = f"U{i:05d}"
        weak_topic = weak_assignments[i - 1]

        profile = generate_user_profile(weak_topic=weak_topic)
        subs = generate_submissions_for_user(user_id, problems, profile)

        all_submissions.extend(subs)

    df = pd.DataFrame(all_submissions)
    df.to_csv(output_csv, index=False, encoding="utf-8")

    print(f"✅ Generated {len(df)} submissions from {n_users} users")
    print(f"✅ Saved to {output_csv}")

    print("\n📌 Exact weakness distribution:")
    for k, v in counts.items():
        print(f"   {k:20s}: {v} users ({v/n_users:.1%})")


if __name__ == "__main__":
    distribution = {
        "none": 0.30,
        "dp": 0.15,
        "bfs": 0.10,
        "dfs": 0.10,
        "binary search": 0.10,
        "greedy": 0.10,
        "trie": 0.05,
        "heap": 0.05,
        "hashing": 0.05
    }

    generate_dataset_csv_exact(
        n_users=2000,
        output_csv="submissions.csv",
        distribution=distribution
    )