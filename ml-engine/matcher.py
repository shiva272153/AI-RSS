"""
=============================================================
  Resume-Job Matching Engine
=============================================================
  Uses a pre-trained TF-IDF vectorizer (trained on 1,738 resumes)
  for better match scores. Falls back to ad-hoc matching if
  the trained model is not available.
=============================================================
"""

import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')

# ============ PRE-TRAINED MODEL LOADER ============

_trained_vectorizer = None
_trained_classifier = None
_label_encoder = None
_model_loaded = False


def load_trained_model():
    """Load the pre-trained TF-IDF vectorizer and classifier from disk."""
    global _trained_vectorizer, _trained_classifier, _label_encoder, _model_loaded

    vectorizer_path = os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl')
    classifier_path = os.path.join(MODEL_DIR, 'classifier.pkl')
    encoder_path = os.path.join(MODEL_DIR, 'label_encoder.pkl')

    if os.path.exists(vectorizer_path) and os.path.exists(classifier_path):
        try:
            _trained_vectorizer = joblib.load(vectorizer_path)
            _trained_classifier = joblib.load(classifier_path)
            _label_encoder = joblib.load(encoder_path)
            _model_loaded = True
            print("✅ Trained model loaded successfully")
            print(f"   Vocabulary size: {len(_trained_vectorizer.vocabulary_)}")
            print(f"   Categories: {len(_label_encoder.classes_)}")
            return True
        except Exception as e:
            print(f"⚠️  Failed to load trained model: {e}")
            _model_loaded = False
            return False
    else:
        print("⚠️  No trained model found. Using ad-hoc matching.")
        print("   Run 'python train_model.py' to train the model for better accuracy.")
        _model_loaded = False
        return False


def is_model_trained():
    """Check if a trained model is loaded."""
    return _model_loaded


def get_model_info():
    """Get information about the loaded model."""
    if not _model_loaded:
        return {'trained': False, 'message': 'No trained model loaded'}

    report_path = os.path.join(MODEL_DIR, 'training_report.json')
    info = {
        'trained': True,
        'vocabulary_size': len(_trained_vectorizer.vocabulary_),
        'categories': list(_label_encoder.classes_),
        'num_categories': len(_label_encoder.classes_)
    }

    if os.path.exists(report_path):
        import json
        with open(report_path, 'r') as f:
            report = json.load(f)
        info.update({
            'trained_at': report.get('trained_at'),
            'train_size': report['split']['train_size'],
            'test_accuracy': report['accuracy']['test'],
            'train_accuracy': report['accuracy']['train']
        })

    return info


# ============ MATCHING FUNCTIONS ============

def calculate_tfidf_match(resume_text, job_description):
    """
    Calculate the similarity between a resume and job description
    using TF-IDF vectorization and Cosine Similarity.

    If a pre-trained model is loaded, it uses the trained vectorizer
    (fitted on 1,738 resumes) for much better accuracy.
    Otherwise, falls back to ad-hoc 2-document matching.

    Args:
        resume_text: Preprocessed resume text
        job_description: Preprocessed job description text

    Returns:
        float: Similarity score between 0 and 100
    """
    if not resume_text or not job_description:
        return 0.0

    if _model_loaded and _trained_vectorizer is not None:
        # ===== TRAINED MODEL (better accuracy) =====
        # Transform both texts using the pre-trained vectorizer
        vectors = _trained_vectorizer.transform([job_description, resume_text])
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])
        score = float(similarity[0][0]) * 100
    else:
        # ===== FALLBACK: Ad-hoc matching =====
        documents = [job_description, resume_text]
        vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=5000,
            ngram_range=(1, 2),
            min_df=1
        )
        tfidf_matrix = vectorizer.fit_transform(documents)
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        score = float(similarity[0][0]) * 100

    return round(score, 2)


def predict_category(resume_text):
    """
    Predict the job category of a resume using the trained classifier.

    Args:
        resume_text: Preprocessed resume text

    Returns:
        dict: {'category': str, 'confidence': float} or None if not trained
    """
    if not _model_loaded or _trained_classifier is None:
        return None

    try:
        vector = _trained_vectorizer.transform([resume_text])
        prediction = _trained_classifier.predict(vector)
        category = _label_encoder.inverse_transform(prediction)[0]

        # Get decision scores for confidence
        decision_scores = _trained_classifier.decision_function(vector)[0]
        # Convert to rough probability using softmax-like normalization
        import numpy as np
        exp_scores = np.exp(decision_scores - np.max(decision_scores))
        probabilities = exp_scores / exp_scores.sum()
        confidence = float(np.max(probabilities)) * 100

        return {
            'category': category,
            'confidence': round(confidence, 2),
            'all_categories': {
                _label_encoder.inverse_transform([i])[0]: round(float(probabilities[i]) * 100, 2)
                for i in np.argsort(probabilities)[-5:][::-1]  # Top 5
            }
        }
    except Exception as e:
        print(f"Category prediction error: {e}")
        return None


def calculate_skill_match_score(matched_skills, required_skills):
    """
    Calculate a skill-based match score.

    Args:
        matched_skills: List of skills found in both resume and job
        required_skills: List of skills required by the job

    Returns:
        float: Skill match percentage (0-100)
    """
    if not required_skills:
        return 100.0

    score = (len(matched_skills) / len(required_skills)) * 100
    return round(score, 2)


def calculate_combined_score(tfidf_score, skill_score, tfidf_weight=0.6, skill_weight=0.4):
    """
    Calculate a combined match score using both TF-IDF and skill matching.

    The combined approach gives:
    - 60% weight to TF-IDF (overall content similarity)
    - 40% weight to skill matching (specific skill overlap)

    Args:
        tfidf_score: TF-IDF cosine similarity score (0-100)
        skill_score: Skill match score (0-100)
        tfidf_weight: Weight for TF-IDF score (default 0.6)
        skill_weight: Weight for skill score (default 0.4)

    Returns:
        float: Combined match score (0-100)
    """
    combined = (tfidf_score * tfidf_weight) + (skill_score * skill_weight)
    return round(combined, 2)
