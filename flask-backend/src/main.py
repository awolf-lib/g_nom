from Routes import create_app
from os import getenv

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=getenv("API_PORT"))
