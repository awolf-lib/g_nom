# Prerequisites

    1. Docker

    All other requirements will automatically be installed during the setup process.

# Installation

1. Clone project from github:

   git clone https://github.com/awolf-lib/g_nom.git

2. Enter the project directory:
   cd g_nom

3. Create a copy of the default.config and rename the copy to local.config
   cp default.config local.config

4. Set the path to the main storage directory by changing the value for DATA_DIR.

5. Set the path to the import directory by changing the value for IMPORT_DIR.

6. Optional (but recommended): Change the MySQL root password by changing the value for MYSQL_ROOT_PASSWORD.

7. Optional (but recommended): Change the initial username and password by changing the value for INITIAL_USER_USERNAME and INITIAL_USER_PASSWORD.

8. If running in a network environment: Specify the IP address of the host server by changing the value for SERVER_ADRESS.

9. Start the setup in the project directory:
   ./setup.sh

# Start

Start services:
./start.sh

# Stop

Stop services:
./shutdown.sh

# Uninstall

Run ./uninstall.sh and read carefully! Root permissions required to delete all stored data!
