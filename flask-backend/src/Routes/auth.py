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
        data, notification = api.fetchAuth(req.get("username", None),
                                   req.get("password", None))

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": {"userID": "", "role": "", "userName": "", "token": ""}, "notification": {"label": "Error", "message": "Wrong request method. Please contact support!", "type": "error"}}
