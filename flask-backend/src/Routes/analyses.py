# general imports
from flask import Blueprint, jsonify, request, send_file
from os.path import exists

# local imports
from modules.notifications import createNotification
from modules.users import validateActiveToken
from modules.analyses import (
    deleteAnalysesByAnalysesID,
    fetchAnalysesByAssemblyID,
    fetchBuscoAnalysesByAssemblyID,
    fetchFcatAnalysesByAssemblyID,
    fetchMiltsAnalysesByAssemblyID,
    fetchRepeatmaskerAnalysesByAssemblyID,
    import_analyses,
    updateAnalysisLabel,
)
from modules.environment import BASE_PATH_TO_STORAGE

# setup blueprint name
analyses_bp = Blueprint("analyses", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": createNotification(
        message="Wrong request method. Please contact support!"
    ),
}


# IMPORT NEW ANALYSES
@analyses_bp.route("/import_analyses", methods=["POST"])
def analyses_bp_import_analyses():
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
        analyses_type = req.get("analysesType", None)

        if taxon and dataset and userID and assemblyID and analyses_type:
            data, notification = import_analyses(
                taxon, assemblyID, dataset, analyses_type, userID
            )
        else:
            data, notification = 0, createNotification(
                message="RequestError: Invalid parameters!"
            )

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# IMPORT NEW ANNOTATION
@analyses_bp.route("/deleteAnalysesByAnalysesID", methods=["GET"])
def analyses_bp_deleteAnalysesByAnalysesID():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        analysisID = request.args.get("analysisID")
        if analysisID:
            data, notification = deleteAnalysesByAnalysesID(analysisID)
        else:
            data, notification = 0, createNotification(
                message="RequestError: Invalid parameters!"
            )

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# UPDATE ANALYSES LABEL
@analyses_bp.route("/updateAnalysisLabel", methods=["GET"])
def analyses_bp_updateAnalysisLabel():
    if request.method == "GET":
        userID = request.args.get("userID", None)
        token = request.args.get("token", None)

        # token still active
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        analysis_id = request.args.get("analysisID", None)
        label = request.args.get("label", None)

        if analysis_id:
            if label:
                status, notification = updateAnalysisLabel(analysis_id, label)
            else:
                status, notification = updateAnalysisLabel(analysis_id, None)
        else:
            status, notification = 0, createNotification(
                message="RequestError: Invalid parameters!"
            )

        response = jsonify({"payload": status, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


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


# FETCH BUSCO ANALYSES BY ASSEMBLY ID
@analyses_bp.route("/fetchBuscoAnalysesByAssemblyID", methods=["GET"])
def analyses_bp_fetchBuscoAnalysesByAssemblyID():
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
        data, notification = fetchBuscoAnalysesByAssemblyID(assemblyID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH FCAT ANALYSES BY ASSEMBLY ID
@analyses_bp.route("/fetchFcatAnalysesByAssemblyID", methods=["GET"])
def analyses_bp_fetchFcatAnalysesByAssemblyID():
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
        data, notification = fetchFcatAnalysesByAssemblyID(assemblyID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH MILTS ANALYSES BY ASSEMBLY ID
@analyses_bp.route("/fetchMiltsAnalysesByAssemblyID", methods=["GET"])
def analyses_bp_fetchMiltsAnalysesByAssemblyID():
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
        data, notification = fetchMiltsAnalysesByAssemblyID(assemblyID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH REPEATMASKER ANALYSES BY ASSEMBLY ID
@analyses_bp.route("/fetchRepeatmaskerAnalysesByAssemblyID", methods=["GET"])
def analyses_bp_fetchRepeatmaskerAnalysesByAssemblyID():
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
        data, notification = fetchRepeatmaskerAnalysesByAssemblyID(assemblyID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH FILES BY PATH (example: Milts plot)
@analyses_bp.route("/fetchFileByPath", methods=["GET"])
def analyses_bp_fetchFileByPath():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token)
        if not valid_token:
            response = jsonify({"payload": 0, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        path = request.args.get("path")

        if not path or not exists(path):
            response = jsonify(
                {
                    "payload": 0,
                    "notification": createNotification(
                        message="File path does not exist anymore!"
                    ),
                }
            )
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response
        return send_file(path)
    else:
        return REQUESTMETHODERROR
