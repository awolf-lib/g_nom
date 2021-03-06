# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.assemblies import (
    addAssemblyGeneralInformation,
    addAssemblyTag,
    deleteAssemblyByAssemblyID,
    deleteAssemblyGeneralInformationByID,
    fetchAssembliesByTaxonID,
    fetchAssemblyByAssemblyID,
    fetchAssemblyGeneralInformationByAssemblyID,
    fetchAssemblySequenceHeaders,
    fetchAssemblyTags,
    fetchAssemblyTagsByAssemblyID,
    import_assembly,
    fetchAssemblies,
    removeAssemblyTagbyTagID,
    updateAssemblyGeneralInformationByID,
    updateAssemblyLabel,
)
from modules.users import ACCESS_LVL_1, ACCESS_LVL_2, validateActiveToken
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
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        taxon = req.get("taxon", None)
        dataset = req.get("dataset", None)

        if taxon and dataset and userID:
            data, notification = import_assembly(taxon, dataset, userID)
        else:
            data, notification = 0, createNotification(message="RequestError: Invalid parameters!")

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
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
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


# UPDATE ASSEMBLY LABEL
@assemblies_bp.route("/updateAssemblyLabel", methods=["GET"])
def assemblies_bp_updateAssemblyLabel():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        assemblyID = request.args.get("assemblyID", None)
        label = request.args.get("label", None)

        if assemblyID:
            if label:
                status, notification = updateAssemblyLabel(assemblyID, label, userID)
            else:
                status, notification = updateAssemblyLabel(assemblyID, None, userID)
        else:
            status, notification = 0, createNotification(message="RequestError: Invalid parameters!")

        response = jsonify({"payload": status, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL ASSEMBLIES
@assemblies_bp.route("/fetchAssemblies", methods=["POST"])
def assemblies_bp_fetchAssemblies():
    if request.method == "POST":
        req = request.get_json(force=True)
        userID = req.get("userID", None)
        token = req.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        search = req.get("search", None)
        sortBy = req.get("sortBy", None)
        offset = req.get("offset", None)
        range = req.get("range", None)
        filter = req.get("filter", None)
        onlyBookmarked = req.get("onlyBookmarked", None)

        if int(onlyBookmarked):
            data, pagination, notification = fetchAssemblies(search, filter, sortBy, offset, range, userID)
        else:
            data, pagination, notification = fetchAssemblies(search, filter, sortBy, offset, range)

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
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
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


# FETCH ONE ASSEMBLY
@assemblies_bp.route("/fetchAssemblyByAssemblyID", methods=["GET"])
def assemblies_bp_fetchAssemblyByAssemblyID():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
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
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
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
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
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
@assemblies_bp.route("/fetchAssemblyTags", methods=["GET"])
def assemblies_bp_fetchAssemblyTags():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        data, notification = fetchAssemblyTags()

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL ASSEMBLY TAGS BY ASSEMBLY ID
@assemblies_bp.route("/fetchAssemblyTagsByAssemblyID", methods=["GET"])
def assemblies_bp_fetchAssemblyTagsByAssemblyID():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
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


# FETCH ALL GENERAL INFORMATION FOR SPECIFIC ASSEMBLY ID
@assemblies_bp.route("/fetchAssemblyGeneralInformationByAssemblyID", methods=["GET"])
def assemblies_bp_fetchTaxonGeneralInformationByTaxonID():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        id = request.args.get("id")
        data, notification = fetchAssemblyGeneralInformationByAssemblyID(id)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# ADD GENERAL INFORMATION
@assemblies_bp.route("/addAssemblyGeneralInformation", methods=["GET"])
def assemblies_bp_addTaxonGeneralInformation():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        id = request.args.get("id")
        key = request.args.get("key")
        value = request.args.get("value")
        data, notification = addAssemblyGeneralInformation(id, key, value)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# UPDATE GENERAL INFORMATION
@assemblies_bp.route("/updateAssemblyGeneralInformationByID", methods=["GET"])
def assemblies_bp_updateTaxonGeneralInformationByID():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        id = request.args.get("id")
        key = request.args.get("key")
        value = request.args.get("value")
        data, notification = updateAssemblyGeneralInformationByID(id, key, value)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# DELETES GENERAL INFORMATION
@assemblies_bp.route("/deleteAssemblyGeneralInformationByID", methods=["GET"])
def assemblies_bp_deleteAssemblyGeneralInformationByID():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        id = request.args.get("id")
        data, notification = deleteAssemblyGeneralInformationByID(id)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCHES ASSEMBLY SEQUENCE HEADERS
@assemblies_bp.route("/fetchAssemblySequenceHeaders", methods=["GET"])
def assemblies_bp_fetchAssemblySequenceHeaders():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        assemblyID = request.args.get("assemblyID")
        number = request.args.get("number")
        offset = request.args.get("offset")
        search = request.args.get("search")
        data, notification = fetchAssemblySequenceHeaders(search, assemblyID, number, offset)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
