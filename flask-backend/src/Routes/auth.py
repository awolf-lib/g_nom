# general imports
from flask import Blueprint, jsonify, request

# local imports
from Tools import Auth

# setup blueprint name
auth = Blueprint('auth', __name__)


api = Auth()


# fetch token if username/password is correct
@auth.route('/login', methods=["GET", "POST"])
def login():
    if request.method == "POST":
        req = request.get_json(force=True)
        data, error = api.fetchAuth(req.get("username", None),
                                    req.get("password", None))

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}
