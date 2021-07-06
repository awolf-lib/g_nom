from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "SECRET_KEY_DEV"

    from .auth import auth
    from .db import db
    from .tools import tools
    from .parsers import parsers

    app.register_blueprint(auth, url_prefix="/")
    app.register_blueprint(db, url_prefix="/")
    app.register_blueprint(tools, url_prefix="/")
    app.register_blueprint(parsers, url_prefix="/")

    CORS(app)
    return app
