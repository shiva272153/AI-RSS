"""
=============================================================
  AI Resume Screening System — Model Validation Script
=============================================================
  This script uses the HELD-OUT 10% validation set that the
  model has NEVER seen during training or testing.
  
  Use this to confirm the model's real-world accuracy.
  Show these results to your project guide.
=============================================================
"""

import os
import sys
import json
import pandas as pd
import numpy as np
import joblib

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')


def load_model():
    """Load the trained model artifacts."""
    print("📂 Loading trained model...")
    
    required_files = [
        'tfidf_vectorizer.pkl',
        'classifier.pkl', 
        'label_encoder.pkl',
        'validation_data.csv',
        'training_report.json'
    ]
    
    for f in required_files:
        path = os.path.join(MODEL_DIR, f)
        if not os.path.exists(path):
            print(f"❌ Missing file: {path}")
            print("   Please run 'python train_model.py' first!")
            sys.exit(1)
    
    tfidf = joblib.load(os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl'))
    clf = joblib.load(os.path.join(MODEL_DIR, 'classifier.pkl'))
    le = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.pkl'))
    
    with open(os.path.join(MODEL_DIR, 'training_report.json'), 'r') as f:
        report = json.load(f)
    
    print(f"   ✅ Model loaded (trained on {report['split']['train_size']} resumes)")
    print(f"   ✅ Test accuracy was: {report['accuracy']['test']}%")
    
    return tfidf, clf, le, report


def validate():
    """Run validation on the held-out 10% dataset."""
    tfidf, clf, le, report = load_model()
    
    # Load validation data
    val_df = pd.read_csv(os.path.join(MODEL_DIR, 'validation_data.csv'))
    print(f"\n📊 Validation set: {len(val_df)} resumes (held-out 10%)")
    print(f"   Categories present: {val_df['Category'].nunique()}")
    
    X_val = val_df['processed_text'].fillna('')
    y_val = val_df['Category']
    
    # Transform and predict
    X_val_tfidf = tfidf.transform(X_val)
    y_encoded = le.transform(y_val)
    y_pred = clf.predict(X_val_tfidf)
    y_pred_labels = le.inverse_transform(y_pred)
    
    # Accuracy
    accuracy = accuracy_score(y_encoded, y_pred)
    
    print("\n" + "=" * 70)
    print("  VALIDATION RESULTS (10% held-out data — model never saw these)")
    print("=" * 70)
    
    # Per-category table
    report_dict = classification_report(y_val, y_pred_labels, output_dict=True, zero_division=0)
    
    print(f"\n  {'Category':<30} {'Precision':>10} {'Recall':>10} {'F1-Score':>10} {'Support':>10}")
    print("  " + "-" * 70)
    
    correct_total = 0
    wrong_total = 0
    
    for cat in sorted(le.classes_):
        if cat in report_dict:
            r = report_dict[cat]
            support = int(r['support'])
            correct = int(round(r['recall'] * support))
            wrong = support - correct
            correct_total += correct
            wrong_total += wrong
            
            # Color indicator
            indicator = "✅" if r['f1-score'] >= 0.7 else ("⚠️" if r['f1-score'] >= 0.4 else "❌")
            print(f"  {indicator} {cat:<28} {r['precision']:>10.2f} {r['recall']:>10.2f} {r['f1-score']:>10.2f} {support:>10}")
    
    print("  " + "-" * 70)
    print(f"  {'OVERALL ACCURACY':<30} {'':>10} {'':>10} {accuracy:>10.2f} {len(val_df):>10}")
    print(f"\n  ✅ Correctly classified: {correct_total}/{len(val_df)} resumes")
    print(f"  ❌ Misclassified:       {wrong_total}/{len(val_df)} resumes")
    
    # Accuracy comparison
    print(f"\n  📈 Accuracy Comparison:")
    print(f"     Training accuracy:   {report['accuracy']['train']}%")
    print(f"     Test accuracy:       {report['accuracy']['test']}%")
    print(f"     Validation accuracy: {accuracy * 100:.2f}% ← YOUR CONFIRMATION")
    
    # Show some misclassified examples
    misclassified = y_val.values != y_pred_labels
    if misclassified.any():
        print(f"\n  📋 Sample Misclassifications (up to 5):")
        mis_indices = np.where(misclassified)[0][:5]
        for idx in mis_indices:
            actual = y_val.values[idx]
            predicted = y_pred_labels[idx]
            text_preview = str(X_val.values[idx])[:80]
            print(f"     Actual: {actual:<25} Predicted: {predicted:<25}")
            print(f"     Text: \"{text_preview}...\"")
            print()
    
    # Final verdict
    print("=" * 70)
    if accuracy >= 0.80:
        print(f"  🎉 EXCELLENT! {accuracy*100:.1f}% accuracy — Model is performing great!")
    elif accuracy >= 0.60:
        print(f"  👍 GOOD! {accuracy*100:.1f}% accuracy — Model is performing well.")
    else:
        print(f"  ⚠️  {accuracy*100:.1f}% accuracy — Model needs improvement.")
    print("=" * 70)
    
    return accuracy


if __name__ == '__main__':
    validate()
