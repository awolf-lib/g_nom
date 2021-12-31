from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "SECRET_KEY_DEV"

    from .taxa import taxa_bp
    from .users import users_bp
    from .assemblies import assemblies_bp
    from .annotations import annotations_bp
    from .mappings import mappings_bp
    from .analyses import analyses_bp
    from .combined_imports import imports_bp
    from .files import files_bp

    app.register_blueprint(taxa_bp, url_prefix="/")
    app.register_blueprint(users_bp, url_prefix="/")
    app.register_blueprint(assemblies_bp, url_prefix="/")
    app.register_blueprint(annotations_bp, url_prefix="/")
    app.register_blueprint(mappings_bp, url_prefix="/")
    app.register_blueprint(imports_bp, url_prefix="/")
    app.register_blueprint(analyses_bp, url_prefix="/")
    app.register_blueprint(imports_bp, url_prefix="/")
    app.register_blueprint(files_bp, url_prefix="/")

    CORS(app)
    return app
