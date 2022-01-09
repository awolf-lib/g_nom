from os import getenv

MYSQL_CONTAINER_NAME = getenv("MYSQL_CONTAINER_NAME")
MYSQL_ROOT_PASSWORD = getenv("MYSQL_ROOT_PASSWORD")

BASE_PATH_TO_IMPORT = "/flask-backend/data/import/"
BASE_PATH_TO_STORAGE = "/flask-backend/data/storage/"
