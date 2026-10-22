# Dataset Preparation & ML Training Guide

## 1. Dataset Origin
NewsVerify utilizes a curated dataset constructed from benchmark corpora:
- **LIAR Benchmark (Wang, 2017)**: 12.8k labeled short statements from PolitiFact with six fine-grained labels mapped to binary categories (`true`, `mostly-true`, `half-true` mapped to real; `barely-true`, `false`, `pants-on-fire` mapped to fake).
- **FakeNewsNet Benchmark (Shu et al., 2018)**: News content with verified fact-checking records from PolitiFact and GossipCop.

A representative curated benchmark of labeled statements is included in `/ml/sample_dataset.json`.

## 2. Training the Baseline Classifier

### Step 1: Install Python Dependencies
```bash
pip install -r ml/requirements.txt
```

### Step 2: Execute Training Pipeline
```bash
python ml/train_model.py
```

### Step 3: Pipeline Output
The script performs:
1. Text normalization, URL stripping, and English stopword removal.
2. Unigram and bigram extraction.
3. TF-IDF vectorization with sublinear scaling (`sublinear_tf=True`) to limit high-frequency distortion.
4. L2-regularized Logistic Regression ($C=1.5$).
5. Stratified 75/25 train/test split.
6. Evaluates test set metrics (Accuracy, Precision, Recall, F1, Confusion Matrix).
7. Exports JSON model parameters:
   - `server/ml/model_export.json` (Vocabulary map, IDF values vector, coefficients vector, intercept, and decision thresholds).
   - `server/ml/metrics.json` (Evaluation scores and confusion matrix).

## 3. Node.js Native Runtime Reproduction
The exported `model_export.json` file is loaded directly by `server/ml/inference.ts`. Because the vectorization and matrix calculations are natively written in TypeScript, the deployed Node.js backend performs 100% identical inference without requiring a Python interpreter at runtime.
