# general imports
from os.path import exists
from flask import Blueprint, jsonify, request, send_file

# local imports
from Tools import FileManager

# setup blueprint name
tools = Blueprint('tools', __name__)


api = FileManager()

# creates all necessary directories for one species


@tools.route('/removeDirectoriesForSpecies', methods=["GET"])
def removeDirectoriesForSpecies():
    if request.method == "GET":
        assemblyID = request.args.get('assemblyID')
        response = ""

        status, error = api.removeDirectoriesForSpecies(assemblyID)

        response = jsonify({"payload": status, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}


# creates all necessary directories for one species
@tools.route('/fetchFilesInImportDirectory', methods=["GET"])
def fetchFilesInImportDirectory():
    if request.method == "GET":
        response = ""

        data, error = api.fetchFilesInImportDirectory()

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}

# fetch plot by path


@tools.route('/fetchImageByPath', methods=["GET"])
def fetchImageByPath():
    if request.method == "GET":
        path = request.args.get('path')

        if exists(path):
            return send_file(path)
        else:
            return {"payload": "", "error": "Path not found!"}

    else:
        return {"payload": 0, "error": "Wrong request method."}
