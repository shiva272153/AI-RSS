from flask import Flask, request, jsonify
from flask_cors import CORS
from text_extractor import extract_text
from preprocessor import preprocess_text
from matcher import (
    calculate_tfidf_match, calculate_skill_match_score,
    calculate_combined_score, load_trained_model,
    is_model_trained, get_model_info, predict_category
)
from skill_extractor import extract_skills, compare_skills

app = Flask(__name__)
CORS(app)

# ============ LOAD TRAINED MODEL ON STARTUP ============
print("🧠 ML Engine starting...")
model_loaded = load_trained_model()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'message': 'ML Engine is running',
        'model_trained': is_model_trained()
    })


@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model."""
    return jsonify(get_model_info())


@app.route('/extract-text', methods=['POST'])
def extract_text_endpoint():
    """
    Extract text from an uploaded resume file (PDF/DOCX).
    Also preprocesses the text and extracts skills.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        file_type = request.form.get('file_type', '')

        if not file_type:
            filename = file.filename.lower()
            if filename.endswith('.pdf'):
                file_type = 'pdf'
            elif filename.endswith('.docx'):
                file_type = 'docx'
            else:
                return jsonify({'error': 'Unsupported file type'}), 400

        # Read file bytes
        file_bytes = file.read()

        # Extract raw text
        extracted_text = extract_text(file_bytes, file_type)
        if not extracted_text:
            return jsonify({'error': 'Could not extract text from file'}), 400

        # Preprocess text
        processed_text = preprocess_text(extracted_text)

        # Extract skills
        skills = extract_skills(extracted_text)

        # Predict category (if model is trained)
        category_prediction = predict_category(processed_text)

        response = {
            'extracted_text': extracted_text,
            'processed_text': processed_text,
            'skills': skills
        }

        if category_prediction:
            response['predicted_category'] = category_prediction

        return jsonify(response)

    except Exception as e:
        print(f"Text extraction error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/preprocess', methods=['POST'])
def preprocess_endpoint():
    """Preprocess raw text using NLP pipeline."""
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        processed = preprocess_text(text)
        return jsonify({'processed_text': processed})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/calculate-match', methods=['POST'])
def calculate_match_endpoint():
    """
    Calculate match score between a resume and job description.
    Uses TF-IDF + Cosine Similarity and Skill Matching.
    
    If a trained model is loaded, the TF-IDF matching uses a vectorizer
    trained on 1,738 resumes for much better accuracy.
    """
    try:
        data = request.get_json()
        resume_text = data.get('resume_text', '')
        job_description = data.get('job_description', '')
        resume_skills = data.get('resume_skills', [])
        required_skills = data.get('required_skills', [])

        if not resume_text or not job_description:
            return jsonify({'error': 'Both resume_text and job_description are required'}), 400

        # Preprocess job description
        processed_job = preprocess_text(job_description)

        # Calculate TF-IDF match (uses trained model if available)
        tfidf_score = calculate_tfidf_match(resume_text, processed_job)

        # If no required skills specified, extract from job description
        if not required_skills:
            required_skills = extract_skills(job_description)

        # If no resume skills provided, extract from resume text
        if not resume_skills:
            resume_skills = extract_skills(resume_text)

        # Compare skills
        matched_skills, missing_skills = compare_skills(resume_skills, required_skills)

        # Calculate skill match score
        skill_score = calculate_skill_match_score(matched_skills, required_skills)

        # Calculate combined score
        combined_score = calculate_combined_score(tfidf_score, skill_score)

        # Predict resume category (if model is trained)
        category_prediction = predict_category(resume_text)

        response = {
            'match_score': combined_score,
            'tfidf_score': tfidf_score,
            'skill_score': skill_score,
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'resume_skills': resume_skills,
            'total_required_skills': len(required_skills),
            'model_trained': is_model_trained()
        }

        if category_prediction:
            response['predicted_category'] = category_prediction

        return jsonify(response)

    except Exception as e:
        print(f"Match calculation error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/predict-category', methods=['POST'])
def predict_category_endpoint():
    """Predict the job category of a resume text."""
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        if not is_model_trained():
            return jsonify({'error': 'Model not trained. Run train_model.py first.'}), 400

        processed = preprocess_text(text)
        prediction = predict_category(processed)

        if prediction:
            return jsonify(prediction)
        else:
            return jsonify({'error': 'Prediction failed'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/extract-skills', methods=['POST'])
def extract_skills_endpoint():
    """Extract skills from provided text."""
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        skills = extract_skills(text)
        return jsonify({'skills': skills})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("📡 Endpoints:")
    print("   POST /extract-text      - Extract text from PDF/DOCX")
    print("   POST /preprocess        - Preprocess text with NLP")
    print("   POST /calculate-match   - Calculate resume-job match")
    print("   POST /extract-skills    - Extract skills from text")
    print("   POST /predict-category  - Predict resume job category")
    print("   GET  /model-info        - Get trained model info")
    print("   GET  /health            - Health check")
    app.run(host='0.0.0.0', port=5001, debug=True)
