# general imports
from flask import Blueprint, jsonify, request

# local imports
from Tools import Parsers

# setup blueprint name
parsers = Blueprint('parsers', __name__)


api = Parsers()


# TODO
@parsers.route('/parseFasta', methods=["GET", "POST"])
def parseFasta():
    if request.method == "POST":
        req = request.get_json(force=True)
        # TODO add FETCH FILE
        data, error = api.parseFasta(req.get("fileID", None))

        response = jsonify({"payload": data, "error": error})
        response.headers.add("Access-Control-Allow-Origin", "*")

        return response
    else:
        return {"payload": 0, "error": "Wrong request method."}
