import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# ============================================================
# LOAD MODEL
# ============================================================

MODEL_PATH = "rf_multioutput.pkl"

try:
    model = joblib.load(MODEL_PATH)
    model_loaded = True
    threshold = 0.25
except Exception as e:
    print(f"[ERROR] Cannot load model: {e}")
    model = None
    model_loaded = False
    threshold = 0.25


# ============================================================
# PATTERNS (LABEL ORDER FIXED BY TRAINING SIDE)
# ============================================================

PATTERNS = [
    'array','bfs','simulation','dfs','hashing','divide and conquer',
    'string','sliding windows','linked list','binary tree','memoization',
    'two pointers','heap','palindrome','stack','backtracking','quickselect',
    'dp','suffix decomposition','sorting','topo','greedy','bit manipulation',
    'design','Boyer Moore','prefix sum','math','trie','binary search',
    'binary search on answer','binary search partition','dsu','recursion',
    'data structures'
]


# ============================================================
# FEATURE ENGINEERING
# ============================================================

def aggregate_user_topic_features(df: pd.DataFrame):
    users = df["userId"].unique()
    rows = []

    for u in users:
        udf = df[df["userId"] == u]

        feat = {}

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
                continue

            feat[f"{p}_solve_rate"] = (p_df["result"] == "AC").mean()
            feat[f"{p}_avg_wrong"] = float(p_df["wrongCount"].mean())
            feat[f"{p}_avg_time"] = float(p_df["timeSpent"].mean())
            feat[f"{p}_tle_rate"] = (p_df["result"] == "TLE").mean()

            easy = p_df[p_df["difficulty"] == "easy"]
            feat[f"{p}_easy_fail_rate"] = (easy["result"] != "AC").mean() if len(easy) else 0

        rows.append(feat)

    return pd.DataFrame(rows)


# ============================================================
# APP
# ============================================================

app = FastAPI(title="AI Weakness API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# SCHEMA
# ============================================================

class Submission(BaseModel):
    userId: str
    problemId: str
    topic: str
    difficulty: str
    result: str
    timeSpent: int
    wrongCount: int = 0


class PredictRequest(BaseModel):
    submissions: List[Submission]


# ============================================================
# ROUTES
# ============================================================

@app.get("/")
def root():
    return {"status": "ok", "model_loaded": model_loaded}


@app.get("/health")
def health():
    return {"model_loaded": model_loaded}


# ============================================================
# PREDICT (FIXED CORE)
# ============================================================

@app.post("/predict")
def predict(req: PredictRequest):

    if not model_loaded:
        raise HTTPException(503, "Model not loaded")

    df = pd.DataFrame([s.model_dump() for s in req.submissions])

    if "userId" not in df.columns:
        df["userId"] = "user"

    X = aggregate_user_topic_features(df)
    X_np = X.to_numpy(dtype=np.float32)

    try:
        probas = model.predict_proba(X_np)
    except Exception as e:
        raise HTTPException(500, str(e))

    results = {}

    # ========================================================
    # FIXED PROBABILITY HANDLING
    # ========================================================

    for i in range(len(probas)):

        # probas[i] shape: (n_samples, 2)
        p = probas[i][:, 1]   # class 1 probability
        avg_p = float(np.mean(p))

        tag = PATTERNS[i] if i < len(PATTERNS) else f"label_{i}"

        results[tag] = {
            "prob": float(np.clip(avg_p, 0, 1)),
            "weak": int(avg_p >= threshold)
        }

    top5 = sorted(results.items(), key=lambda x: x[1]["prob"], reverse=True)[:5]

    return {
        "success": True,
        "top5": [{"tag": k, **v} for k, v in top5],
        "all": results
    }