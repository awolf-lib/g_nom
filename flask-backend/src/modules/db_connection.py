import mysql.connector

from .environment import MYSQL_ROOT_PASSWORD, MYSQL_CONTAINER_NAME

DB_NAME = "gnom_db"

# reconnect to get updates
def connect(database=DB_NAME):
    connection = mysql.connector.connect(
        host=MYSQL_CONTAINER_NAME,
        user="root",
        password=MYSQL_ROOT_PASSWORD,
        database=database,
        auth_plugin="mysql_native_password",
    )
    cursor = connection.cursor()
    return connection, cursor
