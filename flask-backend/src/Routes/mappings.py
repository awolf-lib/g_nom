# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.users import validateActiveToken
from modules.notifications import createNotification
from modules.mappings import (
    deleteMappingByMappingID,
    fetchMappingsByAssemblyID,
    import_mapping,
    updateMappingLabel,
)

# setup blueprint name
mappings_bp = Blueprint("mappings", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": createNotification(message="Wrong request method. Please contact support!"),
}

# IMPORT NEW ANNOTATION
@mappings_bp.route("/import_mapping", methods=["POST"])
def mappings_bp_import_mapping():
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
        dataset = req.get("dataset", None)
        assemblyID = req.get("assemblyID", None)

        if taxon and dataset and userID:
            data, notification = import_mapping(taxon, assemblyID, dataset, userID)
        else:
            data, notification = 0, createNotification(message="RequestError: Invalid parameters!")

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# DELETE ASSEMBLY BY ASSEMBLY ID
@mappings_bp.route("/deleteMappingByMappingID", methods=["GET"])
def mappings_bp_deleteMappingByMappingID():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        mapping_id = request.args.get("mappingID")

        status, notification = deleteMappingByMappingID(mapping_id)

        response = jsonify({"payload": status, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# UPDATE MAPPING LABEL
@mappings_bp.route("/updateMappingLabel", methods=["GET"])
def mappings_bp_updateMappingLabel():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        mapping_id = request.args.get("mappingID", None)
        label = request.args.get("label", None)

        if mapping_id:
            if label:
                status, notification = updateMappingLabel(mapping_id, label)
            else:
                status, notification = updateMappingLabel(mapping_id, None)
        else:
            status, notification = 0, createNotification(message="RequestError: Invalid parameters!")

        response = jsonify({"payload": status, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL ASSEMBLIES FOR SPECIFIC TAXON
@mappings_bp.route("/fetchMappingsByAssemblyID", methods=["GET"])
def mappings_bp_fetchMappingsByAssemblyID():
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
        data, notification = fetchMappingsByAssemblyID(assemblyID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
