# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.users import (
    addBookmark,
    addUser,
    deleteUserByUserID,
    fetchUsers,
    login,
    logout,
    removeBookmark,
    updateUserRoleByUserID,
    validateActiveToken,
)
from modules.notifications import createNotification

# setup blueprint name
users_bp = Blueprint("users", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": {
        "label": "Error",
        "message": "Wrong request method. Please contact support!",
        "type": "error",
    },
}

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
            "notification": REQUESTMETHODERROR,
        }


# fetch token if username is correct
@users_bp.route("/logout", methods=["POST"])
def users_bp_logout():
    if request.method == "POST":
        req = request.get_json(force=True)

        userID = req.get("userID", None)
        token = req.get("token", None)

        # token still active?
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        data, notification = logout(userID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {
            "payload": {"userID": "", "role": "", "userName": "", "token": ""},
            "notification": REQUESTMETHODERROR,
        }


# ADD NEW USER
@users_bp.route("/addUser", methods=["GET", "POST"])
def users_bp_addUser():
    if request.method == "POST":
        req = request.get_json(force=True)
        userID = req.get("userID")
        token = req.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        data, notification = addUser(
            req.get("username", None), req.get("password", None), req.get("role", None)
        )

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL USERS
@users_bp.route("/fetchUsers", methods=["GET"])
def users_bp_fetchAllUsers():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        data, notification = fetchUsers()

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# DELETE USER BY USER ID
@users_bp.route("/deleteUserByUserID", methods=["GET"])
def users_bp_deleteUserByUserID():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        id = request.args.get("id")
        data, notification = deleteUserByUserID(id)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# UPDATE USER ROLE BY USER ID
@users_bp.route("/updateUserRoleByUserID", methods=["GET"])
def users_bp_updateUserRoleByUserID():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        id = request.args.get("id")
        role = request.args.get("role")
        data, notification = updateUserRoleByUserID(id, role)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# ADD NEW BOOKMARK
@users_bp.route("/addBookmark", methods=["GET"])
def users_bp_addNewBookmark():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        assemblyID = request.args.get("assemblyID")
        data, notification = addBookmark(userID, assemblyID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# REMOVE BOOKMARK
@users_bp.route("/removeBookmark", methods=["GET"])
def users_bp_removeBookmark():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        assemblyID = request.args.get("assemblyID")
        data, notification = removeBookmark(userID, assemblyID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


@users_bp.route("/connectionTest", methods=["GET"])
def connectionTest():
    response = jsonify({"payload": "Success"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response
