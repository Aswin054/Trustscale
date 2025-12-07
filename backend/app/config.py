import os
from datetime import timedelta
from pathlib import Path

class Config:
    # Base directory
    BASE_DIR = Path(__file__).parent.parent
    
    # Environment
    ENV = os.getenv('FLASK_ENV', 'development')
    
    # Database - Use PostgreSQL on production, SQLite locally
    if ENV == 'production':
        # Render provides DATABASE_URL for PostgreSQL
        SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
        if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
            SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{BASE_DIR / 'instance' / 'tamper_detection.db'}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Application
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-app-secret-key')
    DEBUG = ENV != 'production'
    
    # CORS - Allow your frontend domain
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # Create instance folder for local development
    if ENV != 'production':
        INSTANCE_PATH = BASE_DIR / 'instance'
        INSTANCE_PATH.mkdir(exist_ok=True)
