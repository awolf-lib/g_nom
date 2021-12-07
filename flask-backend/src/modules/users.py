from secrets import token_hex
from hashlib import sha512
from sys import argv

from modules.db_connection import connect
from modules.notifications import createNotification

# ====== FETCH FROM USER ====== #
# fetch token if username/password is correct
def login(username, password):
    """
    Validate login data and sets new token.
    """
    try:
        connection, cursor = connect()
        password = sha512(f"{password}$g#n#o#m$".encode("utf-8")).hexdigest()
        cursor.execute(
            "SELECT * FROM users WHERE username = %s AND password = %s",
            (
                username,
                password,
            ),
        )
        row_headers = [x[0] for x in cursor.description]
        user = cursor.fetchone()
    except Exception as err:
        return {
            "userID": "",
            "role": "",
            "userName": "",
            "passwordHash": "",
            "token": "",
        }, createNotification(message=str(err))

    if user:
        user = dict(zip(row_headers, user))
        username = user["username"]

        token = token_hex(16)
        token_stored, error = __updateToken(user["id"], token)

        if not token_stored or not token:
            return 0, error

        return {
            "userID": user["id"],
            "role": user["userRole"],
            "userName": username,
            "token": token,
        }, createNotification(f"Welcome {username}!", "You successfully logged in!", "success")

    else:
        return {"userID": "", "role": "", "userName": "", "token": ""}, createNotification(
            message="Incorrect username/password!"
        )


# add current token to db
def __updateToken(userID, token):
    """
    Sets new token for specific user.
    """
    try:
        connection, cursor = connect()
        cursor.execute(f"UPDATE users SET activeToken='{token}', tokenCreationTime=NOW() WHERE id={userID}")
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return token, createNotification("Success", f"Token stored for user ID {userID}!", "success")


def validateActiveToken(userID, token):
    """
    Validates token for specific user.
    """
    try:
        connection, cursor = connect()
        cursor.execute(
            f"SELECT activeToken from users WHERE id={userID} AND activeToken={token} AND tokenCreationTime>=DATE_SUB(NOW(), INTERVAL 30 MINUTE)"
        )
        user = cursor.fetchone()

        if not user:
            cursor.execute(f"UPDATE users SET activeToken=NULL, tokenCreationTime=NULL WHERE id={userID}")
            connection.commit()
            return 0, createNotification(message="Session expired. Relog first!")

        cursor.execute(f"UPDATE users SET tokenCreationTime=NOW() WHERE id={userID}")
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return 1, {}


# Main
if __name__ == "__main__":
    if len(argv) == 1:
        if argv[0] == "fn_name":
            # fn_name()
            pass
    else:
        pass
