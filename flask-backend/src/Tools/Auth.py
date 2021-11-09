import mysql.connector
from secrets import token_hex
from hashlib import sha512
from json import dumps

from .Mysql import HOST_URL as MYSQL_HOST_URL

class Auth:
    def __init__(self):
        self.hostURL = MYSQL_HOST_URL

    # ====== GENERAL ====== #
    # reconnect to get updates
    def updateConnection(self, database="g-nom_dev"):
        connection = mysql.connector.connect(
            host=self.hostURL,
            user="root",
            password="JaghRMI104",
            database=database,
            auth_plugin="mysql_native_password",
        )
        cursor = connection.cursor()

        return connection, cursor

    # ====== FETCH FROM USER ====== #
    # fetch token if username/password is correct
    def fetchAuth(self, username, password):
        try:
            connection, cursor = self.updateConnection()
            password = sha512(f"{password}$g#n#o#m$".encode("utf-8")).hexdigest()
            cursor.execute(
                "SELECT * FROM user WHERE username = %s AND password = %s",
                (
                    username,
                    password,
                ),
            )
            row_headers = [x[0] for x in cursor.description]
            user = cursor.fetchone()
        except:
            return {
                "userID": "",
                "role": "",
                "userName": "",
                "passwordHash": "",
                "token": "",
            }, {
                "label": "Error",
                "message": "Something went wrong while fetching from db!",
                "type": "error",
            }

        if user:
            user = dict(zip(row_headers, user))
            username = user["username"]
            return {
                "userID": user["id"],
                "role": user["role"],
                "userName": username,
                "token": token_hex(16),
            }, {
                "label": f"Welcome {username}!",
                "message": "You successfully logged in!",
                "type": "success",
            }
        else:
            return {"userID": "", "role": "", "userName": "", "token": "",}, {
                "label": "Error",
                "message": "Incorrect username/password!",
                "type": "error",
            }
