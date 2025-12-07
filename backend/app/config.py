import os
from datetime import timedelta
from pathlib import Path


class Config:
    BASE_DIR = Path(__file__).parent.parent
    
    # Get DATABASE_URL first
    DATABASE_URL = os.getenv('DATABASE_URL')
    
    # Database - Use PostgreSQL if DATABASE_URL exists, else SQLite
    if DATABASE_URL:
        # Running on Render with PostgreSQL
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
        # Fix for SQLAlchemy 1.4+ with postgres:// URLs
        if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
            SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
    else:
        # Local development with SQLite
        INSTANCE_PATH = BASE_DIR / 'instance'
        INSTANCE_PATH.mkdir(exist_ok=True)
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{INSTANCE_PATH / 'tamper_detection.db'}"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Application
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-app-secret-key')
    DEBUG = os.getenv('FLASK_ENV', 'development') != 'production'
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',')
