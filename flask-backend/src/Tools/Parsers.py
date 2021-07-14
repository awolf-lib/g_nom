from os.path import exists, split
from os import listdir
from re import compile
from operator import itemgetter


class Parsers:
    # .fa / .fasta
    def parseFasta(self, pathToFasta, fixedType=""):
        """
        Reads content of .fa/.fasta/.faa/.fna
        """

        if not exists(pathToFasta):
            return 0, "Error: Path not found."

        path = split(pathToFasta)
        filename = path[1]

        filePattern = compile(r"^(.+)(.fa|.fasta|.fna|.faa)$")
        extensionMatch = filePattern.match(filename)

        if not extensionMatch:
            return (
                0,
                {
                    "label": "Error",
                    "message": "Uncorrect filetype! Only files of type .fa/.fasta/.faa/.fna are allowed.",
                    "type": "error",
                },
            )

        try:
            with open(pathToFasta, "r") as fa:
                lines = fa.readlines()
                fa.close()
        except:
            return 0, {
                "label": "Error",
                "message": "Error while opening file. Check file.",
                "type": "error",
            }

        if not len(lines):
            return 0, {
                "label": "Error",
                "message": "Empty file. Check content.",
                "type": "error",
            }

        try:
            headerPattern = compile(r"^>([\.\w]+)(.*)$")
            dnaPattern = compile(r"^[AGTC]+$")
            dnaSoftPattern = compile(r"^[AaGgTtCc]+$")
            dnaHardPattern = compile(r"^[AGTCN]+$")
            rnaPattern = compile(r"^[AGUC]+$")
            rnaSoftPattern = compile(r"^[AaGgUuCc]+$")
            rnaHardPattern = compile(r"^[AGUCN]+$")
            transcriptPattern = compile(r"^[ARNDCQEGHILKMFPSTWYVUO]+$")
            headers = []
            sequence = ""
            bases = 0
            sequence_lengths = []
            sequences_1000 = 0
            sequences_2500 = 0
            sequences_5000 = 0
            sequences_10000 = 0
            sequences_25000 = 0
            sequences_50000 = 0
            sequences_100000 = 0
            sequences_250000 = 0
            sequences_500000 = 0
            sequences_1000000 = 0
            bases_1000 = 0
            bases_2500 = 0
            bases_5000 = 0
            bases_10000 = 0
            bases_25000 = 0
            bases_50000 = 0
            bases_100000 = 0
            bases_250000 = 0
            bases_500000 = 0
            bases_1000000 = 0
            types = []
            type = ""
            maskings = []
            masking = ""
            basesHardMasked = 0
            basesSoftMasked = 0
            gc = 0
            gc_soft = 0
            MULTIPLETYPEERROR = {
                "label": "Error",
                "message": "Error: One sequence contains multiple types.",
                "type": "error",
            }
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
                            return 0, MULTIPLETYPEERROR
                    elif dnaSoftPattern.match(line):
                        if not type:
                            type = "dna"
                        elif type != "dna":
                            return 0, MULTIPLETYPEERROR

                        if not masking and not masking == "mixed":
                            masking = "soft"
                        elif masking != "soft":
                            masking = "mixed"
                    elif dnaHardPattern.match(line):
                        if not type:
                            type = "dna"
                        elif type != "dna":
                            return 0, MULTIPLETYPEERROR

                        if not masking and not masking == "mixed":
                            masking = "hard"
                        elif masking != "hard":
                            masking = "mixed"
                    elif rnaPattern.match(line):
                        if not type:
                            type = "rna"
                        elif type != "rna":
                            return 0, MULTIPLETYPEERROR
                    elif rnaSoftPattern.match(line):
                        if not type:
                            type = "rna"
                        elif type != "rna":
                            return 0, MULTIPLETYPEERROR

                        if not masking and not masking == "mixed":
                            masking = "soft"
                        elif masking != "soft":
                            masking = "mixed"
                    elif rnaHardPattern.match(line):
                        if not type:
                            type = "rna"
                        elif type != "rna":
                            return 0, MULTIPLETYPEERROR

                        if not masking and not masking == "mixed":
                            masking = "hard"
                        elif masking != "hard":
                            masking = "mixed"
                    elif transcriptPattern.match(line):
                        if not type:
                            type = "prot"
                        elif type != "prot":
                            return 0, MULTIPLETYPEERROR
                    else:
                        return (
                            0,
                            {
                                "label": "Error",
                                "message": "At least one sequence did not match any sequence type. Abborting...",
                                "type": "error",
                            },
                        )

                    sequence += line

                if index + 1 == len(lines) or headerPattern.match(lines[index + 1]):
                    sequence_length = len(sequence)
                    bases += sequence_length
                    sequence_lengths.append(sequence_length)

                    if sequence_length >= 1000000:
                        sequences_1000000 += 1
                        bases_1000000 += sequence_length
                    if sequence_length >= 500000:
                        sequences_500000 += 1
                        bases_500000 += sequence_length
                    if sequence_length >= 250000:
                        sequences_250000 += 1
                        bases_250000 += sequence_length
                    if sequence_length >= 100000:
                        sequences_100000 += 1
                        bases_100000 += sequence_length
                    if sequence_length >= 50000:
                        sequences_50000 += 1
                        bases_50000 += sequence_length
                    if sequence_length >= 25000:
                        sequences_25000 += 1
                        bases_25000 += sequence_length
                    if sequence_length >= 10000:
                        sequences_10000 += 1
                        bases_10000 += sequence_length
                    if sequence_length >= 5000:
                        sequences_5000 += 1
                        bases_5000 += sequence_length
                    if sequence_length >= 2500:
                        sequences_2500 += 1
                        bases_2500 += sequence_length
                    if sequence_length >= 1000:
                        sequences_1000 += 1
                        bases_1000 += sequence_length

                    if masking and masking != "none":
                        if masking == "hard" or masking == "mixed":
                            basesHardMasked += sequence.count("N")
                        elif masking == "soft" or masking == "mixed":
                            basesSoftMasked += sequence.count("a")
                            basesSoftMasked += sequence.count("g")
                            basesSoftMasked += sequence.count("t")
                            basesSoftMasked += sequence.count("c")
                            basesSoftMasked += sequence.count("u")

                    if fixedType and fixedType != type:
                        return 0, {
                            "label": "Error",
                            "message": f"File includes sequences of types {type}!",
                            "type": "error",
                        }
                    types.append(type)
                    type = ""

                    if not masking:
                        masking = "none"
                    maskings.append(masking)
                    masking = ""

                    c = sequence.count("C")
                    g = sequence.count("G")
                    gc += c
                    gc += g

                    if masking == "soft" or "mixed":
                        gc_soft += g + c
                        gc_soft += sequence.count("g")
                        gc_soft += sequence.count("c")

                    sequence = ""

            data = list(zip(headers, sequence_lengths, types, maskings))
            data.sort(key=itemgetter(1), reverse=True)
            sequences = len(data)

            cumulative_length = 0
            n50 = 0
            n90 = 0
            for sequence in data:
                cumulative_length += sequence[1]
                if cumulative_length >= bases * 0.5 and not n50:
                    n50 = sequence[1]
                if cumulative_length >= bases * 0.9 and not n90:
                    n90 = sequence[1]

            unique_types = list(set(types))
            unique_types = ", ".join(unique_types)

            unique_maskings = list(set(maskings))
            unique_maskings.remove("none")
            unique_maskings = ", ".join(unique_maskings)

            gc /= bases
            gc_soft /= bases

            data_dict = {
                "numberOfSequences": sequences,
                "cumulativeSequenceLength": bases,
                "n50": n50,
                "n90": n90,
                "largestSequence": data[0][1],
                "gcPercent": gc,
                "gcPercentMasked": gc_soft,
                "softmaskedBases": basesSoftMasked,
                "hardmaskedBases": basesHardMasked,
                "sequncesLarger1000": sequences_1000,
                "cumulativeSequenceLengthSequencesLarger1000": bases_1000,
                "sequncesLarger2500": sequences_2500,
                "cumulativeSequenceLengthSequencesLarger2500": bases_2500,
                "sequncesLarger5000": sequences_5000,
                "cumulativeSequenceLengthSequencesLarger5000": bases_5000,
                "sequncesLarger10000": sequences_10000,
                "cumulativeSequenceLengthSequencesLarger10000": bases_10000,
                "sequncesLarger25000": sequences_25000,
                "cumulativeSequenceLengthSequencesLarger25000": bases_25000,
                "sequncesLarger50000": sequences_50000,
                "cumulativeSequenceLengthSequencesLarger50000": bases_50000,
                "sequncesLarger100000": sequences_100000,
                "cumulativeSequenceLengthSequencesLarger100000": bases_100000,
                "sequncesLarger250000": sequences_250000,
                "cumulativeSequenceLengthSequencesLarger250000": bases_250000,
                "sequncesLarger500000": sequences_500000,
                "cumulativeSequenceLengthSequencesLarger500000": bases_500000,
                "sequncesLarger1000000": sequences_1000000,
                "cumulativeSequenceLengthSequencesLarger1000000": bases_1000000,
                "types": unique_types,
                "maskings": unique_maskings,
            }

        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while parsing file!",
                "type": "error",
            }
        return data_dict, {}

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
