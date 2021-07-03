import mysql.connector
from os import makedirs, listdir, remove
from os.path import exists, isfile, split, isdir, commonpath
from subprocess import run
from re import compile
from shutil import rmtree, copy
from distutils.dir_util import copy_tree
from glob import glob

# defaults
BASEPATHTODOWNLOAD = "/srv/genomehubs/v1/download/data/"
BASEPATHTOIMPORT = "/srv/import/"

JBROWSEGENERATENAMESCALL = "/srv/jbrowse/bin/generate-names.pl"
BASEPATHTOJBROWSEDATA = "/srv/jbrowse/data/"

QUASTCALL = "/srv/tools/quast/quast.py"


class FileManager:
    def __init__(self):
        self.hostURL = "ghubs.izn-ffm.intern"

    # ====== GENERAL ====== #
    # reconnect to get updates
    def updateConnection(self, database="g-nom_dev"):
        connection = mysql.connector.connect(
            host=self.hostURL,
            user="root",
            password="JaghRMI104",
            database=database,
            auth_plugin='mysql_native_password'
        )
        cursor = connection.cursor()

        return connection, cursor

    #####################################################################################################
    # ========================================== FILE IMPORT ========================================== #
    # FETCH FILES FOR IMPORT
    def fetchFilesInImportDirectory(self, path=BASEPATHTOIMPORT):
        """
            Fetch all files provided in import dirctory
        """

        if not exists(path):
            if not exists(BASEPATHTOIMPORT):
                makedirs(BASEPATHTOIMPORT, exist_ok=True)
            return 0, f"Import directory deleted from file system. You should use '{BASEPATHTOIMPORT}'"

        patterns = {
            "fasta": compile(r"^(.+)(\.assembly\.fa)|(\.assembly\.fasta)$"),
            "gff3": compile(r"^(.+)(\.gff)|(\.gff3)$"),
            "busco": compile(r"^short_summary.txt$"),
            "repeatmasker": compile(r"^(.+)\.tbl$"),
            "fcat": compile(r"^report_summary.txt$"),
            "milts": compile(r"^3D_plot.html$"),
            "mapping": compile(r"^(.+)\.bam$")
        }

        allPaths = []
        for baseFile in listdir(path):
            if isdir(path + baseFile):
                # look for .fa
                for filePath in glob(path + baseFile + "/**/*.assembly.fa", recursive=True):
                    pathSplit = split(filePath)
                    allPaths.append(
                        {"file": pathSplit[1], "path": filePath, "type": "fasta"})

                # look for .fasta
                for filePath in glob(path + baseFile + "/**/*.assembly.fasta", recursive=True):
                    pathSplit = split(filePath)
                    allPaths.append(
                        {"file": pathSplit[1], "path": filePath, "type": "fasta"})

                # look for .gff3
                for filePath in glob(path + baseFile + "/**/*.gff3", recursive=True):
                    pathSplit = split(filePath)
                    allPaths.append(
                        {"file": pathSplit[1], "path": filePath, "type": "gff3"})

                # look for .gff
                for filePath in glob(path + baseFile + "/**/*.gff", recursive=True):
                    pathSplit = split(filePath)
                    allPaths.append(
                        {"file": pathSplit[1], "path": filePath, "type": "gff"})

                # look for short_summary.txt (busco)
                for filePath in glob(path + baseFile + "/**/short_summary.txt", recursive=True):
                    pathSplit = split(filePath)
                    allPaths.append(
                        {"file": pathSplit[1], "path": filePath, "type": "busco"})

                # look for .tbl (repeatmasker)
                for filePath in glob(path + baseFile + "/**/*.tbl", recursive=True):
                    pathSplit = split(filePath)
                    allPaths.append(
                        {"file": pathSplit[1], "path": filePath, "type": "repeatmasker"})

                # look for report_summary.txt (fCat)
                for filePath in glob(path + baseFile + "/**/report_summary.txt", recursive=True):
                    pathSplit = split(filePath)
                    allPaths.append(
                        {"file": pathSplit[1], "path": filePath, "type": "fcat"})

                # look for 3D_plot.html (MILTS)
                for filePath in glob(path + baseFile + "/**/3D_plot.html", recursive=True):
                    pathSplit = split(filePath)
                    allPaths.append(
                        {"file": pathSplit[1], "path": filePath, "type": "milts"})

                # look for .bam (mappings)
                for filePath in glob(path + baseFile + "/**/.bam", recursive=True):
                    pathSplit = split(filePath)
                    allPaths.append(
                        {"file": pathSplit[1], "path": filePath, "type": "mapping"})

            elif isfile(path + baseFile):
                for key in patterns:
                    if patterns[key].match(baseFile):
                        allPaths.append(
                            {"file": baseFile, "path": path + baseFile, "type": key})
                        break

        allPathsWithPrivatePath = {}
        for index, pathObject in enumerate(allPaths):
            for searchindex, searchPathObject in enumerate(allPaths):
                if index < searchindex:
                    longestCommonPath = commonpath(
                        [pathObject["path"], searchPathObject["path"]])
                    longestCommonPathLevel = len(
                        longestCommonPath.split("/"))

                    privateDirectory1 = "/".join(pathObject["path"].split(
                        "/")[:longestCommonPathLevel+1])

                    privateDirectory2 = "/".join(searchPathObject["path"].split(
                        "/")[:longestCommonPathLevel+1])

                    if not "directory" in pathObject:
                        pathObject.update({"directory": privateDirectory1})
                    elif len(pathObject["directory"].split("/")) < len(privateDirectory1.split("/")):
                        pathObject.update({"directory": privateDirectory1})

                    if not "directory" in searchPathObject:
                        searchPathObject.update(
                            {"directory": privateDirectory2})
                    elif len(searchPathObject["directory"].split("/")) < len(privateDirectory2.split("/")):
                        searchPathObject.update(
                            {"directory": privateDirectory2})

                    allPathsWithPrivatePath[index] = pathObject
                    allPathsWithPrivatePath[searchindex] = searchPathObject

        return allPathsWithPrivatePath, ""

    # creates directories in storage / jbrowse for one assembly
    def createDirectoriesForSpecies(self, assemblyName):
        """
            Setups the basic directory structure for one assembly
        """

        pathToSpeciesDirectory = BASEPATHTODOWNLOAD + assemblyName

        try:
            # fasta
            makedirs(f"{pathToSpeciesDirectory}/fasta/pep/", exist_ok=True)
            makedirs(f"{pathToSpeciesDirectory}/fasta/dna/", exist_ok=True)

            # gff3
            makedirs(f"{pathToSpeciesDirectory}/gff3/", exist_ok=True)

            # mappings
            makedirs(f"{pathToSpeciesDirectory}/mappings/", exist_ok=True)

            # quast
            makedirs(f"{pathToSpeciesDirectory}/quast/results/", exist_ok=True)
            makedirs(f"{pathToSpeciesDirectory}/quast/conf/", exist_ok=True)

            # busco
            makedirs(f"{pathToSpeciesDirectory}/busco/results/", exist_ok=True)
            makedirs(f"{pathToSpeciesDirectory}/busco/conf/", exist_ok=True)

            # fCat
            makedirs(f"{pathToSpeciesDirectory}/fcat/results/", exist_ok=True)
            makedirs(f"{pathToSpeciesDirectory}/fcat/conf/", exist_ok=True)

            # repeatmasker
            makedirs(f"{pathToSpeciesDirectory}/repeatmasker/results/",
                     exist_ok=True)
            makedirs(
                f"{pathToSpeciesDirectory}/repeatmasker/conf/", exist_ok=True)

            # milts
            makedirs(f"{pathToSpeciesDirectory}/milts/results/", exist_ok=True)
            makedirs(f"{pathToSpeciesDirectory}/milts/conf/", exist_ok=True)

            # jbrowse
            makedirs(f"{BASEPATHTOJBROWSEDATA}/{assemblyName}", exist_ok=True)
        except:
            return 0, "Error while setting up directory structure. Check file system!"

        return 1, ""

    # removes directories in storage / jbrowse for one assembly

    def removeDirectoriesForSpecies(self, assemblyID):
        """
            Removes the basic directory structure for one assembly
        """

        pathToSpeciesDirectory = BASEPATHTODOWNLOAD + assemblyID

        try:
            # remove from /storage/
            rmtree(pathToSpeciesDirectory)

            # remove from /jbrowse/data/
            rmtree(f"{BASEPATHTOJBROWSEDATA}/{assemblyID}")
        except:
            return 0, "Error while removing up directory structure. Check file system!"

        return 1, ""

    # moves fasta to correct directory and creates symbolic link to jbrowse data directory

    def moveFastaToSpeciesStorage(self, assemblyID, pathToFasta, additionalFilesPath):
        """
            Moves assembly to storage system and creates symbolic link into jbrowse directory
        """

        if not exists(pathToFasta):
            return 0, "Error: Path not found."

        path = split(pathToFasta)
        filepath = path[0]
        filename = path[1]

        filePattern = compile(r"^(.+)(.fa|.fasta)$")
        extensionMatch = filePattern.match(filename)

        if not extensionMatch:
            return 0, "Error: Uncorrect filetype! Only files of type .fa/.fasta are allowed."

        renamedFastaPath = f"{filepath}/{assemblyID}.fasta"
        try:
            copy(pathToFasta, renamedFastaPath)
        except:
            pass

        if not isfile(renamedFastaPath):
            return 0, "Error: Error while copying data to storage. Check storage!"

        try:
            if pathToFasta != renamedFastaPath:
                remove(pathToFasta)
        except:
            return 0, "Error: Error while deleting old .fasta. Check storage!"

        dnaPath = f"{BASEPATHTODOWNLOAD + assemblyID}/fasta/dna/"
        try:
            additionalFilesPathLength = len(additionalFilesPath)
            relativePath = renamedFastaPath[additionalFilesPathLength:]
            copy_tree(f"{additionalFilesPath}/", dnaPath)
        except:
            relativePath = f"/{assemblyID}.fasta"
            copy(f"{renamedFastaPath}", dnaPath)

        newPathToFasta = f"{BASEPATHTODOWNLOAD + assemblyID}/fasta/dna{relativePath}"
        if not isfile(newPathToFasta):
            return 0, "Error: Error while copying data to storage. Check storage!"

        try:
            run(["samtools", "faidx", newPathToFasta])
        except:
            return 0, "Error: Error while indexing fasta. Abborting..."

        if not isfile(f"{newPathToFasta}.fai"):
            return 0, "Error: Error while indexing fasta. Abborting..."

        fullPathToJbrowseSpeciesDirectory = f"{BASEPATHTOJBROWSEDATA + assemblyID}/"
        try:
            run(["ln", "-s", newPathToFasta, fullPathToJbrowseSpeciesDirectory])
            run(["ln", "-s", newPathToFasta + ".fai",
                fullPathToJbrowseSpeciesDirectory])
        except:
            return 0, "Error: Error while creating symbolic link of fasta to jbrowse. Set manually!"

        try:
            with open(fullPathToJbrowseSpeciesDirectory + "/tracks.conf", "a") as conf:
                template = f"[GENERAL]\nrefSeqs={assemblyID}.fasta.fai\n[tracks.Reference]\nurlTemplate={assemblyID}.fasta\nstoreClass=JBrowse/Store/SeqFeature/IndexedFasta\ntype=Sequence\n"
                conf.write(template)
                conf.close()
        except:
            return 0, "Error: Error while creating jbrowse tracks.conf. Check manually!"

        try:
            run([JBROWSEGENERATENAMESCALL, "-out",
                fullPathToJbrowseSpeciesDirectory])
        except:
            return 0, "Error: Error while running jbrowse generate-names.pl scipt. Run manually!"

        try:
            if isdir(additionalFilesPath):
                rmtree(additionalFilesPath)
            else:
                remove(renamedFastaPath)
        except:
            return newPathToFasta, "Warning: Error while removing data from import directory. Remove manually!"

        return newPathToFasta, ""

    # generates assembly statitics with Quast

    def runQuast(self, pathToFasta, assemblyID, overwrite=False):
        """
            Starts Quast to get assembly statistics
        """

        if not exists(pathToFasta):
            return 0, "Error: Path not found."

        path = split(pathToFasta)
        filename = path[1]

        filePattern = compile(r"^(.+)(\.fa|\.fasta)$")
        extensionMatch = filePattern.match(filename)

        if not extensionMatch:
            return 0, "Error: Uncorrect filetype! Only files of type .fa/.fasta are allowed."

        try:
            fullOutputPath = BASEPATHTODOWNLOAD + assemblyID + "/quast/results/"
            if not len(listdir(fullOutputPath)) or overwrite:
                run(["python3", QUASTCALL, pathToFasta, "-o",
                    fullOutputPath, "--plots-format", "png"])
                return fullOutputPath, ""

            else:
                return 0, "Error: There are already quast results."
        except:
            return 0, "Error: Error while running quast. Check installation and paths!"

    # moves fasta to correct directory and creates symbolic link to jbrowse data directory

    def moveAnalysisToSpeciesStorage(self, assemblyID, pathToAnalysis, additionalFilesPath, type):
        """
            Moves analysis to storage
        """

        if not exists(pathToAnalysis):
            return 0, "Error: Path not found."

        path = split(pathToAnalysis)
        filename = path[1]

        uniqueDirectoryID = 0
        directoryName = split(additionalFilesPath)[1] + f"_{uniqueDirectoryID}"

        analysisStorage = f"{BASEPATHTODOWNLOAD + assemblyID}/{type}/results/{directoryName}/"

        while isdir(analysisStorage):
            uniqueDirectoryID += 1
            directoryName = split(additionalFilesPath)[
                1] + f"_{uniqueDirectoryID}"
            analysisStorage = f"{BASEPATHTODOWNLOAD + assemblyID}/{type}/results/{directoryName}/"

        makedirs(analysisStorage, exist_ok=True)
        try:
            additionalFilesPathLength = len(additionalFilesPath)
            relativePath = pathToAnalysis[additionalFilesPathLength:]
            copy_tree(f"{additionalFilesPath}/", analysisStorage)
        except:
            relativePath = f"/{filename}"
            copy(f"{pathToAnalysis}", analysisStorage)

        # TODO: FIND ALTERNATE WAY
        if type == "milts":
            # makedirs(f"/srv/genomehubs/v1/download/data/{assemblyID}/milts/{directoryName}/3D_plot_files", exist_ok=True)
            copy_tree("/srv/genomehubs/v1/download/3D_plot_files/", path[0])
            # copy(pathToAnalysis, f"/srv/genomehubs/v1/download/data/{assemblyID}/milts/{directoryName}/")

        newPathToAnalysisStorage = f"{BASEPATHTODOWNLOAD + assemblyID}/{type}/results/{directoryName}{relativePath}"
        if not isfile(newPathToAnalysisStorage):
            return 0, "Error: Error while copying data to storage. Check storage!"

        try:
            if isdir(additionalFilesPath):
                rmtree(additionalFilesPath)
            else:
                remove(pathToAnalysis)
        except:
            return newPathToAnalysisStorage, "Warning: Error while removing data from import directory. Remove manually!"

        return newPathToAnalysisStorage, ""

    # moves gff3 to correct directory and creates symbolic link to jbrowse data directory

    def moveGff3ToSpeciesStorage(self, assemblyID, pathToGff3, additionalFilesPath):
        """
            Moves annotation to storage system and creates symbolic link into jbrowse directory
        """

        if not exists(pathToGff3):
            return 0, "Error: Path not found."

        path = split(pathToGff3)
        filepath = path[0]
        filename = path[1]

        filePattern = compile(r"^(.+)(.gff|.gff3)$")
        extensionMatch = filePattern.match(filename)

        if not extensionMatch:
            return 0, "Error: Uncorrect filetype! Only files of type .gff/.gff3 are allowed."

        annotationPath = f"{BASEPATHTODOWNLOAD + assemblyID}/gff3/"
        try:
            additionalFilesPathLength = len(additionalFilesPath)
            relativePath = path[additionalFilesPathLength:]
            copy_tree(f"{additionalFilesPath}/", annotationPath)
        except:
            relativePath = f"/{filename}"
            copy(f"{pathToGff3}", annotationPath)

        newPathToGff3 = f"{BASEPATHTODOWNLOAD + assemblyID}/gff3{relativePath}"
        if not isfile(newPathToGff3):
            return 0, "Error: Error while copying data to storage. Check storage!"

        if filename.endswith(".gff3"):
            filenameSorted = filename.replace(".gff3", ".sorted.gff3")
        elif filename.endswith(".gff"):
            filenameSorted = filename.replace(".gff", ".sorted.gff")

        pathToSortedGff = annotationPath + filenameSorted
        try:
            run(f'(grep ^"#" {newPathToGff3}; grep -v ^"#" {newPathToGff3} | grep -v "^$" | grep "\t" | sort -k1,1 -k4,4n) > {pathToSortedGff}', shell=True)
            run(f"bgzip {pathToSortedGff}", shell=True)
            run(f"tabix -p gff {pathToSortedGff}.gz", shell=True)
        except:
            return 0, "Error: Error while sorting/indexing gff. Abborting...!"

        if not isfile(f"{pathToSortedGff}.gz") or not isfile(f"{pathToSortedGff}.gz.tbi"):
            return 0, "Error: Error while sorting/indexing gff. Abborting..."

        fullPathToJbrowseSpeciesDirectory = f"{BASEPATHTOJBROWSEDATA + assemblyID}/"
        try:
            run(f"ln -s {pathToSortedGff}.gz {fullPathToJbrowseSpeciesDirectory}", shell=True)
            run(f"ln -s {pathToSortedGff}.gz.tbi {fullPathToJbrowseSpeciesDirectory}", shell=True)
        except:
            return 0, "Error: Error while creating symbolic link of gff to jbrowse. Abborting...!"

        try:
            with open(fullPathToJbrowseSpeciesDirectory + "tracks.conf", "a") as conf:
                label = extensionMatch[1].replace(".", "_")
                template = f"[tracks.Annotation_{label}]\nurlTemplate={filenameSorted}.gz\nstoreClass=JBrowse/Store/SeqFeature/GFF3Tabix\ntype=CanvasFeatures\n"
                conf.write(template)
                conf.close()
        except:
            return 0, "Error: Error while creating jbrowse tracks.conf. Check manually!"

        try:
            run(f"{JBROWSEGENERATENAMESCALL} -out {fullPathToJbrowseSpeciesDirectory}", shell=True)
        except:
            return 0, "Error: Error while running jbrowse generate-names.pl scipt. Run manually!"

        try:
            if isdir(additionalFilesPath):
                rmtree(additionalFilesPath)
            else:
                remove(pathToGff3)
        except:
            return newPathToGff3, "Warning: Error while removing data from import directory. Remove manually!"

        return newPathToGff3, ""

    # moves mapping to correct directory and creates symbolic link to jbrowse data directory

    def moveMappingToSpeciesStorage(self, assemblyID, pathToMapping, additionalFilesPath):
        """
            Moves mapping to storage system, indexes and creates symbolic link into jbrowse directory
        """

        if not exists(pathToMapping):
            return 0, "Error: Path not found."

        path = split(pathToMapping)
        filepath = path[0]
        filename = path[1]

        filePattern = compile(r"^(.+)\.bam$")
        extensionMatch = filePattern.match(filename)

        if not extensionMatch:
            return 0, "Error: Uncorrect filetype! Only files of type .bam are allowed."

        mappingsPath = f"{BASEPATHTODOWNLOAD + assemblyID}/mappings/"
        try:
            additionalFilesPathLength = len(additionalFilesPath)
            relativePath = path[additionalFilesPathLength:]
            copy_tree(f"{additionalFilesPath}/", mappingsPath)
        except:
            relativePath = f"/{filename}"
            copy(f"{pathToMapping}", mappingsPath)

        newPathToMapping = f"{BASEPATHTODOWNLOAD + assemblyID}/mappings{relativePath}"
        if not isfile(newPathToMapping):
            return 0, "Error: Error while copying data to storage. Check storage!"

        try:
            run(f'samtools index {newPathToMapping}', shell=True)
        except:
            return 0, "Error: Error while indexing mapping. Abborting...!"

        if not isfile(f"{newPathToMapping}.bai"):
            return 0, "Error: Error while indexing mapping. Abborting..."

        fullPathToJbrowseSpeciesDirectory = f"{BASEPATHTOJBROWSEDATA + assemblyID}/"
        try:
            run(f"ln -s {newPathToMapping} {fullPathToJbrowseSpeciesDirectory}", shell=True)
            run(f"ln -s {newPathToMapping}.bai {fullPathToJbrowseSpeciesDirectory}", shell=True)
        except:
            return 0, "Error: Error while creating symbolic link of mapping to jbrowse. Abborting...!"

        try:
            with open(fullPathToJbrowseSpeciesDirectory + "tracks.conf", "a") as conf:
                label = extensionMatch[1].replace(".", "_")
                template = f"[tracks.Mapping_{label}]\nurlTemplate={filename}\nstoreClass=JBrowse/Store/SeqFeature/BAM\ntype=Alignments2\n"
                conf.write(template)
                conf.close()
        except:
            return 0, "Error: Error while creating jbrowse tracks.conf. Check manually!"

        try:
            run(f"{JBROWSEGENERATENAMESCALL} -out {fullPathToJbrowseSpeciesDirectory}", shell=True)
        except:
            return 0, "Error: Error while running jbrowse generate-names.pl scipt. Run manually!"

        try:
            if isdir(additionalFilesPath):
                rmtree(additionalFilesPath)
            else:
                remove(pathToMapping)
        except:
            return newPathToMapping, "Warning: Error while removing data from import directory. Remove manually!"

        return newPathToMapping, ""
