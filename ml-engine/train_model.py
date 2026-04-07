"""
=============================================================
  AI Resume Screening System — Model Training Script
=============================================================
  This script:
    1. Loads the Resume.csv dataset (2484 resumes, 24 categories)
    2. Preprocesses all resume text using the NLP pipeline
    3. Splits into Train (70%) / Test (20%) / Validation (10%)
       using STRATIFIED split to preserve category proportions
    4. Trains a TF-IDF vectorizer on the training set
    5. Trains a category classifier (for resume categorization)
    6. Evaluates accuracy on the test set
    7. Saves everything to ml-engine/model/
=============================================================
"""

import os
import sys
import json
import time
import pandas as pd
import numpy as np
import joblib
from datetime import datetime

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.multiclass import OneVsRestClassifier
from sklearn.svm import LinearSVC
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))
from preprocessor import preprocess_text

# ============ CONFIGURATION ============
DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', 'resume-dataset', 'Resume', 'Resume.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')

# Split ratios
TRAIN_RATIO = 0.70
TEST_RATIO = 0.20
VALIDATION_RATIO = 0.10

# TF-IDF settings
TFIDF_MAX_FEATURES = 5000
TFIDF_NGRAM_RANGE = (1, 2)  # Unigrams + Bigrams

RANDOM_STATE = 42  # For reproducibility


def load_dataset():
    """Load and validate the resume dataset."""
    print("📂 Loading dataset...")
    
    if not os.path.exists(DATASET_PATH):
        print(f"❌ Dataset not found at: {DATASET_PATH}")
        sys.exit(1)
    
    df = pd.read_csv(DATASET_PATH)
    print(f"   ✅ Loaded {len(df)} resumes with {df['Category'].nunique()} categories")
    print(f"   Columns: {list(df.columns)}")
    print(f"   Null values: {df.isnull().sum().sum()}")
    
    return df


def preprocess_dataset(df):
    """Preprocess all resume text using the NLP pipeline."""
    print("\n🔄 Preprocessing resume text (this may take 1-2 minutes)...")
    
    start_time = time.time()
    total = len(df)
    processed_texts = []
    
    for i, text in enumerate(df['Resume_str']):
        processed = preprocess_text(str(text))
        processed_texts.append(processed)
        
        # Progress indicator
        if (i + 1) % 200 == 0 or (i + 1) == total:
            elapsed = time.time() - start_time
            pct = ((i + 1) / total) * 100
            print(f"   [{i+1}/{total}] {pct:.0f}% — {elapsed:.1f}s elapsed")
    
    df['processed_text'] = processed_texts
    elapsed = time.time() - start_time
    print(f"   ✅ Preprocessing complete in {elapsed:.1f} seconds")
    
    return df


def split_dataset(df):
    """
    Split dataset into Train/Test/Validation using STRATIFIED split.
    Stratified = each split has the same proportion of each category.
    """
    print(f"\n✂️  Splitting dataset (70/20/10)...")
    
    X = df['processed_text']
    y = df['Category']
    
    # First split: 70% train, 30% temp (which will be split into 20% test + 10% val)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y,
        test_size=(TEST_RATIO + VALIDATION_RATIO),
        random_state=RANDOM_STATE,
        stratify=y
    )
    
    # Second split: split the 30% into 20% test + 10% validation
    # 20/30 = 0.6667 for test, 10/30 = 0.3333 for validation
    test_ratio_adjusted = TEST_RATIO / (TEST_RATIO + VALIDATION_RATIO)
    
    X_test, X_val, y_test, y_val = train_test_split(
        X_temp, y_temp,
        test_size=(1 - test_ratio_adjusted),
        random_state=RANDOM_STATE,
        stratify=y_temp
    )
    
    print(f"   Training set:    {len(X_train):>5} resumes ({len(X_train)/len(df)*100:.1f}%)")
    print(f"   Testing set:     {len(X_test):>5} resumes ({len(X_test)/len(df)*100:.1f}%)")
    print(f"   Validation set:  {len(X_val):>5} resumes ({len(X_val)/len(df)*100:.1f}%)")
    
    # Verify stratification
    print(f"\n   Category distribution check:")
    for cat in sorted(y.unique()):
        train_pct = (y_train == cat).sum() / len(y_train) * 100
        test_pct = (y_test == cat).sum() / len(y_test) * 100
        val_pct = (y_val == cat).sum() / len(y_val) * 100
        print(f"     {cat:30s}  Train: {train_pct:5.1f}%  Test: {test_pct:5.1f}%  Val: {val_pct:5.1f}%")
    
    return X_train, X_test, X_val, y_train, y_test, y_val


