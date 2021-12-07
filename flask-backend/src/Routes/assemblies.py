# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.assemblies import fetchAssembliesByTaxonID, import_assembly, fetchAssemblies
from modules.users import validateActiveToken
from modules.notifications import createNotification

# setup blueprint name
assemblies_bp = Blueprint("assemblies", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": createNotification(message="Wrong request method. Please contact support!"),
}

# IMPORT NEW ASSEMBLY
@assemblies_bp.route("/import_assembly", methods=["POST"])
def assemblies_bp_import_assembly():
    if request.method == "POST":
        req = request.get_json(force=True)

        userID = req.get("userID", None)
        token = req.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        taxon = req.get("taxon", None)
        filePath = req.get("filePath", None)

        data = import_assembly(taxon, filePath, userID)

        response = jsonify({"payload": data, "notification": ""})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL ASSEMBLIES
@assemblies_bp.route("/fetchAssemblies", methods=["GET"])
def assemblies_bp_fetchAssemblies():
    if request.method == "GET":
        search = request.args.get("search")
        offset = request.args.get("offset")
        range = request.args.get("range")
        userID = request.args.get("userID")
        data, pagination, notification = fetchAssemblies(search, offset, range, userID)

        response = jsonify({"payload": data, "pagination": pagination, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR

# FETCH ALL ASSEMBLIES FOR SPECIFIC TAXON
@assemblies_bp.route("/fetchAssembliesByTaxonID", methods=["GET"])
def assemblies_bp_fetchAssembliesByTaxonID():
    if request.method == "GET":
        taxonID = request.args.get("taxonID")
        data, notification = fetchAssembliesByTaxonID(taxonID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
