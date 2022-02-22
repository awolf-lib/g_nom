# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.notifications import createNotification
from modules.combined_imports import (
    fetchImportDirectory,
    import_dataset_with_queue,
    validateFileInfo,
)
from modules.users import ACCESS_LVL_2, validateActiveToken

# setup blueprint name
imports_bp = Blueprint("imports", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": createNotification(message="Wrong request method. Please contact support!"),
}


@imports_bp.route("/fetchImportDirectory", methods=["GET"])
def imports_bp_fetchImportDirectory():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        data, notification = fetchImportDirectory()

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# IMPORT NEW ASSEMBLY
@imports_bp.route("/import_dataset", methods=["POST"])
def imports_bp_import_dataset():
    if request.method == "POST":
        req = request.get_json(force=True)

        userID = req.get("userID", None)
        token = req.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        taxon = req.get("taxon", None)
        assembly = req.get("assembly", None)
        assemblyID = req.get("assemblyID", None)
        annotations = req.get("annotations", [])
        mappings = req.get("mappings", [])
        buscos = req.get("buscos", [])
        fcats = req.get("fcats", [])
        milts = req.get("milts", [])
        repeatmaskers = req.get("repeatmaskers", [])

        data, notification = import_dataset_with_queue(
            taxon,
            assembly,
            userID,
            annotations,
            mappings,
            buscos,
            fcats,
            milts,
            repeatmaskers,
            assemblyID,
        )

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# VALIDATE FILE INFO FOR IMPORT
@imports_bp.route("/validateFileInfo", methods=["POST"])
def imports_bp_validateFileInfo():
    if request.method == "POST":
        req = request.get_json(force=True)

        userID = req.get("userID", None)
        token = req.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        fileInfo = req.get("fileInfo", None)

        data, notification = validateFileInfo(fileInfo)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