def train_model(X_train, y_train):
    """
    Train TF-IDF vectorizer and category classifier.
    
    The TF-IDF vectorizer is fitted on 1,738 training resumes,
    learning which words/phrases are truly important across the corpus.
    
    The classifier learns to predict job categories from resume text.
    """
    print(f"\n🧠 Training model...")
    start_time = time.time()
    
    # Step 1: Encode categories
    print("   Step 1/3: Encoding categories...")
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y_train)
    print(f"   ✅ {len(label_encoder.classes_)} categories encoded: {list(label_encoder.classes_)}")
    
    # Step 2: Train TF-IDF Vectorizer
    print(f"   Step 2/3: Training TF-IDF vectorizer (max_features={TFIDF_MAX_FEATURES})...")
    tfidf_vectorizer = TfidfVectorizer(
        stop_words='english',
        max_features=TFIDF_MAX_FEATURES,
        ngram_range=TFIDF_NGRAM_RANGE,
        sublinear_tf=True,       # Apply log to term frequencies
        min_df=2,                # Ignore terms appearing in < 2 docs
        max_df=0.95              # Ignore terms appearing in > 95% of docs
    )
    
    X_train_tfidf = tfidf_vectorizer.fit_transform(X_train)
    print(f"   ✅ TF-IDF matrix shape: {X_train_tfidf.shape}")
    print(f"   ✅ Vocabulary size: {len(tfidf_vectorizer.vocabulary_)}")
    
    # Step 3: Train Classifier (OneVsRest with LinearSVC — fast and effective)
    print("   Step 3/3: Training category classifier (LinearSVC)...")
    classifier = OneVsRestClassifier(LinearSVC(random_state=RANDOM_STATE, max_iter=2000))
    classifier.fit(X_train_tfidf, y_encoded)
    
    elapsed = time.time() - start_time
    print(f"   ✅ Training complete in {elapsed:.1f} seconds")
    
    return tfidf_vectorizer, classifier, label_encoder


def evaluate_model(tfidf_vectorizer, classifier, label_encoder, X_test, y_test, split_name="Test"):
    """Evaluate model accuracy on a given dataset split."""
    print(f"\n📊 Evaluating on {split_name} set ({len(X_test)} resumes)...")
    
    # Transform test data using the trained vectorizer
    X_test_tfidf = tfidf_vectorizer.transform(X_test)
    
    # Predict
    y_encoded = label_encoder.transform(y_test)
    y_pred = classifier.predict(X_test_tfidf)
    
    # Accuracy
    accuracy = accuracy_score(y_encoded, y_pred)
    print(f"   ✅ Overall Accuracy: {accuracy * 100:.2f}%")
    
    # Per-category report
    y_pred_labels = label_encoder.inverse_transform(y_pred)
    report = classification_report(y_test, y_pred_labels, output_dict=True, zero_division=0)
    report_text = classification_report(y_test, y_pred_labels, zero_division=0)
    
    print(f"\n   Per-Category Report:")
    print("   " + "-" * 65)
    print(f"   {'Category':<30} {'Precision':>10} {'Recall':>10} {'F1-Score':>10}")
    print("   " + "-" * 65)
    
    for cat in sorted(label_encoder.classes_):
        if cat in report:
            r = report[cat]
            print(f"   {cat:<30} {r['precision']:>10.2f} {r['recall']:>10.2f} {r['f1-score']:>10.2f}")
    
    print("   " + "-" * 65)
    print(f"   {'OVERALL ACCURACY':<30} {'':>10} {'':>10} {accuracy:>10.2f}")
    
    return accuracy, report, report_text


def save_model(tfidf_vectorizer, classifier, label_encoder, 
               X_train, X_test, X_val, y_train, y_test, y_val,
               train_accuracy, test_accuracy, test_report, df):
    """Save trained model and datasets to disk."""
    print(f"\n💾 Saving model and datasets to {MODEL_DIR}/...")
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Save models
    joblib.dump(tfidf_vectorizer, os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl'))
    joblib.dump(classifier, os.path.join(MODEL_DIR, 'classifier.pkl'))
    joblib.dump(label_encoder, os.path.join(MODEL_DIR, 'label_encoder.pkl'))
    print("   ✅ Saved: tfidf_vectorizer.pkl, classifier.pkl, label_encoder.pkl")
    
    # Save split datasets as CSV
    train_df = pd.DataFrame({'processed_text': X_train, 'Category': y_train})
    test_df = pd.DataFrame({'processed_text': X_test, 'Category': y_test})
    val_df = pd.DataFrame({'processed_text': X_val, 'Category': y_val})
    
    train_df.to_csv(os.path.join(MODEL_DIR, 'train_data.csv'), index=False)
    test_df.to_csv(os.path.join(MODEL_DIR, 'test_data.csv'), index=False)
    val_df.to_csv(os.path.join(MODEL_DIR, 'validation_data.csv'), index=False)
    print("   ✅ Saved: train_data.csv, test_data.csv, validation_data.csv")
    
    # Save training report
    report = {
        'trained_at': datetime.now().isoformat(),
        'dataset': {
            'total_resumes': len(df),
            'categories': int(df['Category'].nunique()),
            'category_list': sorted(df['Category'].unique().tolist()),
            'csv_path': os.path.abspath(DATASET_PATH)
        },
        'split': {
            'train_size': len(X_train),
            'test_size': len(X_test),
            'validation_size': len(X_val),
            'ratios': '70/20/10',
            'stratified': True,
            'random_state': RANDOM_STATE
        },
        'model': {
            'tfidf_max_features': TFIDF_MAX_FEATURES,
            'tfidf_ngram_range': list(TFIDF_NGRAM_RANGE),
            'vocabulary_size': len(tfidf_vectorizer.vocabulary_),
            'classifier': 'OneVsRest(LinearSVC)',
        },
        'accuracy': {
            'train': round(train_accuracy * 100, 2),
            'test': round(test_accuracy * 100, 2),
        },
        'test_classification_report': test_report
    }
    
    with open(os.path.join(MODEL_DIR, 'training_report.json'), 'w') as f:
        json.dump(report, f, indent=2)
    print("   ✅ Saved: training_report.json")


def main():
    print("=" * 60)
    print("  AI Resume Screening — Model Training")
    print("  Dataset: 2484 resumes, 24 categories")
    print("  Split: 70% Train / 20% Test / 10% Validation")
    print("=" * 60)
    
    total_start = time.time()
    
    # Step 1: Load dataset
    df = load_dataset()
    
    # Step 2: Preprocess
    df = preprocess_dataset(df)
    
    # Step 3: Split
    X_train, X_test, X_val, y_train, y_test, y_val = split_dataset(df)
    
    # Step 4: Train
    tfidf_vectorizer, classifier, label_encoder = train_model(X_train, y_train)
    
    # Step 5: Evaluate on training set (should be high)
    train_accuracy, _, _ = evaluate_model(
        tfidf_vectorizer, classifier, label_encoder, X_train, y_train, "Training"
    )
    
    # Step 6: Evaluate on test set (the real accuracy)
    test_accuracy, test_report, test_report_text = evaluate_model(
        tfidf_vectorizer, classifier, label_encoder, X_test, y_test, "Test"
    )
    
    # Step 7: Save everything
    save_model(
        tfidf_vectorizer, classifier, label_encoder,
        X_train, X_test, X_val, y_train, y_test, y_val,
        train_accuracy, test_accuracy, test_report, df
    )
    
    total_elapsed = time.time() - total_start
    
    print("\n" + "=" * 60)
    print("  ✅ TRAINING COMPLETE!")
    print("=" * 60)
    print(f"  Total time:        {total_elapsed:.1f} seconds")
    print(f"  Training accuracy: {train_accuracy * 100:.2f}%")
    print(f"  Test accuracy:     {test_accuracy * 100:.2f}%")
    print(f"  Model saved to:    {os.path.abspath(MODEL_DIR)}/")
    print(f"\n  Next step: Run 'python evaluate_model.py' to validate")
    print(f"  with the held-out 10% validation set.")
    print("=" * 60)


if __name__ == '__main__':
    main()
