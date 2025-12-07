import os
from datetime import timedelta
from pathlib import Path

class Config:
    BASE_DIR = Path(__file__).parent.parent
    ENV = os.getenv('FLASK_ENV', 'development')
    
    # Database - Use PostgreSQL on production
    if ENV == 'production':
        SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
        # Fix for SQLAlchemy 1.4+ with Heroku/Render postgres:// URLs
        if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
            SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
    else:
        # Use SQLite locally
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{BASE_DIR / 'instance' / 'tamper_detection.db'}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-app-secret')
    DEBUG = ENV != 'production'
    
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
