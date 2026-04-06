from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def calculate_tfidf_match(resume_text, job_description):
    """
    Calculate the similarity between a resume and job description
    using TF-IDF vectorization and Cosine Similarity.
    
    Args:
        resume_text: Preprocessed resume text
        job_description: Preprocessed job description text
    
    Returns:
        float: Similarity score between 0 and 100
    """
    if not resume_text or not job_description:
        return 0.0

    # Combine documents for TF-IDF fitting
    documents = [job_description, resume_text]

    # Create TF-IDF vectors
    vectorizer = TfidfVectorizer(
        stop_words='english',
        max_features=5000,
        ngram_range=(1, 2),  # Use unigrams and bigrams
        min_df=1
    )

    tfidf_matrix = vectorizer.fit_transform(documents)

    # Calculate cosine similarity
    # First document is job description (index 0), second is resume (index 1)
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])

    # Convert to percentage (0-100)
    score = float(similarity[0][0]) * 100

    return round(score, 2)


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
