from flask import Flask
from flask_cors import CORS
from app.extensions import db, migrate, jwt
from app.config import Config
import os

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize CORS with frontend URL
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Register blueprints
    from app.api import auth_bp, devices_bp, weighing_scale_bp, energy_meter_bp, fuel_dispenser_bp, alerts_bp, blockchain_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(devices_bp, url_prefix='/api/devices')
    app.register_blueprint(weighing_scale_bp, url_prefix='/api/weighing-scale')
    app.register_blueprint(energy_meter_bp, url_prefix='/api/energy-meter')
    app.register_blueprint(fuel_dispenser_bp, url_prefix='/api/fuel-dispenser')
    app.register_blueprint(alerts_bp, url_prefix='/api/alerts')
    app.register_blueprint(blockchain_bp, url_prefix='/api/blockchain')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Tamper Detection API is running'}, 200
    
    @app.route('/')
    def index():
        return {'message': 'Tamper Detection API', 'version': '1.0.0'}, 200
    
    return app
