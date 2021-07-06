from os.path import exists, split
from os import listdir
from re import compile
from operator import itemgetter


class Parsers:
    # .fa / .fasta
    def parseFasta(self, pathToFasta):
        """
        Reads content of .fa/.fasta
        Output: [(header, sequence, length)]
        """

        if not exists(pathToFasta):
            return 0, "Error: Path not found."

        path = split(pathToFasta)
        filename = path[1]

        filePattern = compile(r"^(.+)(.fa|.fasta)$")
        extensionMatch = filePattern.match(filename)

        if not extensionMatch:
            return (
                0,
                "Error: Uncorrect filetype! Only files of type .fa/.fasta are allowed.",
            )

        try:
            with open(pathToFasta, "r") as fa:
                lines = fa.readlines()
                fa.close()
        except:
            return 0, "Error: Error while opening file. Check file..."

        if not len(lines):
            return 0, "Error: Empty file. Check content."

        headerPattern = compile(r"^>([\.\w]+)(.*)$")  # TODO
        dnaPattern = compile(r"^[AGTC]+$")
        dnaSoftPattern = compile(r"^[AaGgTtCc]+$")
        dnaHardPattern = compile(r"^[AGTCN]+$")
        rnaPattern = compile(r"^[AGUC]+$")
        rnaSoftPattern = compile(r"^[AaGgUuCc]+$")
        rnaHardPattern = compile(r"^[AGUCN]+$")
        transcriptPattern = compile(r"^[ARNDCQEGHILKMFPSTWYVUO]+$")
        headers = []
        sequences = []
        sequence_lengths = []
        sequence = ""
        types = []
        type = ""
        maskings = []
        masking = ""
        for index, line in enumerate(lines):
            line = line.strip().replace("\n", "")
            headerPatternMatch = headerPattern.match(line)
            if headerPatternMatch:
                headers.append(headerPatternMatch[1])
            else:
                if dnaPattern.match(line):
                    if not type:
                        type = "dna"
                    elif type != "dna":
                        return 0, "Error: One sequence contains multiple types."
                    sequence += line
                elif dnaSoftPattern.match(line):
                    if not type:
                        type = "dna"
                    elif type != "dna":
                        return 0, "Error: One sequence contains multiple types."

                    if not masking and not masking == "mixed":
                        masking = "soft"
                    elif masking != "soft":
                        masking = "mixed"
                    sequence += line
                elif dnaHardPattern.match(line):
                    if not type:
                        type = "dna"
                    elif type != "dna":
                        return 0, "Error: One sequence contains multiple types."

                    if not masking and not masking == "mixed":
                        masking = "hard"
                    elif masking != "hard":
                        masking = "mixed"
                    sequence += line
                elif rnaPattern.match(line):
                    if not type:
                        type = "rna"
                    elif type != "rna":
                        return 0, "Error: One sequence contains multiple types."
                    sequence += line
                elif rnaSoftPattern.match(line):
                    if not type:
                        type = "rna"
                    elif type != "rna":
                        return 0, "Error: One sequence contains multiple types."

                    if not masking and not masking == "mixed":
                        masking = "soft"
                    elif masking != "soft":
                        masking = "mixed"
                    sequence += line
                elif rnaHardPattern.match(line):
                    if not type:
                        type = "rna"
                    elif type != "rna":
                        return 0, "Error: One sequence contains multiple types."

                    if not masking and not masking == "mixed":
                        masking = "hard"
                    elif masking != "hard":
                        masking = "mixed"
                    sequence += line
                elif transcriptPattern.match(line):
                    if not type:
                        type = "prot"
                    elif type != "prot":
                        return 0, "Error: One sequence contains multiple types."
                    sequence += line
                else:
                    return (
                        0,
                        "Error: At least one sequence did not match any sequence type. Abborting...",
                    )

            if index + 1 == len(lines) or headerPattern.match(lines[index + 1]):
                sequences.append(sequence)
                sequence_lengths.append(len(sequence))
                sequence = ""
                types.append(type)
                type = ""
                if not masking:
                    masking = "none"
                maskings.append(masking)
                masking = ""

        data = list(zip(headers, sequences, sequence_lengths, types, maskings))
        data.sort(key=itemgetter(2))
        return data, ""

    # quast

    def parseQuast(self, pathToQuast):
        """
        Takes an ID of an assembly and converts the results of quast (if in database) from the
        summary file into a JSON object.
        """
        # go through all fcat runs
        try:
            with open(pathToQuast + "report.tsv", "r") as f:
                summaryData = f.readlines()
                f.close()
        except:
            return 0, "Error: Error while opening Quast results!"

        data = {"metadata": {}}
        for line in summaryData[1:]:
            values = line.split("\t")
            label = values[0].lower().replace(" ", "_")
            data["metadata"][label] = values[1].strip()

        pathToImgs = pathToQuast + "basic_stats/"

        data["plots"] = {}
        for file in listdir(pathToImgs):
            if "Nx_plot.png" == file:
                data["plots"]["Nx"] = pathToImgs + file
            elif "GC_content_plot.png" == file:
                data["plots"]["GC_content"] = pathToImgs + file
            elif "cumulative_plot.png" == file:
                data["plots"]["cumulative"] = pathToImgs + file

        data["fullReportHTML"] = pathToQuast + "icarus_viewers/contig_size_viewer.html"

        return data, ""

    # busco

    def parseBusco(self, pathToBusco):
        """
        Extract data of busco analysis (short_summary.txt)
        """

        summary_data = []
        try:
            with open(pathToBusco, "r") as f:
                summaryData = f.readlines()
                f.close()
        except:
            return 0, "Error: Error while opening busco results!"

        data = {}
        try:
            for line in summaryData:
                split = line.split()
                if "(C)" in line:
                    pass
                elif "(S)" in line:
                    data["completeSingle"] = int(split[0])
                elif "(D)" in line:
                    data["completeDuplicated"] = int(split[0])
                elif "(F)" in line:
                    data["fragmented"] = int(split[0])
                elif "(M)" in line:
                    data["missing"] = int(split[0])
                elif "Total" in line:
                    data["total"] = int(split[0])
        except:
            return 0, "Error: Error while parsing busco summary file!"

        if len(data.keys()):
            return data, ""
        else:
            return 0, "Error: No data found!"

    # fCat

    def parseFcat(self, pathToFcat):
        """
        Extract data of fCat analysis (report_summary.txt)
        """
        summaryData = []
        try:
            with open(pathToFcat, "r") as f:
                summaryData = f.readlines()
                f.close()
        except:
            return 0, "Error: Error while opening fCat results!"

        try:
            data = {}
            columns = [x.strip().replace("\n", "") for x in summaryData[0].split("\t")]

            for line in summaryData[1:]:
                values = line.split("\t")
                data[values[0]] = {}

                for index, value in enumerate(values[2:]):
                    data[values[0]][columns[index + 2]] = int(value)
        except:
            return 0, "Error: Error while parsing fCat results."

        if len(data.keys()):
            return data, ""
        else:
            return 0, "Error: No data found!"

    # Repeatmasker

    def parseRepeatmasker(self, pathToRepeatmasker):
        """
        Extract data of Repeatmasker analysis
        """
        summaryData = []
        try:
            with open(pathToRepeatmasker, "r") as f:
                summaryData = f.readlines()
                f.close()
        except:
            return 0, "Error: Error while opening Repeatmasker results!"

        try:
            data = {}
            value_pattern = compile(r" [\d.]+ ")
            for line in summaryData:
                if line[0] == "=" or line[0] == "-":
                    continue

                values = value_pattern.findall(line)
                values = [value.strip() for value in values]

                # header
                if len(values) == 0:
                    continue
                elif "sequences" in line:
                    number_of_sequences = int(values[0])
                    continue

                elif "total length" in line:
                    total_sequence_length = int(values[0])
                    sequence_length = int(values[0])
                    continue

                elif "GC level" in line:
                    gc_level = float(values[0])
                    continue

                elif "bases masked" in line:
                    data["numberN"] = int(values[0])
                    data["percentN"] = float(values[1])
                    continue

                # body
                if "Retroelements" in line:
                    length_occupied = int(values[1])
                    data["retroelements"] = int(values[0])
                    data["retroelements_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "DNA transposons" in line:
                    length_occupied = int(values[1])
                    data["dna_transposons"] = int(values[0])
                    data["dna_transposons_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "Rolling-circles" in line:
                    length_occupied = int(values[1])
                    data["rolling_circles"] = int(values[0])
                    data["rolling_circles_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "Unclassified" in line:
                    length_occupied = int(values[1])
                    data["unclassified"] = int(values[0])
                    data["unclassified_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "Small RNA" in line:
                    length_occupied = int(values[1])
                    data["small_rna"] = int(values[0])
                    data["small_rna_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "Satellites" in line:
                    length_occupied = int(values[1])
                    data["satellites"] = int(values[0])
                    data["satellites_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "Simple repeats" in line:
                    length_occupied = int(values[1])
                    data["simple_repeats"] = int(values[0])
                    data["simple_repeats_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "Low complexity" in line:
                    length_occupied = int(values[1])
                    data["low_complexity"] = int(values[0])
                    data["low_complexity_length"] = length_occupied
                    sequence_length -= length_occupied

            data["total_non_repetitive_length"] = sequence_length
            data["total_repetitive_length"] = total_sequence_length - sequence_length
        except:
            return 0, "Error: Error while parsing fCat results."

        if len(data.keys()):
            return data, ""
        else:
            return 0, "Error: No data found!"
