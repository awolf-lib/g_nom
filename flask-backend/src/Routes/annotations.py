# general imports
from flask import Blueprint, jsonify, request

# local imports
from modules.users import validateActiveToken
from modules.notifications import createNotification
from modules.annotations import (
    deleteAnnotationByAnnotationID,
    fetchAnnotationsByAssemblyID,
    fetchFeatureAttributeKeys,
    fetchFeatureTypes,
    fetchFeatures,
    import_annotation,
    updateAnnotationLabel,
)

# setup blueprint name
annotations_bp = Blueprint("annotations", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": createNotification(message="Wrong request method. Please contact support!"),
}

# IMPORT NEW ANNOTATION
@annotations_bp.route("/import_annotation", methods=["POST"])
def annotations_bp_import_annotation():
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
            data, notification = import_annotation(taxon, assemblyID, dataset, userID)
        else:
            data, notification = 0, createNotification(message="RequestError: Invalid parameters!")

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# DELETE ANNOTATION BY ANNOTATION ID
@annotations_bp.route("/deleteAnnotationByAnnotationID", methods=["GET"])
def annotations_bp_deleteAnnotationByAnnotationID():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        annotation_id = request.args.get("annotationID")

        status, notification = deleteAnnotationByAnnotationID(annotation_id)

        response = jsonify({"payload": status, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# UPDATE ANNOTATION LABEL
@annotations_bp.route("/updateAnnotationLabel", methods=["GET"])
def annotations_bp_updateAnnotationLabel():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        annotation_id = request.args.get("annotationID", None)
        label = request.args.get("label", None)

        if annotation_id:
            if label:
                status, notification = updateAnnotationLabel(annotation_id, label)
            else:
                status, notification = updateAnnotationLabel(annotation_id, None)
        else:
            status, notification = 0, createNotification(message="RequestError: Invalid parameters!")

        response = jsonify({"payload": status, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL ASSEMBLIES FOR SPECIFIC TAXON
@annotations_bp.route("/fetchAnnotationsByAssemblyID", methods=["GET"])
def annotations_bp_fetchAnnotationsByAssemblyID():
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
        data, notification = fetchAnnotationsByAssemblyID(assemblyID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL ASSEMBLIES
@annotations_bp.route("/fetchFeatures", methods=["POST"])
def annotations_bp_fetchFeatures():
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

        search = req.get("search", None)
        sortBy = req.get("sortBy", None)
        offset = req.get("offset", None)
        range = req.get("range", None)
        filter = req.get("filter", None)
        assembly_id = req.get("assemblyID", None)

        data, pagination, notification = fetchFeatures(assembly_id, search, filter, sortBy, offset, range)

        response = jsonify({"payload": data, "pagination": pagination, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL UNIQUE FEATURE TYPES
@annotations_bp.route("/fetchFeatureTypes", methods=["POST"])
def annotations_bp_fetchFeatureTypes():
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

        taxonIDs = req.get("taxonIDs", None)
        assemblyID = req.get("assemblyID", None)

        data, notification = fetchFeatureTypes(assemblyID, taxonIDs)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL KEYS IN ATTRIBUTE SECTION
@annotations_bp.route("/fetchFeatureAttributeKeys", methods=["Post"])
def annotations_bp_fetchFeatureAttributeKeys():
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

        taxonIDs = req.get("taxonIDs", None)
        assemblyID = req.get("assemblyID", None)
        types = req.get("types", None)

        data, notification = fetchFeatureAttributeKeys(assemblyID, taxonIDs, types)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
