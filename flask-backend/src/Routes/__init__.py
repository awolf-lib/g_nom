from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "SECRET_KEY_DEV"

    from .auth import auth
    from .db import db
    from .files import files
    from .taxa import taxa_bp
    from .users import users_bp
    from .assemblies import assemblies_bp

    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(db, url_prefix="/")
    app.register_blueprint(files, url_prefix="/")
    app.register_blueprint(taxa_bp, url_prefix="/")
    app.register_blueprint(users_bp, url_prefix="/")
    app.register_blueprint(assemblies_bp, url_prefix="/")

    CORS(app)
    return app
