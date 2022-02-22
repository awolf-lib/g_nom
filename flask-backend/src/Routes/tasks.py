# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.users import ACCESS_LVL_1, validateActiveToken
from modules.notifications import createNotification
from modules.tasks import fetchTaskStatus

# setup blueprint name
tasks_bp = Blueprint("tasks", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": createNotification(message="Wrong request method. Please contact support!"),
}

# DELETE ASSEMBLY BY ASSEMBLY ID
@tasks_bp.route("/fetchTaskStatus", methods=["GET"])
def tasks_bp_fetchTaskStatus():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        taskID = request.args.get("taskID")

        status, notification = fetchTaskStatus(taskID)

        response = jsonify({"payload": status, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
