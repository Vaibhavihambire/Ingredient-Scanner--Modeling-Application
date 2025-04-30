# 📁 backend/app.py
from flask import Flask
from flask_cors import CORS
from auth import auth_bp, init_db
from predict import predict_bp

app = Flask(__name__)
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(predict_bp)

if __name__ == '__main__':
    init_db()  # Initialize SQLite DB
    app.run(host='0.0.0.0', port=5000)