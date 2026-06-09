import re

# Headers regex patterns to locate sections
EDUCATION_HEADERS = [
    r'\beducation\b', r'\bacademics?\b', r'\bacacademic background\b',
    r'\bacacademic qualifications?\b', r'\bqualifications?\b', 
    r'\beducational background\b', r'\bstudy\b', r'\bschooling\b'
]

EXPERIENCE_HEADERS = [
    r'\bwork experience\b', r'\bexperience\b', r'\bemployment history\b',
    r'\bprofessional experience\b', r'\bwork history\b', r'\bcareer history\b',
    r'\bprofessional background\b', r'\bjob history\b'
]

CERTIFICATION_HEADERS = [
    r'\bcertifications?\b', r'\blicenses?\b', r'\baccreditations?\b',
    r'\bcredentials?\b', r'\bcourses?\b', r'\bcertificates?\b'
]

# Stop headers to demarcate section boundaries
ALL_SECTION_HEADERS = EDUCATION_HEADERS + EXPERIENCE_HEADERS + CERTIFICATION_HEADERS + [
    r'\bskills?\b', r'\btechnical skills?\b', r'\blanguages?\b',
    r'\bprojects?\b', r'\bkey projects?\b', r'\binterests?\b',
    r'\bpublications?\b', r'\bhobbies\b', r'\bco-curricular\b',
    r'\bextracurricular\b', r'\bsummary\b', r'\bprofile\b', r'\bobjective\b'
]

# Educational keywords for matching
DEGREE_KEYWORDS = [
    'bachelor', 'master', 'ph.d', 'phd', 'b.tech', 'm.tech', 'bca', 'mca',
    'b.sc', 'm.sc', 'b.e', 'm.e', 'degree', 'diploma', 'hsc', 'ssc', 'school',
    'university', 'college', 'institute', 'academy', 'technology', 'science',
    'engineering', 'arts', 'commerce', 'graduated', 'specialization', 'cgp', 'gpa', '%'
]

# Experience job indicators
JOB_TITLE_KEYWORDS = [
    'engineer', 'developer', 'manager', 'lead', 'analyst', 'consultant',
    'intern', 'designer', 'architect', 'administrator', 'specialist',
    'technician', 'executive', 'assistant', 'programmer', 'officer'
]

def clean_extracted_items(items):
    """Clean up and remove duplicate or empty entries."""
    cleaned = []
    seen = set()
    for item in items:
        # Strip bullets and whitespace
        item_clean = re.sub(r'^[•\-\*\s]+', '', item).strip()
        # Remove extra whitespace inside string
        item_clean = re.sub(r'\s+', ' ', item_clean)
        
        if item_clean and len(item_clean) > 4 and item_clean.lower() not in seen:
            cleaned.append(item_clean)
            seen.add(item_clean.lower())
    return cleaned

def extract_section_text(text, target_patterns):
    """Locate the section and return its raw lines."""
    lines = text.split('\n')
    section_lines = []
    in_section = False
    
    # Compile pattern regexes
    target_regexes = [re.compile(p, re.IGNORECASE) for p in target_patterns]
    stop_regexes = [re.compile(p, re.IGNORECASE) for p in ALL_SECTION_HEADERS]
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        # Check if line marks start of target section
        is_target_header = False
        for rx in target_regexes:
            # Check if line matches section header and is relatively short (typical for header)
            if rx.search(line_stripped.lower()) and len(line_stripped) < 40:
                is_target_header = True
                break
                
        if is_target_header:
            in_section = True
            continue # skip header line itself
            
        # Check if we reached a different section header
        if in_section:
            is_stop_header = False
            for rx in stop_regexes:
                # Make sure it's a stop header and NOT our own section header
                is_self = False
                for self_rx in target_regexes:
                    if self_rx.pattern == rx.pattern:
                        is_self = True
                        break
                        
                if not is_self and rx.search(line_stripped.lower()) and len(line_stripped) < 40:
                    is_stop_header = True
                    break
                    
            if is_stop_header:
                in_section = False
                break
                
            section_lines.append(line_stripped)
            
    return section_lines

def extract_education(text):
    """Extract education details from resume text."""
    edu_lines = extract_section_text(text, EDUCATION_HEADERS)
    
    # If no section found, search whole text for degree lines
    if not edu_lines:
        lines = text.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in ['bachelor', 'master', 'b.tech', 'university', 'college']):
                edu_lines.append(line.strip())
                
    # Filter lines containing educational keywords
    extracted = []
    for line in edu_lines:
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in DEGREE_KEYWORDS) or re.search(r'\b(19|20)\d{2}\b', line):
            extracted.append(line)
            
    # If filter emptied the list, keep the raw lines (up to 6)
    if not extracted and edu_lines:
        extracted = edu_lines[:6]
        
    return clean_extracted_items(extracted)

def extract_experience(text):
    """Extract professional experience lines."""
    exp_lines = extract_section_text(text, EXPERIENCE_HEADERS)
    
    # If no section found, search whole text for job/company lines
    if not exp_lines:
        lines = text.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in JOB_TITLE_KEYWORDS) and any(x in line_lower for x in ['at', 'company', 'inc', 'corp', 'solutions', 'technologies', 'limited', 'ltd']):
                exp_lines.append(line.strip())
                
    extracted = []
    # Identify relevant bullet points and job header lines
    for line in exp_lines:
        line_lower = line.lower()
        # Bullet points are usually highly informative
        is_bullet = line.startswith(('•', '-', '*'))
        # Lines specifying job titles or companies or years
        is_job_detail = any(kw in line_lower for kw in JOB_TITLE_KEYWORDS) or \
                         any(kw in line_lower for kw in ['present', '201', '202', 'ltd', 'inc', 'corp'])
                         
        if is_bullet or is_job_detail or len(line) > 30:
            extracted.append(line)
            
    if not extracted and exp_lines:
        extracted = exp_lines[:10] # fall back to top 10 raw lines
        
    return clean_extracted_items(extracted)

def extract_certifications(text):
    """Extract list of certifications."""
    cert_lines = extract_section_text(text, CERTIFICATION_HEADERS)
    
    # If no section found, scan whole document for typical cert names
    if not cert_lines:
        lines = text.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in ['certified', 'certification', 'udemy', 'coursera', 'aws certified']):
                cert_lines.append(line.strip())
                
    extracted = []
    for line in cert_lines:
        line_lower = line.lower()
        # Filter out generic descriptions or header lines
        if len(line) < 100 and (any(kw in line_lower for kw in ['certified', 'certification', 'udemy', 'coursera', 'license', 'credential', 'academy']) or line.startswith(('•', '-', '*'))):
            extracted.append(line)
            
    if not extracted and cert_lines:
        extracted = cert_lines[:8]
        
    return clean_extracted_items(extracted)

def extract_structured_info(text):
    """Main extraction routine returning structured JSON data."""
    if not text:
        return {'education': [], 'experience': [], 'certifications': []}
        
    return {
        'education': extract_education(text),
        'experience': extract_experience(text),
        'certifications': extract_certifications(text)
    }
