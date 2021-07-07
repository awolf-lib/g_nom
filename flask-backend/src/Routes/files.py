# general imports
from os.path import exists
from flask import Blueprint, jsonify, request, send_file

# local imports
from Tools import FileManager

# setup blueprint name
files = Blueprint("files", __name__)


api = FileManager()


# testing
@files.route("/fetchPossibleImports", methods=["GET"])
def fetchPossibleImports():
    if request.method == "GET":
        response = ""

        status, error = api.fetchPossibleImports()

        response = jsonify({"payload": status, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

