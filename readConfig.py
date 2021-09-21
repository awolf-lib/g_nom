from os import makedirs

def readConfig():
    with open("./config.txt", "r") as config:
        for line in config:
            lineSplit = line.split("=")
            # ADD ENVIRONMENT VARIABLES TO REACT APP
            if lineSplit[0] == "API_ADRESS":
                with open("./react-frontend/.env", "w") as envFile:
                    api_adress = lineSplit[1]
                    envFile.write(f"REACT_APP_API_ADRESS={api_adress}")
            elif lineSplit[0] == "FTP_ADRESS":
                with open("./react-frontend/.env", "a") as envFile:
                    ftp_adress = lineSplit[1]
                    envFile.write(f"REACT_APP_FTP_ADRESS={ftp_adress}")
            elif lineSplit[0] == "JBROWSE_ADRESS":
                with open("./react-frontend/.env", "a") as envFile:
                    jbrowse_adress = lineSplit[1]
                    envFile.write(f"REACT_APP_JBROWSE_ADRESS={jbrowse_adress}")

if __name__ == "__main__":
    readConfig()
