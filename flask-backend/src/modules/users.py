from secrets import token_hex
from hashlib import sha512
from sys import argv
from os import getenv
from datetime import datetime

from modules.db_connection import connect
from modules.notifications import createNotification
from .producer import notify_fileserver_user

ACCESS_LVL_1 = ["admin", "user", "viewer"]
ACCESS_LVL_2 = ["admin", "user"]
ACCESS_LVL_3 = ["admin"]

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

        notifcations = []

        if user:
            user = dict(zip(row_headers, user))
            username = user["username"]

            if (
                "activeToken" in user
                and user["activeToken"]
                and "tokenCreationTime" in user
                and user["tokenCreationTime"]
            ):
                time_passed = datetime.now() - user["tokenCreationTime"]
                time_passed_minutes = time_passed.total_seconds() / 60

                if time_passed_minutes > 30:
                    token = token_hex(16)
                    token_stored, error = __updateToken(user["id"], token)

                    if not token_stored or not token:
                        return 0, error
                else:
                    notifcations += createNotification("Info", "You are still logged in!", "info")
                    token = user["activeToken"]
            else:
                token = token_hex(16)
                token_stored, error = __updateToken(user["id"], token)

                if not token_stored or not token:
                    return 0, error

            notifcations += createNotification(f"Welcome {username}!", "You successfully logged in!", "success")

            return {
                "userID": user["id"],
                "role": user["userRole"],
                "userName": username,
                "token": token,
            }, notifcations

        else:
            return {
                "userID": "",
                "role": "",
                "userName": "",
                "token": "",
            }, createNotification(message="Incorrect username/password!")

    except Exception as err:
        return {
            "userID": "",
            "role": "",
            "userName": "",
            "passwordHash": "",
            "token": "",
        }, createNotification(message=f"LoginError: {str(err)}")


# logging out
def logout(userID):
    """
    Logging out of Gnom.
    """
    try:
        if not userID:
            return 0, createNotification(message=f"No userID supplied")

        connection, cursor, error = connect()
        cursor.execute(
            "UPDATE users SET activeToken=NULL, tokenCreationTime=NULL WHERE users.id=%s",
            (userID,),
        )
        connection.commit()

        return 1, createNotification("Success", "Successfully logged out!", "success")

    except Exception as err:
        return 0, createNotification(message=f"LogoutError: {str(err)}")


# add current token to db
def __updateToken(userID, token):
    """
    Sets new token for specific user.
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(
            "UPDATE users SET activeToken=%s, tokenCreationTime=NOW() WHERE id=%s",
            (token, userID),
        )
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=str(err))

    return token, createNotification("Success", f"Token stored for user ID {userID}!", "success")


def validateActiveToken(userID, token, access=[]):
    """
    Validates token for specific user.
    """
    try:
        if not userID or not token:
            return 0, createNotification(message="Did not receive UserID or token!")

        print(userID, token)

        connection, cursor, error = connect()
        cursor.execute(
            "SELECT userRole, activeToken from users WHERE id=%s AND activeToken=%s AND tokenCreationTime>=DATE_SUB(NOW(), INTERVAL 30 MINUTE)",
            (userID, token),
        )
        
        user = cursor.fetchone()

        if not user:
            return 0, createNotification(message="Session expired. Please relog first!")

        role, valid_token = user
    
        if not valid_token:
            cursor.execute(
                "UPDATE users SET activeToken=NULL, tokenCreationTime=NULL WHERE id=%s",
                (userID,),
            )
            connection.commit()
            return 0, createNotification(message="Session expired. Please relog first!")

        if access and len(access):
            if role not in access:
                return 0, createNotification(message="Access denied!")

        cursor.execute("UPDATE users SET tokenCreationTime=NOW() WHERE id=%s", (userID,))
        connection.commit()
    except Exception as err:
        return 0, createNotification(message=f"TokenValidationError: {str(err)}")

    return 1, []


# ADD NEW USER
def addUser(username, password, role):
    """
    Add a user to db.
    """
    if (role not in ACCESS_LVL_1):
        return {}, createNotification(message=f"User role '{role}' does not exist!") 

    try:
        connection, cursor, error = connect()
        cursor.execute("SELECT * FROM users where username=%s", (username,))
        user = cursor.fetchone()
        if user:
            return {}, createNotification(message=f"Name '{username}' already exists!")
    except Exception as err:
        return {}, createNotification(message=str(err))

    try:
        if role in ACCESS_LVL_2:
            notify_fileserver_user(username, password, "User", "Create")

        connection, cursor, error = connect()
        password = sha512(f"{password}$g#n#o#m$".encode("utf-8")).hexdigest()
        cursor.execute(
            "INSERT INTO users (username, password, userRole) VALUES (%s, %s, %s)",
            (username, password, role),
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
        cursor.execute("SELECT users.id, users.username, users.userRole from users")

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
        userID = int(userID)
        if userID == 1:
            return 0, createNotification(message="Cannot delete cli_importer!")

        connection, cursor, error = connect()
        cursor.execute("SELECT username from users WHERE id=%s", (userID,))
        user = cursor.fetchone()

        cursor.execute("DELETE FROM users WHERE id=%s", (userID,))
        connection.commit()

        if user:
            notify_fileserver_user(user[0], "", "User", "Delete")

        return userID, createNotification("Success", f"Successfully deleted user with ID {userID}!", "success")
    except Exception as err:
        return 0, createNotification(message=str(err))


# UPDATE USER ROLE BY USER ID
def updateUserRoleByUserID(userID, role):
    """
    Update column user.role to new value
    """
    try:
        userID = int(userID)
        if userID == 1:
            return 0, createNotification(message="Cannot change cli_importer!")
        if userID == 2:
            return 0, createNotification(message="Cannot change initial user!")

        if role in ACCESS_LVL_1:
            connection, cursor, error = connect()
            cursor.execute("UPDATE users SET users.userRole=%s WHERE users.id=%s", (role, userID))
            connection.commit()
        else:
            return 0, createNotification(message=f"Unknown user role '{role}'!")

        return userID, createNotification(
            "Success",
            f"Successfully updated user role of user ID {userID} to '{role}'!",
            "success",
        )
    except Exception as err:
        return 0, createNotification(message=str(err))


# ADD NEW BOOKMARK
def addBookmark(userID, assemblyID):
    """
    add new bookmark
    """

    try:
        connection, cursor, error = connect()
        cursor.execute(
            "INSERT INTO bookmarks (userID, assemblyID) VALUES (%s, %s)",
            (userID, assemblyID),
        )
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
        cursor.execute(
            "DELETE FROM bookmarks WHERE userID=%s AND assemblyID=%s",
            (userID, assemblyID),
        )
        connection.commit()

        return 1, createNotification(
            "Success",
            f"Successfully removed bookmark (assembly{assemblyID})!",
            "success",
        )
    except Exception as err:
        return 0, createNotification(message=str(err))


# Main
if __name__ == "__main__":
    if len(argv[1:]) == 1:
        if argv[1] == "addInitialUser":
            addUser("cli_importer", getenv("INITIAL_USER_PASSWORD"), "admin")
            addUser(
                getenv("INITIAL_USER_USERNAME"),
                getenv("INITIAL_USER_PASSWORD"),
                "admin",
            )
    else:
        pass
