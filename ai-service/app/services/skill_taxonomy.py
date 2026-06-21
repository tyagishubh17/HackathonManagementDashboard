SKILL_TAXONOMY = {
    "Frontend": {
        "React": ["react", "react.js", "reactjs", "react js", "react developer", "reactjs developer", "react.js developer"],
        "Vue": ["vue", "vue.js", "vuejs", "vue developer", "vuejs developer"],
        "Angular": ["angular", "angular.js", "angularjs", "angular developer", "angularjs developer"],
        "HTML/CSS": ["html", "css", "html5", "css3", "sass", "scss", "tailwind", "tailwindcss", "web design"],
        "JavaScript": ["javascript", "js", "es6", "ecmascript", "javascript developer", "js developer"],
        "TypeScript": ["typescript", "ts", "typescript developer"],
        "Next.js": ["next.js", "nextjs", "next js", "next.js developer"],
        "UI Development": ["ui development", "frontend development", "front-end development", "front end", "frontend developer", "front-end developer", "frontend engineer"],
    },
    "Backend": {
        "Node.js": ["node.js", "nodejs", "node js", "node", "node developer", "nodejs developer", "node.js developer"],
        "Express": ["express", "express.js", "expressjs"],
        "Django": ["django", "django developer"],
        "Flask": ["flask", "flask developer"],
        "FastAPI": ["fastapi", "fast api"],
        "Spring Boot": ["spring boot", "spring", "springboot", "spring boot developer"],
        "Java": ["java", "java developer", "java programming"],
        "Python": ["python", "python3", "py", "python developer", "python programming", "python scripting"],
        "PHP": ["php", "laravel", "php developer"],
        "Ruby on Rails": ["ruby on rails", "rails", "ruby", "rails developer"],
        "Go": ["golang", "go lang", " go ", "go developer", "golang developer"],
        "REST API": ["rest api", "restful", "rest apis", "api development", "api design"],
        "GraphQL": ["graphql"],
        "Microservices": ["microservices", "microservice architecture"],
    },
    "Database": {
        "MongoDB": ["mongodb", "mongo db", "mongo", "mongo developer"],
        "MySQL": ["mysql", "mysql database"],
        "PostgreSQL": ["postgresql", "postgres", "psql", "postgres developer"],
        "SQL": ["sql", "sql server", "t-sql", "sql developer", "sql programming"],
        "Firebase": ["firebase", "firestore"],
        "Redis": ["redis"],
        "SQLite": ["sqlite"],
    },
    "AI/ML": {
        "Artificial Intelligence": ["artificial intelligence", "ai", "artificial-intelligence", "ai engineer", "artificial intelligence engineer"],
        "Machine Learning": ["machine learning", "ml", "scikit-learn", "sklearn", "machine learning engineer", "ml engineer"],
        "Deep Learning": ["deep learning", "neural network", "neural networks", "dl", "deep learning engineer", "dl engineer"],
        "NLP": ["nlp", "natural language processing", "spacy", "nltk", "transformers", "nlp engineer"],
        "Computer Vision": ["computer vision", "cv", "opencv", "image processing", "computer vision engineer", "cv engineer"],
        "TensorFlow": ["tensorflow", "tensor flow", "keras"],
        "PyTorch": ["pytorch", "py torch"],
        "Data Science": ["data science", "data scientist", "data science engineer"],
        "Pandas/NumPy": ["pandas", "numpy"],
        "Generative AI": ["generative ai", "genai", "gen ai", "llm", "large language model", "prompt engineering", "openai", "gpt", "generative ai engineer"],
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
        "Android": ["android", "android development", "kotlin", "android developer"],
        "iOS": ["ios", "swift", "swiftui", "xcode", "ios developer"],
        "React Native": ["react native", "react native developer"],
        "Flutter": ["flutter", "dart", "flutter developer"],
    },
    "Design": {
        "UI/UX Design": ["ui/ux", "ui ux", "ux design", "ui design", "user experience", "user interface design", "ui/ux designer", "product designer"],
        "Figma": ["figma", "figma designer"],
        "Adobe XD": ["adobe xd", "xd"],
        "Photoshop": ["photoshop", "adobe photoshop"],
        "Illustrator": ["illustrator", "adobe illustrator"],
        "Canva": ["canva"],
        "Prototyping": ["prototyping", "wireframing", "wireframe"],
    },
    "Core CS": {
        "DSA": ["data structures", "dsa", "algorithms", "data structures and algorithms"],
        "C++": ["c++", "cpp", "c++ developer"],
        "C": [" c programming", "c language"],
        "OOP": ["oop", "object-oriented", "object oriented programming"],
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
