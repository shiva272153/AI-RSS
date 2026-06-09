import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Download required NLTK data only if not already present
def _ensure_nltk_data():
    packages = ['punkt', 'punkt_tab', 'stopwords', 'wordnet']
    for pkg in packages:
        try:
            nltk.data.find(f'tokenizers/{pkg}' if 'punkt' in pkg else f'corpora/{pkg}')
        except LookupError:
            nltk.download(pkg, quiet=True)

_ensure_nltk_data()


def clean_text(text):
    """Remove special characters, extra whitespace, and normalize text."""
    # Convert to lowercase
    text = text.lower()
    # Remove URLs
    text = re.sub(r'http\S+|www\S+', '', text)
    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)
    # Remove phone numbers
    text = re.sub(r'[\+]?[\d\s\-\(\)]{7,15}', '', text)
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def preprocess_text(text):
    """Full NLP preprocessing pipeline: clean, tokenize, remove stopwords, lemmatize."""
    # Clean the text
    cleaned = clean_text(text)

    # Tokenize
    tokens = word_tokenize(cleaned)

    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [token for token in tokens if token not in stop_words and len(token) > 2]

    # Lemmatize
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(token) for token in tokens]

    return ' '.join(tokens)
