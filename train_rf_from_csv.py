import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import hamming_loss

# ============================================================
# CONFIG
# ============================================================

PATTERNS = [
    'array','bfs','simulation','dfs','hashing','divide and conquer',
    'string','sliding windows','linked list','binary tree','memoization',
    'two pointers','heap','palindrome','stack','backtracking','quickselect',
    'dp','suffix decomposition','sorting','topo','greedy','bit manipulation',
    'design','Boyer Moore','prefix sum','math','trie','binary search',
    'binary search on answer','binary search partition','dsu','recursion',
    'data structures',
]

DIFFICULTY_MAP = {"easy": 1, "medium": 2, "hard": 3}
PRED_THRESHOLD = 0.25

# ============================================================
# SCORE FUNCTIONS
# ============================================================

def clamp(x, a=0, b=100):
    return max(a, min(b, x))

def solve_rate_score(rate):
    return (1 - rate) * 100

def wrong_score(avg_wrong):
    return min(30, avg_wrong * 5)

def easy_fail_score(rate):
    return min(35, rate * 50)

def time_threshold(diff):
    if diff <= 1.2:
        return 900
    if diff <= 2.2:
        return 2100
    return 4200

def time_score(avg_time, avg_diff):
    th = time_threshold(avg_diff)
    ratio = avg_time / th if th > 0 else 1
    return min(25, max(0, (ratio - 1) * 25))

def tle_score(rate):
    return min(25, rate * 80)

def compute_score(s):
    penalty = (
        solve_rate_score(s["solve_rate"]) +
        wrong_score(s["avg_wrong"]) +
        easy_fail_score(s["easy_fail_rate"]) +
        time_score(s["avg_time"], s["avg_diff_level"]) +
        tle_score(s["tle_rate"])
    )
    return clamp(100 - penalty)

def is_weak(score):
    return 1 if score < 50 else 0


# ============================================================
# FEATURE ENGINEERING
# ============================================================

def build_features(df):
    users = df["userId"].unique()

    X_rows = []
    Y_rows = []

    for u in users:
        udf = df[df["userId"] == u]

        feat = {"userId": u}
        label = {}

        total = len(udf)
        solved = (udf["result"] == "AC").sum()

        feat["global_attempts"] = total
        feat["global_solved"] = solved
        feat["global_solve_rate"] = solved / total if total else 0
        feat["global_avg_time"] = udf["timeSpent"].mean() if total else 0
        feat["global_avg_wrong"] = udf["wrongCount"].mean() if total else 0

        for p in PATTERNS:
            p_df = udf[udf["topic"] == p]
            attempted = len(p_df)

            feat[f"{p}_attempted"] = attempted
            feat[f"{p}_never_seen"] = 1 if attempted == 0 else 0

            if attempted == 0:
                feat[f"{p}_solve_rate"] = 0
                feat[f"{p}_avg_wrong"] = 0
                feat[f"{p}_avg_time"] = 0
                feat[f"{p}_tle_rate"] = 0
                feat[f"{p}_easy_fail_rate"] = 0
                label[f"weak_{p}"] = 0
                continue

            solve_rate = (p_df["result"] == "AC").mean()
            avg_wrong = p_df["wrongCount"].mean()
            avg_time = p_df["timeSpent"].mean()
            tle_rate = (p_df["result"] == "TLE").mean()

            easy_df = p_df[p_df["difficulty"] == "easy"]
            easy_fail = (easy_df["result"] != "AC").mean() if len(easy_df) else 0

            diff_map = p_df["difficulty"].map(DIFFICULTY_MAP).dropna()
            avg_diff = diff_map.mean() if len(diff_map) else 1.5

            feat[f"{p}_solve_rate"] = solve_rate
            feat[f"{p}_avg_wrong"] = avg_wrong
            feat[f"{p}_avg_time"] = avg_time
            feat[f"{p}_tle_rate"] = tle_rate
            feat[f"{p}_easy_fail_rate"] = easy_fail

            score = compute_score({
                "solve_rate": solve_rate,
                "avg_wrong": avg_wrong,
                "avg_time": avg_time,
                "easy_fail_rate": easy_fail,
                "tle_rate": tle_rate,
                "avg_diff_level": avg_diff,
            })

            label[f"weak_{p}"] = is_weak(score)

        X_rows.append(feat)
        Y_rows.append(label)

    X = pd.DataFrame(X_rows).fillna(0)
    Y = pd.DataFrame(Y_rows).fillna(0)

    if "userId" not in X.columns:
        X["userId"] = users

    X = X.set_index("userId")
    Y = Y.set_index(X.index)

    X = X.replace([np.inf, -np.inf], 0).astype(np.float32)
    Y = Y.astype(int)

    return X, Y


# ============================================================
# TRAIN
# ============================================================

def train(csv_path="submissions.csv"):
    df = pd.read_csv(csv_path)

    X, Y = build_features(df)

    X_train, X_test, Y_train, Y_test = train_test_split(
        X.values, Y.values, test_size=0.25, random_state=42
    )

    model = MultiOutputClassifier(
        RandomForestClassifier(
            n_estimators=500,
            max_depth=14,
            n_jobs=-1,
            class_weight="balanced_subsample",
            random_state=42,
            criterion="gini"
        )
    )

    model.fit(X_train, Y_train)

    print("Evaluating...")

    probas = model.predict_proba(X_test)
    preds = np.zeros_like(Y_test)

    for i in range(len(probas)):
        if probas[i].shape[1] == 1:
            preds[:, i] = 0
        else:
            preds[:, i] = (probas[i][:, 1] >= PRED_THRESHOLD).astype(int)

    print("Hamming Loss:", hamming_loss(Y_test, preds))

    return model


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    model = train()