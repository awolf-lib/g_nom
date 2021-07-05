# general imports
from flask import Blueprint, jsonify, request, send_file

# local imports
from Tools import DatabaseManager

# setup blueprint name
db = Blueprint('db', __name__)

# API
api = DatabaseManager()

# CONST
REQUESTMETHODERROR = {"payload": 0, "notification": {
    "label": "Error", "message": "Wrong request method. Please contact support!", "type": "error"}}


# ================== USER ================== #
# ADD NEW USER
@db.route('/addUser', methods=["GET", "POST"])
def addUser():
    if request.method == "POST":
        req = request.get_json(force=True)
        data, notification = api.addUser(req.get("username", None),
                                         req.get("password", None),
                                         req.get("role", None))

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR

# FETCH ALL USERS


@db.route('/fetchAllUsers', methods=["GET"])
def fetchAllUsers():
    if request.method == "GET":
        data, notification = api.fetchALLUsers()

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR

# DELETE USER BY USER ID


@db.route('/deleteUserByUserID', methods=["GET"])
def deleteUserByUserID():
    if request.method == "GET":
        userID = request.args.get('userID')
        data, notification = api.deleteUserByUserID(userID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR

# UPDATE USER ROLE BY USER ID


@db.route('/updateUserRoleByUserID', methods=["GET"])
def updateUserRoleByUserID():
    if request.method == "GET":
        userID = request.args.get('userID')
        role = request.args.get('role')
        data, notification = api.updateUserRoleByUserID(userID, role)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR

# ================== TAXON ================== #
# IMPORT ALL FROM TAXDUMP FILE


@db.route('/reloadTaxonIDsFromFile', methods=["GET"])
def reloadTaxonIDsFromFile():
    if request.method == "GET":
        data, error = api.reloadTaxonIDsFromFile()

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# FETCH ONE TAXON BY TAXON ID


@db.route('/fetchTaxonByTaxonID', methods=["GET"])
def fetchTaxonByTaxonID():
    if request.method == "GET":
        taxonID = request.args.get('taxonID')
        data, error = api.fetchTaxonByTaxonID(taxonID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# FETCH PROFILE IMAGE


@db.route('/fetchImageByTaxonID', methods=["GET"])
def fetchImageByTaxonID():
    if request.method == "GET":
        taxonID = request.args.get('taxonID')
        data, error = api.fetchImageByTaxonID(taxonID)

        if data:
            return send_file(data)
        else:
            return {"payload": "", "error": error}

    else:
        return {"payload": 0, "error": "Wrong request method."}

# ================== TAXON - GENERAL INFO ================== #
# FETCH ALL GENERAL INFOS FOR ONE SPECIES BY TAXON ID


@db.route('/fetchGeneralInfosByTaxonID', methods=["GET"])
def fetchGeneralInfosByTaxonID():
    if request.method == "GET":
        taxonID = request.args.get('taxonID')
        data, error = api.fetchGeneralInfosByTaxonID(
            taxonID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# ADD NEW GENERAL INFO


@db.route('/addGeneralInfo', methods=["GET"])
def addGeneralInfo():
    if request.method == "GET":
        taxonID = request.args.get('taxonID')
        category = request.args.get('category')
        keyword = request.args.get('keyword')
        info = request.args.get('info')
        data, error = api.addGeneralInfo(taxonID, keyword, info, category)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# REMOVE ONE GENERAL INFO BY GENERAL INFO ID


@db.route('/removeGeneralInfo', methods=["GET"])
def removeGeneralInfo():
    if request.method == "GET":
        generalInfoID = request.args.get('generalInfoID')
        data, error = api.removeGeneralInfo(generalInfoID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# ================== ASSEMBLY ================== #
# FETCH ALL ASSEMBLIES


@db.route('/fetchAllAssemblies', methods=["GET"])
def fetchAllAssemblies():
    if request.method == "GET":
        offset = request.args.get('offset')
        count = request.args.get('count')
        search = request.args.get('search')
        data, pagination, notification = api.fetchAllAssemblies(offset, count, search)

        response = jsonify({"payload": data, "pagination": pagination, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR

# FETCH ALL ASSEMBLIES OF ONE SPECIES BY TAXON ID


@db.route('/fetchAssembliesByTaxonID', methods=["GET"])
def fetchAssembliesByTaxonID():
    if request.method == "GET":
        taxonID = request.args.get('taxonID')
        data, error = api.fetchAssembliesByTaxonID(taxonID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# FETCH ONE ASSEMBLY BY ASSEMBLY ID


@db.route('/fetchAssemblyByAssemblyID', methods=["GET"])
def fetchAssemblyByAssemblyID():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        data, error = api.fetchAssemblyByAssemblyID(
            assemblyID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# ADD NEW ASSEMBLY


@db.route('/addAssembly', methods=["GET"])
def addAssembly():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        name = request.args.get('name')
        taxonID = request.args.get('taxonID')
        data, error = api.addAssembly(
            assemblyID,
            name,
            taxonID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# REMOVE ASSEMBLY BY ASSEMBLY ID


@db.route('/removeAssembly', methods=["GET"])
def removeAssembly():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        data, error = api.removeAssembly(
            assemblyID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# ====== IMPORT FROM FILE ====== #
# tries to import from filepath with type into db


@db.route('/importFromFile', methods=["GET"])
def importFromFile():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        assemblyName = request.args.get('assemblyName')
        taxonID = request.args.get('taxonID')
        path = request.args.get('path')
        additionalFilesPath = request.args.get('additionalFilesPath')
        type = request.args.get('type')

        data, error = api.importFromFile(
            assemblyID, assemblyName, taxonID, path, additionalFilesPath, type)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# ====== FETCH FROM ASSEMBLYINFO ====== #
# fetch assembly info by assembly ID


@db.route('/fetchAssemblyInfosByAssemblyID', methods=["GET"])
def fetchAssemblyInfosByAssemblyID():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        data, error = api.fetchAssemblyInfosByAssemblyID(
            assemblyID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}


# ====== FETCH FROM ASSEMBLYPLOT ====== #
# fetch assembly stat plot by assemblyID from db
@db.route('/fetchAssemblyPlotsByAssemblyID', methods=["GET"])
def fetchAssemblyPlotsByAssemblyID():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        data, error = api.fetchAssemblyPlotsByAssemblyID(
            assemblyID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}


# ====== FETCH FROM ASSEMBLYREPORT ====== #
# fetch full quast report by assemblyID from db
@db.route('/fetchPathToFullQuastReportByAssemblyID', methods=["GET"])
def fetchPathToFullQuastReportByAssemblyID():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        data, error = api.fetchPathToFullQuastReportByAssemblyID(
            assemblyID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# ====== FETCH FROM BUSCO ====== #
# fetch busco results by assemblyID from db


@db.route('/fetchBuscoDataByAssemblyID', methods=["GET"])
def fetchBuscoDataByAssemblyID():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        data, error = api.fetchBuscoDataByAssemblyID(
            assemblyID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}


# ====== FETCH FROM FCAT ====== #
# fetch fCat results by assemblyID from db
@db.route('/fetchFcatDataByAssemblyID', methods=["GET"])
def fetchFcatDataByAssemblyID():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        data, error = api.fetchFcatDataByAssemblyID(
            assemblyID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}


# ====== FETCH FROM REPEATMASKER ====== #
# fetch Repeatmasker results by assemblyID from db
@db.route('/fetchRepeatmaskerDataByAssemblyID', methods=["GET"])
def fetchRepeatmaskerDataByAssemblyID():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        data, error = api.fetchRepeatmaskerDataByAssemblyID(
            assemblyID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# ====== FETCH FROM MILTSPLOT ====== #
# fetch busco results by assemblyID from db


@db.route('/fetchMiltsDataByAssemblyID', methods=["GET"])
def fetchMiltsDataByAssemblyID():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        data, error = api.fetchMiltsDataByAssemblyID(
            assemblyID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}


# ====== FETCH FROM SUBSCRIPTIONS ====== #
# fetch all subscriptions per user
@db.route('/fetchSubscriptionsByUserID', methods=["GET"])
def fetchSubscriptionsByUserID():
    if request.method == "GET":
        userID = request.args.get('userID')
        data, error = api.fetchSubscriptionsByUserID(
            userID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}


# ====== FETCH FROM ASSEMBLIES, TAXON, ANALYSIS, SUBSCRIPTIONS ====== #
# fetch all subscriptions per user (more details)
@db.route('/fetchSubscriptedAssemblyInformationByUserID', methods=["GET"])
def fetchSubscriptedAssemblyInformationByUserID():
    if request.method == "GET":
        userID = request.args.get('userID')
        data, error = api.fetchSubscriptedAssemblyInformationByUserID(
            userID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}


# ====== ADD NEW SUBSCRIPTION ====== #
# add new subscription to user by assemblyID
@db.route('/addSubscriptionByAssemblyID', methods=["GET"])
def addSubscriptionByAssemblyID():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        userID = request.args.get('userID')
        data, error = api.addSubscriptionByAssemblyID(
            userID,
            assemblyID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}


# ====== REMOVE SUBSCRIPTION ====== #
# remove subscription from user by assemblyID
@db.route('/removeSubscriptionByAssemblyID', methods=["GET"])
def removeSubscriptionByAssemblyID():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        userID = request.args.get('userID')
        data, error = api.removeSubscriptionByAssemblyID(
            userID,
            assemblyID)

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}
