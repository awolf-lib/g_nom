def createNotification(label="Error", message="Something went wrong", type="error"):
    """
    Creates a new notifications. Types: 'error', 'warning', 'info'
    """
    return (
        {
            "label": str(label),
            "message": str(message),
            "type": str(type),
        },
    )
