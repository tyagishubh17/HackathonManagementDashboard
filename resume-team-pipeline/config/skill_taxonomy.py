SKILL_TAXONOMY = {
    "Frontend": {
        "React": ["react", "react.js", "reactjs", "react js"],
        "Vue": ["vue", "vue.js", "vuejs"],
        "Angular": ["angular", "angular.js", "angularjs"],
        "HTML/CSS": ["html", "css", "html5", "css3", "sass", "scss", "tailwind", "tailwindcss"],
        "JavaScript": ["javascript", "js", "es6", "ecmascript"],
        "TypeScript": ["typescript", "ts"],
        "Next.js": ["next.js", "nextjs", "next js"],
        "UI Development": ["ui development", "frontend development", "front-end development", "front end"],
    },
    "Backend": {
        "Node.js": ["node.js", "nodejs", "node js", "node"],
        "Express": ["express", "express.js", "expressjs"],
        "Django": ["django"],
        "Flask": ["flask"],
        "FastAPI": ["fastapi", "fast api"],
        "Spring Boot": ["spring boot", "spring", "springboot"],
        "Java": ["java"],
        "Python": ["python", "python3", "py"],
        "PHP": ["php", "laravel"],
        "Ruby on Rails": ["ruby on rails", "rails", "ruby"],
        "Go": ["golang", "go lang", " go "],
        "REST API": ["rest api", "restful", "rest apis", "api development"],
        "GraphQL": ["graphql"],
        "Microservices": ["microservices", "microservice architecture"],
    },
    "Database": {
        "MongoDB": ["mongodb", "mongo db", "mongo"],
        "MySQL": ["mysql"],
        "PostgreSQL": ["postgresql", "postgres", "psql"],
        "SQL": ["sql", "sql server", "t-sql"],
        "Firebase": ["firebase", "firestore"],
        "Redis": ["redis"],
        "SQLite": ["sqlite"],
    },
    "AI/ML": {
        "Machine Learning": ["machine learning", "ml", "scikit-learn", "sklearn"],
        "Deep Learning": ["deep learning", "neural network", "neural networks", "dl"],
        "NLP": ["nlp", "natural language processing", "spacy", "nltk", "transformers"],
        "Computer Vision": ["computer vision", "cv", "opencv", "image processing"],
        "TensorFlow": ["tensorflow", "tensor flow", "keras"],
        "PyTorch": ["pytorch", "py torch"],
        "Data Science": ["data science", "data scientist"],
        "Pandas/NumPy": ["pandas", "numpy"],
        "Generative AI": ["generative ai", "genai", "gen ai", "llm", "large language model", "prompt engineering", "openai", "gpt"],
    },
    "Data/Analytics": {
        "Data Analysis": ["data analysis", "data analytics", "data analyst"],
        "Power BI": ["power bi", "powerbi"],
        "Tableau": ["tableau"],
        "Excel": ["excel", "ms excel", "advanced excel"],
        "Data Visualization": ["data visualization", "data viz", "matplotlib", "seaborn"],
        "Statistics": ["statistics", "statistical analysis"],
        "Big Data": ["big data", "hadoop", "spark", "pyspark"],
    },
    "DevOps/Cloud": {
        "AWS": ["aws", "amazon web services", "ec2", "s3 bucket"],
        "Azure": ["azure", "microsoft azure"],
        "GCP": ["gcp", "google cloud", "google cloud platform"],
        "Docker": ["docker", "containerization"],
        "Kubernetes": ["kubernetes", "k8s"],
        "CI/CD": ["ci/cd", "cicd", "continuous integration", "jenkins", "github actions"],
        "Linux": ["linux", "unix", "bash scripting", "shell scripting"],
        "Git": ["git", "github", "gitlab", "version control"],
    },
    "Mobile": {
        "Android": ["android", "android development", "kotlin"],
        "iOS": ["ios", "swift", "swiftui", "xcode"],
        "React Native": ["react native"],
        "Flutter": ["flutter", "dart"],
    },
    "Design": {
        "UI/UX Design": ["ui/ux", "ui ux", "ux design", "ui design", "user experience", "user interface design"],
        "Figma": ["figma"],
        "Adobe XD": ["adobe xd", "xd"],
        "Photoshop": ["photoshop", "adobe photoshop"],
        "Illustrator": ["illustrator", "adobe illustrator"],
        "Canva": ["canva"],
        "Prototyping": ["prototyping", "wireframing", "wireframe"],
    },
    "Core CS": {
        "DSA": ["data structures", "dsa", "algorithms", "data structures and algorithms"],
        "C++": ["c++", "cpp"],
        "C": [" c programming", "c language"],
        "OOP": ["oop", "object oriented programming", "object-oriented"],
        "System Design": ["system design", "distributed systems"],
    },
    "Soft/Leadership": {
        "Project Management": ["project management", "agile", "scrum", "jira"],
        "Team Leadership": ["team lead", "team leadership", "led a team", "leadership"],
        "Public Speaking": ["public speaking", "presentation skills"],
        "Hackathon Experience": ["hackathon", "hackathons", "won hackathon"],
    },
}

def get_flat_skill_list():
    flat = []
    for category, skills in SKILL_TAXONOMY.items():
        for canonical_name, surface_forms in skills.items():
            for form in surface_forms:
                flat.append((canonical_name, category, form.strip()))
    return flat

def get_categories():
    return list(SKILL_TAXONOMY.keys())
