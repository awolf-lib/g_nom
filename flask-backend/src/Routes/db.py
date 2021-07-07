# general imports
from flask import Blueprint, jsonify, request, send_file

# local imports
from Tools import DatabaseManager

# setup blueprint name
db = Blueprint("db", __name__)

# API
api = DatabaseManager()

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": {
        "label": "Error",
        "message": "Wrong request method. Please contact support!",
        "type": "error",
    },
}


# ================== USER ================== #
# ADD NEW USER
@db.route("/addUser", methods=["GET", "POST"])
def addUser():
    if request.method == "POST":
        req = request.get_json(force=True)
        data, notification = api.addUser(
            req.get("username", None), req.get("password", None), req.get("role", None)
        )

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL USERS
@db.route("/fetchAllUsers", methods=["GET"])
def fetchAllUsers():
    if request.method == "GET":
        data, notification = api.fetchALLUsers()

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# DELETE USER BY USER ID
@db.route("/deleteUserByUserID", methods=["GET"])
def deleteUserByUserID():
    if request.method == "GET":
        userID = request.args.get("userID")
        data, notification = api.deleteUserByUserID(userID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# UPDATE USER ROLE BY USER ID
@db.route("/updateUserRoleByUserID", methods=["GET"])
def updateUserRoleByUserID():
    if request.method == "GET":
        userID = request.args.get("userID")
        role = request.args.get("role")
        data, notification = api.updateUserRoleByUserID(userID, role)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# ================== TAXON ================== #
# IMPORT ALL FROM TAXDUMP FILE
@db.route("/reloadTaxonIDsFromFile", methods=["GET"])
def reloadTaxonIDsFromFile():
    if request.method == "GET":
        data, error = api.reloadTaxonIDsFromFile()

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR

# ================== ASSEMBLY ================== #
# FETCH ALL ASSEMBLIES
@db.route("/fetchAllAssemblies", methods=["GET"])
def fetchAllAssemblies():
    if request.method == "GET":
        page = request.args.get("page")
        range = request.args.get("range")
        search = request.args.get("search")
        data, pagination, notification = api.fetchAllAssemblies(page, range, search)

        response = jsonify(
            {"payload": data, "pagination": pagination, "notification": notification}
        )
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR