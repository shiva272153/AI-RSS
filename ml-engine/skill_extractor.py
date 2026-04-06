import json
import os
import re

# Load skills dataset
SKILLS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'skills_dataset.json')


def load_skills_dataset():
    """Load the skills dataset from JSON file."""
    try:
        with open(SKILLS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return get_default_skills()


def get_default_skills():
    """Return a default set of common technical and soft skills."""
    return {
        "programming_languages": [
            "python", "java", "javascript", "typescript", "c", "c++", "c#",
            "ruby", "php", "swift", "kotlin", "go", "rust", "scala", "r",
            "matlab", "perl", "dart", "lua", "shell", "bash", "sql", "html", "css"
        ],
        "frameworks": [
            "react", "angular", "vue", "next.js", "nuxt", "express", "django",
            "flask", "spring", "spring boot", "laravel", ".net", "asp.net",
            "ruby on rails", "fastapi", "flutter", "react native", "electron",
            "svelte", "tailwind", "bootstrap", "jquery", "node.js", "nodejs"
        ],
        "databases": [
            "mysql", "postgresql", "mongodb", "sqlite", "oracle", "redis",
            "elasticsearch", "dynamodb", "cassandra", "firebase", "supabase",
            "mariadb", "neo4j", "couchdb"
        ],
        "cloud_devops": [
            "aws", "azure", "gcp", "google cloud", "docker", "kubernetes",
            "jenkins", "terraform", "ansible", "ci/cd", "github actions",
            "gitlab ci", "nginx", "apache", "linux", "heroku", "vercel",
            "netlify", "cloudflare"
        ],
        "data_science_ml": [
            "machine learning", "deep learning", "tensorflow", "pytorch",
            "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn",
            "natural language processing", "nlp", "computer vision",
            "data analysis", "data visualization", "statistics",
            "neural network", "random forest", "regression", "classification",
            "clustering", "keras", "opencv", "spark", "hadoop", "tableau",
            "power bi"
        ],
        "tools": [
            "git", "github", "gitlab", "bitbucket", "jira", "confluence",
            "slack", "trello", "figma", "adobe", "photoshop", "postman",
            "swagger", "vs code", "intellij", "eclipse", "vim", "webpack",
            "vite", "npm", "yarn", "pip", "maven", "gradle"
        ],
        "soft_skills": [
            "leadership", "communication", "teamwork", "problem solving",
            "critical thinking", "time management", "project management",
            "agile", "scrum", "collaboration", "adaptability", "creativity",
            "analytical", "presentation", "mentoring", "negotiation"
        ],
        "concepts": [
            "rest api", "graphql", "microservices", "api", "oop",
            "object oriented", "design patterns", "solid", "mvc",
            "data structures", "algorithms", "system design", "testing",
            "unit testing", "integration testing", "tdd", "bdd",
            "responsive design", "seo", "accessibility", "security",
            "authentication", "authorization", "encryption"
        ]
    }


def extract_skills(text):
    """Extract skills from text by matching against skills dataset."""
    text_lower = text.lower()
    skills_db = load_skills_dataset()
    found_skills = set()

    for category, skills_list in skills_db.items():
        for skill in skills_list:
            # Use word boundary matching for short skills, substring for longer ones
            if len(skill) <= 3:
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.add(skill)
            else:
                if skill in text_lower:
                    found_skills.add(skill)

    return sorted(list(found_skills))


def compare_skills(resume_skills, required_skills):
    """Compare resume skills with required skills."""
    resume_set = set(s.lower() for s in resume_skills)
    required_set = set(s.lower() for s in required_skills)

    matched = sorted(list(resume_set & required_set))
    missing = sorted(list(required_set - resume_set))

    return matched, missing
