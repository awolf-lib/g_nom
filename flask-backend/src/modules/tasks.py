from .db_connection import connect
from .notifications import createNotification

# FETCHES STATUS OF SPECIFIC TASK
def fetchTaskStatus(task_id):
    """
    Fetches task status by task ID
    """
    try:
        connection, cursor, error = connect()
        cursor.execute(
            "SELECT runningTasks.* FROM runningTasks WHERE runningTasks.id=%s",
            (task_id,),
        )
        row_headers = [x[0] for x in cursor.description]
        task = cursor.fetchone()
        task = dict(zip(row_headers, task))

    except Exception as err:
        return [], createNotification(message=f"TaskStatusFetchingError: {str(err)}")

    notification = []
    if task and "id" in task:
        if "status" in task:
            if task["status"] == "done":
                cursor.execute(
                    "DELETE FROM runningTasks WHERE runningTasks.id=%s", (task_id,)
                )
                connection.commit()
                notification = createNotification(
                    "Success", f"Task finished!", "success"
                )

            elif task["status"] == "running":
                if "progress" in task:
                    if task["progress"]:
                        progress = task["progress"]
                        notification = createNotification(
                            "Info", f"Task is still running! ({progress}% done)", "info"
                        )
                    else:
                        notification = createNotification(
                            "Info", "Task is still running!", "info"
                        )
                else:
                    notification = createNotification(
                        "Info", "Task is still running!", "info"
                    )

            elif task["status"] == "aborted":
                cursor.execute(
                    "DELETE FROM runningTasks WHERE runningTasks.id=%s", (task_id,)
                )
                connection.commit()
                notification = createNotification(
                    message="Task aborted due to an error!"
                )

        return task, notification

    else:
        return {}, createNotification("Info", "Task not found!", "info")


# ADDS NEW TASK TO DB
def addTask(task_id, targetTaxon=0):
    """
    Adds task to DB for further checking.
    """
    try:
        connection, cursor, error = connect()

        if not targetTaxon:
            cursor.execute(
                "INSERT INTO runningTasks (id, status, startTime) VALUES (%s, 'running', NOW())",
                (task_id,),
            )
        else:
            cursor.execute(
                "INSERT INTO runningTasks (id, status, startTime, targetTaxon) VALUES (%s, 'running', NOW(), %s)",
                (task_id, targetTaxon),
            )
        connection.commit()

        return 1, []

    except Exception as err:
        return 0, createNotification(message=f"TaskStatusFetchingError: {str(err)}")


# UPDATES TASK STATUS, PROGRESS
def updateTask(task_id, status, progress=0):
    """
    Updates task by task ID.
    """
    try:
        if not task_id or not status:
            return 0, createNotification(
                message="Cannot update task: Missing task parameters!"
            )

        connection, cursor, error = connect()
        if status == "done":
            cursor.execute(
                "UPDATE runningTasks SET runningTasks.status='done', runningTasks.updateTime=NOW(), runningTasks.endTime=NOW(), runningTasks.progress=100 WHERE runningTasks.id=%s",
                (task_id,),
            )
        else:
            cursor.execute(
                "UPDATE runningTasks SET runningTasks.status=%s, runningTasks.updateTime=NOW(), runningTasks.progress=%s WHERE runningTasks.id=%s",
                (status, progress, task_id),
            )
        connection.commit()

        return 1, []

    except Exception as err:
        return 0, createNotification(message=f"TaskStatusFetchingError: {str(err)}")


# CHECKS WHETHER TAXON IS CURRENTLY EDITED BY ANOTHER ACTION
def isTaxonCurrentlyEdited(taxonID):
    """
    Checks whether taxon is currently edited by any other action.
    """

    try:
        connection, cursor, error = connect()
        cursor.execute(
            "SELECT targetTaxon from runningTasks WHERE targetTaxon=%s", (taxonID,)
        )
        target = cursor.fetchone()

        if target:
            return 1
        else:
            return 0

    except Exception as err:
        print(f"CheckEditStatusError: {str(err)}")
        return 1
