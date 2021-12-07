# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.users import login

# setup blueprint name
users_bp = Blueprint("users", __name__)


# fetch token if username is correct
@users_bp.route("/login", methods=["GET", "POST"])
def users_bp_login():
    if request.method == "POST":
        req = request.get_json(force=True)
        data, notification = login(req.get("username", None), req.get("password", None))

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {
            "payload": {"userID": "", "role": "", "userName": "", "token": ""},
            "notification": {
                "label": "Error",
                "message": "Wrong request method. Please contact support!",
                "type": "error",
            },
        }
