# general imports
from flask import Blueprint, jsonify, request
from modules.users import validateActiveToken

# local imports
from modules.taxa import (
    addTaxonGeneralInformation,
    deleteTaxonGeneralInformationByID,
    fetchTaxonByNCBITaxonID,
    fetchTaxonGeneralInformationByTaxonID,
    updateTaxonGeneralInformationByID,
)

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


# IMPORT TAXA BY NCBI TAXON ID
@taxa_bp.route("/fetchTaxonByNCBITaxonID", methods=["GET"])
def taxa_bp_fetchTaxonByNCBITaxonID():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token)
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


# FETCH ALL GENERAL INFORMATION FOR SPECIFIC TAXON ID
@taxa_bp.route("/fetchTaxonGeneralInformationByTaxonID", methods=["GET"])
def taxa_bp_fetchTaxonGeneralInformationByTaxonID():
    if request.method == "GET":
        userID = request.args.get("userID")
        token = request.args.get("token")

        # token still active?
        valid_token, error = validateActiveToken(userID, token)
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

        print(userID, token)

        # token still active?
        valid_token, error = validateActiveToken(userID, token)
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
        valid_token, error = validateActiveToken(userID, token)
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
