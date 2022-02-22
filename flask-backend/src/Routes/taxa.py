# general imports
from genericpath import exists
from flask import Blueprint, jsonify, request
from flask.helpers import send_file
from modules.users import ACCESS_LVL_1, ACCESS_LVL_2, validateActiveToken

# local imports
from modules.taxa import (
    addTaxonGeneralInformation,
    deleteTaxonGeneralInformationByID,
    fetchTaxaWithAssemblies,
    fetchTaxonByNCBITaxonID,
    fetchTaxonBySearch,
    fetchTaxonByTaxonID,
    fetchTaxonGeneralInformationByTaxonID,
    fetchTaxonImageByTaxonID,
    fetchTaxonTree,
    import_image,
    removeImageByTaxonID,
    updateTaxonGeneralInformationByID,
    updateTaxonTree,
)
from modules.notifications import createNotification

# setup blueprint name
taxa_bp = Blueprint("taxa", __name__)

# CONST
REQUESTMETHODERROR = {
    "payload": 0,
    "notification": {
        "label": "Error",
        "message": "Wrong request method. Please contact support!",
        "type": "error",
    },
}


# FETCH TAXON TREE
@taxa_bp.route("/fetchTaxonTree", methods=["GET"])
def taxa_bp_fetchTaxonTree():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        data, notification = fetchTaxonTree()

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# IMPORT NEW ANNOTATION
@taxa_bp.route("/import_image", methods=["POST"])
def taxa_bp_import_image():
    if request.method == "POST":
        try:
            image = None
            if request.files and request.files["image"]:
                image = request.files["image"]
            taxonID = None
            if request.form and request.form["userID"]:
                taxonID = int(request.form["taxonID"])
            taxonScientificName = None
            if request.form and request.form["userID"]:
                taxonScientificName = request.form["taxonScientificName"]
            token = None
            if request.form and request.form["token"]:
                token = request.form["token"]
            userID = None
            if request.form and request.form["userID"]:
                userID = int(request.form["userID"])
        except Exception as err:
            response = jsonify(
                {
                    "payload": {},
                    "notification": createNotification(message="Invalid form parameters!"),
                }
            )
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        # token still active
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        if taxonID and taxonScientificName and image and userID:
            data, notification = import_image(taxonID, taxonScientificName, image, userID)
        else:
            data, notification = 0, createNotification(message="RequestError: Invalid parameters!")

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    else:
        return REQUESTMETHODERROR


# FETCH TAXON IMAGE BY TAXON ID
@taxa_bp.route("/fetchTaxonImageByTaxonID", methods=["GET"])
def taxa_bp_fetchTaxonImageByTaxonID():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": 0, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        taxonID = request.args.get("taxonID")
        imagePath, notification = fetchTaxonImageByTaxonID(taxonID)

        if not imagePath or not exists(imagePath):
            response = jsonify(
                {
                    "payload": 0,
                    "notification": createNotification(message="Image path does not exist anymore!"),
                }
            )
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response
        return send_file(imagePath, mimetype="image/jpeg")
    else:
        return REQUESTMETHODERROR


# DELETE TAXON IMAGE BY TAXON ID
@taxa_bp.route("/removeImageByTaxonID", methods=["GET"])
def taxa_bp_removeImageByTaxonID():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_2)
        if not valid_token:
            response = jsonify({"payload": {}, "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        taxonID = request.args.get("taxonID")
        data, notification = removeImageByTaxonID(taxonID, userID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH TAXA BY TAXON ID
@taxa_bp.route("/fetchTaxonByTaxonID", methods=["GET"])
def taxa_bp_fetchTaxonByTaxonID():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        taxonID = request.args.get("taxonID")
        data, notification = fetchTaxonByTaxonID(taxonID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH TAXA BY TAXON ID
@taxa_bp.route("/fetchTaxonBySearch", methods=["GET"])
def taxa_bp_fetchTaxonBySearch():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        search = request.args.get("search")
        data, notification = fetchTaxonBySearch(search)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# IMPORT TAXA BY NCBI TAXON ID
@taxa_bp.route("/fetchTaxonByNCBITaxonID", methods=["GET"])
def taxa_bp_fetchTaxonByNCBITaxonID():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        taxonID = request.args.get("taxonID")
        data, notification = fetchTaxonByNCBITaxonID(taxonID)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# IMPORT TAXA BY NCBI TAXON ID
@taxa_bp.route("/fetchTaxaWithAssemblies", methods=["GET"])
def taxa_bp_fetchTaxaWithAssemblies():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token, ACCESS_LVL_1)
        if not valid_token:
            response = jsonify({"payload": [], "notification": error})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response

        data, notification = fetchTaxaWithAssemblies()

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# FETCH ALL GENERAL INFORMATION FOR SPECIFIC TAXON ID
@taxa_bp.route("/fetchTaxonGeneralInformationByTaxonID", methods=["GET"])
def taxa_bp_fetchTaxonGeneralInformationByTaxonID():
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
        data, notification = fetchTaxonGeneralInformationByTaxonID(id)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# ADD GENERAL INFORMATION
@taxa_bp.route("/addTaxonGeneralInformation", methods=["GET"])
def taxa_bp_addTaxonGeneralInformation():
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
        data, notification = addTaxonGeneralInformation(id, key, value)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# UPDATE GENERAL INFORMATION
@taxa_bp.route("/updateTaxonGeneralInformationByID", methods=["GET"])
def taxa_bp_updateTaxonGeneralInformationByID():
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
        data, notification = updateTaxonGeneralInformationByID(id, key, value)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# DELETES GENERAL INFORMATION
@taxa_bp.route("/deleteTaxonGeneralInformationByID", methods=["GET"])
def taxa_bp_deleteTaxonGeneralInformationByID():
    if request.method == "GET":
        id = request.args.get("id")
        data, notification = deleteTaxonGeneralInformationByID(id)

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR


# DELETES GENERAL INFORMATION
@taxa_bp.route("/updateTaxonTree", methods=["GET"])
def taxa_bp_updateTaxonTree():
    if request.method == "GET":
        data, notification = updateTaxonTree()

        response = jsonify({"payload": data, "notification": notification})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return REQUESTMETHODERROR
