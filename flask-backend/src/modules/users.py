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
        connection, cursor, error = connect()
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
        connection, cursor, error = connect()
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
        connection, cursor, error = connect()
        cursor.execute(
            f"SELECT activeToken from users WHERE id={userID} AND activeToken='{token}' AND tokenCreationTime>=DATE_SUB(NOW(), INTERVAL 30 MINUTE)"
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

    return 1, []


# ADD NEW USER
def addUser(username, password, role):
    """
    Add a user to db
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(f"SELECT * FROM users where username='{username}'")
        user = cursor.fetchone()
        if user:
            return {}, createNotification(message=f"Name '{username}' already exists!")
    except Exception as err:
        return {}, createNotification(message=str(err))

    try:
        connection, cursor, error = connect()
        password = sha512(f"{password}$g#n#o#m$".encode("utf-8")).hexdigest()
        cursor.execute(
            f"INSERT INTO users (username, password, userRole) VALUES ('{username}', '{password}', '{role}')"
        )
        connection.commit()
    except Exception as err:
        return {}, createNotification(message=str(err))

    return {"username": username, "role": role}, createNotification(
        "Success", f"User '{username}' with role '{role}' added to database!", "success"
    )


# FETCH ALL USERS
def fetchUsers():
    """
    Gets all users from db
    """
    user = []
    try:
        connection, cursor, error = connect()
        cursor.execute(f"SELECT users.id, users.username, users.userRole from users")

        row_headers = [x[0] for x in cursor.description]
        user = cursor.fetchall()
    except Exception as err:
        return [], createNotification(message=str(err) + "TEST")

    if len(user):
        return [dict(zip(row_headers, x)) for x in user], []
    else:
        return [], createNotification("Info", "No users in database!", "info")


# DELETE USER BY USER ID
def deleteUserByUserID(userID):
    """
    Delete user from db
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(f"DELETE FROM users WHERE id={userID}")
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return userID, createNotification("Success", f"Successfully deleted user with ID {userID}!", "success")


# UPDATE USER ROLE BY USER ID
def updateUserRoleByUserID(userID, role):
    """
    Update column user.role to new value
    """
    try:
        if role == "admin" or role == "user":
            connection, cursor, error = connect()
            cursor.execute(f"UPDATE users SET users.userRole='{role}' WHERE users.id={userID}")
            connection.commit()
        else:
            return 0, createNotification(message=f"Unknown user role '{role}'!")
    except Exception as err:
        return 0, createNotification(message=str(err))

    return userID, createNotification(
        "Success", f"Successfully updated user role of user ID {userID} to '{role}'!", "success"
    )


# ADD NEW BOOKMARK
def addBookmark(userID, assemblyID):
    """
    add new bookmark
    """

    try:
        connection, cursor, error = connect()
        cursor.execute(f"INSERT INTO bookmarks (userID, assemblyID) VALUES ({userID}, {assemblyID})")
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return 1, createNotification("Success", f"Successfully bookmarked assembly{assemblyID}!", "success")


# REMOVE BOOKMARK
def removeBookmark(userID, assemblyID):
    """
    remove bookmark
    """

    try:
        connection, cursor, error = connect()
        cursor.execute(f"DELETE FROM bookmarks WHERE userID={userID} AND assemblyID={assemblyID}")
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return 1, createNotification("Success", f"Successfully removed bookmark (assembly{assemblyID})!", "success")


# Main
if __name__ == "__main__":
    if len(argv) == 1:
        if argv[0] == "fn_name":
            # fn_name()
            pass
    else:
        pass
