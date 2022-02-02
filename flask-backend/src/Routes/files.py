# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.users import validateActiveToken
from modules.notifications import createNotification
from modules.files import scanFiles

# setup blueprint name
files_bp = Blueprint("files", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": createNotification(
        message="Wrong request method. Please contact support!"
    ),
}


# TRIGGER FILESCAN
@files_bp.route("/scanFiles", methods=["GET"])
def files_bp_deleteAnalysesByAnalysesID():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        data, notification = scanFiles()

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
