import os
from app import create_app

env = os.getenv('FLASK_ENV', 'development')
app = create_app(env)

# Debug: Print configuration
print(f"🔧 Environment: {env}")
print(f"🔧 DATABASE_URL exists: {bool(os.getenv('DATABASE_URL'))}")
print(f"🔧 SQLALCHEMY_DATABASE_URI: {app.config.get('SQLALCHEMY_DATABASE_URI', 'NOT SET')[:50]}...")
print(f"🔧 CORS_ORIGINS: {app.config.get('CORS_ORIGINS')}")

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(
        host='0.0.0.0',
        port=port,
        debug=env != 'production'
    )
