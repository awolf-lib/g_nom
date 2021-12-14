from .notifications import createNotification
from .db_connection import connect

# fetches all analyses for specific assembly
def fetchAnalysesByAssemblyID(assemblyID):
    """
    Fetches all analyses for specific assembly.
    """
    try:
        connection, cursor, error = connect()
        if error and error["message"]:
            return error

        analyses = {}

        # busco analyses
        cursor.execute(
            f"SELECT analyses.*, analysesBusco.* FROM analyses, analysesBusco WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesBusco.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        analyses["busco"] = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        # fcat analyses
        cursor.execute(
            f"SELECT analyses.*, analysesFcat.* FROM analyses, analysesFcat WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesFcat.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        analyses["fcat"] = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        # milts analyses
        cursor.execute(
            f"SELECT analyses.*, analysesMilts.* FROM analyses, analysesMilts WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesMilts.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        analyses["milts"] = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        # repeatmasker analyses
        cursor.execute(
            f"SELECT analyses.*, analysesRepeatmasker.* FROM analyses, analysesRepeatmasker WHERE analyses.assemblyID={assemblyID} AND analyses.id=analysesRepeatmasker.analysisID"
        )
        row_headers = [x[0] for x in cursor.description]
        analyses["repeatmasker"] = [dict(zip(row_headers, x)) for x in cursor.fetchall()]

        return (
            analyses,
            {},
        )
    except Exception as err:
        return [], createNotification(message=str(err))
