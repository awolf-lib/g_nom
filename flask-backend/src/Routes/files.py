# general imports
from genericpath import exists
from flask import Blueprint, jsonify, request, send_file

# local imports
from modules.users import ACCESS_LVL_1, ACCESS_LVL_2, validateActiveToken
from modules.notifications import createNotification
from modules.files import scanFiles

# setup blueprint name
files_bp = Blueprint("files", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": createNotification(message="Wrong request method. Please contact support!"),
}


# TRIGGER FILESCAN
@files_bp.route("/scanFiles", methods=["GET"])
def files_bp_deleteAnalysesByAnalysesID():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
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


# FETCH FILES BY PATH (example: taXaminer plot)
@files_bp.route("/fetchFileByPath", methods=["GET"])
def files_bp_fetchFileByPath():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": 0, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        path = request.args.get("path")

        if not path or not exists(path):
            response = jsonify(
                {
                    "payload": 0,
                    "notification": createNotification(message="File path does not exist anymore!"),
                }
            )
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response
        return send_file(path)
    else:
        return REQUESTMETHODERROR
