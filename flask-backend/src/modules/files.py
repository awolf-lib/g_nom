from modules.notifications import notify_fileserver


def scanFiles():
    notify_fileserver("Scan", "All")
    return 1, []
