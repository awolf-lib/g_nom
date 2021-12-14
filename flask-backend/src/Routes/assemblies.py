# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.assemblies import (
    addAssemblyTag,
    deleteAssemblyByAssemblyID,
    fetchAssembliesByTaxonID,
    fetchAssembliesByTaxonIDs,
    fetchAssemblyByAssemblyID,
    fetchAssemblyTagsByAssemblyID,
    import_assembly,
    fetchAssemblies,
    removeAssemblyTagbyTagID,
)
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

        data, notification = import_assembly(taxon, filePath, userID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# DELETE ASSEMBLY BY ASSEMBLY ID
@assemblies_bp.route("/deleteAssemblyByAssemblyID", methods=["GET"])
def assemblies_bp_deleteAssemblyByAssemblyID():
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

        status, notification = deleteAssemblyByAssemblyID(assemblyID)

        response = jsonify({"payload": status, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL ASSEMBLIES
@assemblies_bp.route("/fetchAssemblies", methods=["GET"])
def assemblies_bp_fetchAssemblies():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        search = request.args.get("search")
        offset = request.args.get("offset")
        range = request.args.get("range")
        onlyBookmarked = request.args.get("onlyBookmarked", None)

        if int(onlyBookmarked):
            data, pagination, notification = fetchAssemblies(search, offset, range, userID)
        else:
            data, pagination, notification = fetchAssemblies(search, offset, range)

        response = jsonify({"payload": data, "pagination": pagination, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR

# FETCH ALL ASSEMBLIES FOR SPECIFIC TAXON
@assemblies_bp.route("/fetchAssembliesByTaxonID", methods=["GET"])
def assemblies_bp_fetchAssembliesByTaxonID():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        taxonID = request.args.get("taxonID")
        data, notification = fetchAssembliesByTaxonID(taxonID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH MULTIPLE ASSEMBLIES BY MULTIPLE TAXON IDS
@assemblies_bp.route("/fetchAssembliesByTaxonIDs", methods=["GET"])
def assemblies_bp_fetchAssembliesByTaxonIDs():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        taxonIDs = request.args.get("taxonIDs")
        data, notification = fetchAssembliesByTaxonIDs(taxonIDs)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ONE ASSEMBLY
@assemblies_bp.route("/fetchAssemblyByAssemblyID", methods=["GET"])
def assemblies_bp_fetchAssemblyByAssemblyID():
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
        data, notification = fetchAssemblyByAssemblyID(assemblyID, userID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# ADD NEW ASSEMBLY TAG
@assemblies_bp.route("/addAssemblyTag", methods=["GET"])
def assemblies_bp_addAssemblyTag():
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
        tag = request.args.get("tag")
        data, notification = addAssemblyTag(assemblyID, tag)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# ADD NEW ASSEMBLY TAG
@assemblies_bp.route("/removeAssemblyTagbyTagID", methods=["GET"])
def assemblies_bp_removeAssemblyTag():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        tagID = request.args.get("tagID")
        data, notification = removeAssemblyTagbyTagID(tagID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL ASSEMBLY TAGS
@assemblies_bp.route("/fetchAssemblyTagsByAssemblyID", methods=["GET"])
def assemblies_bp_fetchAssemblyTagsByAssemblyID():
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
        data, notification = fetchAssemblyTagsByAssemblyID(assemblyID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
