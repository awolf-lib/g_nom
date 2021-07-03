import mysql.connector
from secrets import token_hex


class Auth:
    def __init__(self):
        self.hostURL = "0.0.0.0"

    # ====== GENERAL ====== #
    # reconnect to get updates
    def updateConnection(self, database="g-nom_dev"):
        connection = mysql.connector.connect(
            host=self.hostURL,
            user="gnom",
            password="G-nom_BOT#0",
            database=database,
            auth_plugin='mysql_native_password'
        )
        cursor = connection.cursor()

        return connection, cursor

    # ====== FETCH FROM USER ====== #
    # fetch token if username/password is correct
    def fetchAuth(self, username, password):
        # try:
        connection, cursor = self.updateConnection()
        cursor.execute(
            'SELECT * FROM user WHERE username = %s AND password = %s', (username, password,))
        row_headers = [x[0] for x in cursor.description]
        user = cursor.fetchone()
        user = dict(zip(row_headers, user))
        # except:
        #     return 0, "Error: Error while fetching username and password from db"

        if user:
            return {"userID": user["id"], "role": user["role"], "userName": user["username"], "token": token_hex(16), "message": 'Logged in successfully!'}, ""
        else:
            return {"userID": "", "role": "", "userName": "", "token": "", "message": 'Incorrect username/password!'}, ""
