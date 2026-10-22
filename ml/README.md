# Machine Learning Model Pipeline: NewsVerify

This directory contains the offline machine learning model training pipeline for the **NewsVerify** platform.

## 1. Architecture Overview

- **Algorithm**: Binary Logistic Regression with L2 Regularization (Ridge penalty, $C=1.5$).
- **Feature Extraction**: TF-IDF (Term Frequency - Inverse Document Frequency) with sublinear scaling and unigrams + bigrams.
- **Dataset**: Curated benchmark derived from the LIAR benchmark (Wang, 2017) and FakeNewsNet dataset.
- **Inference Strategy**: Scikit-learn outputs are serialized into JSON (`model_export.json`). The Node.js application backend performs 100% native runtime vectorization and matrix dot products using pure TypeScript, eliminating Python runtime dependencies in production.

## 2. Mathematical Formulation

### TF-IDF Vectorization
For token $t$ in document $d$:
$$\text{TF}(t, d) = 1 + \ln(\text{count}(t, d)) \quad \text{if count} > 0$$
$$\text{IDF}(t, D) = \ln\left(\frac{1 + |D|}{1 + \text{DF}(t)}\right) + 1$$
$$\vec{x}_d = \frac{\text{TF}(t, d) \cdot \text{IDF}(t)}{\|\vec{x}_d\|_2}$$

### Logistic Regression
The logit score $z$ is computed as:
$$z = \beta_0 + \sum_{i=1}^{p} \beta_i x_i$$
The predicted probability of misinformation ($y = 1$) is calculated via the standard sigmoid activation function:
$$P(\text{Fake} \mid \vec{x}) = \sigma(z) = \frac{1}{1 + e^{-z}}$$

### Three-Level Classification Thresholds
- **$P(\text{Fake}) < 0.35$**: **Likely Real** (High factual consistency)
- **$0.35 \le P(\text{Fake}) \le 0.65$**: **Suspicious / Needs Verification** (Ambiguous lexical signals)
- **$P(\text{Fake}) > 0.65$**: **Likely Fake** (Strong sensational/unverified markers)

## 3. Training and Export Instructions

1. Install Python dependencies:
   ```bash
   pip install -r ml/requirements.txt
   ```
2. Run model training and export:
   ```bash
   python ml/train_model.py
   ```
3. Generated artifacts:
   - `server/ml/model_export.json`: Vocabulary dictionary, IDF weights vector, coefficient vector $\vec{\beta}$, and intercept $\beta_0$.
   - `server/ml/metrics.json`: Test split accuracy, precision, recall, F1-score, and confusion matrix.
