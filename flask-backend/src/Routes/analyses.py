# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.notifications import createNotification
from modules.users import validateActiveToken
from modules.analyses import fetchAnalysesByAssemblyID

# setup blueprint name
analyses_bp = Blueprint("analyses", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": createNotification(message="Wrong request method. Please contact support!"),
}

# FETCH ALL ANALYSES BY ASSEMBLY ID
@analyses_bp.route("/fetchAnalysesByAssemblyID", methods=["GET"])
def analyses_bp_fetchAnalysesByAssemblyID():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        assemblyID = request.args.get("assemblyID")
        data, notification = fetchAnalysesByAssemblyID(assemblyID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
