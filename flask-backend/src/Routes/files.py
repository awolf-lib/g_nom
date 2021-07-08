# general imports
from os.path import exists
from flask import Blueprint, jsonify, request, send_file

# local imports
from Tools import FileManager

# setup blueprint name
files = Blueprint("files", __name__)


api = FileManager()

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": {
        "label": "Error",
        "message": "Wrong request method. Please contact support!",
        "type": "error",
    },
}


# testing
@files.route("/fetchPossibleImports", methods=["GET", "POST"])
def fetchPossibleImports():
    if request.method == "POST":
        req = request.get_json(force=True)
        data, notification = api.fetchPossibleImports(
            req.get("types", None)
        )

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
