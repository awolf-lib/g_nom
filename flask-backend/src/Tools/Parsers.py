from os.path import exists, split
from os import listdir
from re import compile
from operator import itemgetter
from math import floor


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
            sequences_2500000 = 0
            sequences_5000000 = 0
            sequences_10000000 = 0
            sequences_25000000 = 0
            sequences_50000000 = 0
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
            bases_2500000 = 0
            bases_5000000 = 0
            bases_10000000 = 0
            bases_25000000 = 0
            bases_50000000 = 0
            
            alphabet = {}
            sequence_length = 0
            for index, line in enumerate(lines):
                line = line.strip().replace("\n", "")
                headerPatternMatch = headerPattern.match(line)
                if headerPatternMatch:
                    headers.append(headerPatternMatch[1])
                else:
                    for char in line:
                        bases += 1
                        sequence_length += 1
                        if char in alphabet:
                            alphabet[char] += 1
                        else:
                            alphabet[char] = 1

                    sequence += line

                if index + 1 == len(lines) or headerPattern.match(lines[index + 1]):
                    # bases += sequence_length
                    # print(bases)
                    sequence_lengths.append(sequence_length)

                    if sequence_length >= 50000000:
                        sequences_50000000 += 1
                        bases_50000000 += sequence_length
                    elif sequence_length >= 25000000:
                        sequences_25000000 += 1
                        bases_25000000 += sequence_length
                    elif sequence_length >= 10000000:
                        sequences_10000000 += 1
                        bases_10000000 += sequence_length
                    elif sequence_length >= 5000000:
                        sequences_5000000 += 1
                        bases_5000000 += sequence_length
                    elif sequence_length >= 2500000:
                        sequences_2500000 += 1
                        bases_2500000 += sequence_length
                    elif sequence_length >= 1000000:
                        sequences_1000000 += 1
                        bases_1000000 += sequence_length
                    elif sequence_length >= 500000:
                        sequences_500000 += 1
                        bases_500000 += sequence_length
                    elif sequence_length >= 250000:
                        sequences_250000 += 1
                        bases_250000 += sequence_length
                    elif sequence_length >= 100000:
                        sequences_100000 += 1
                        bases_100000 += sequence_length
                    elif sequence_length >= 50000:
                        sequences_50000 += 1
                        bases_50000 += sequence_length
                    elif sequence_length >= 25000:
                        sequences_25000 += 1
                        bases_25000 += sequence_length
                    elif sequence_length >= 10000:
                        sequences_10000 += 1
                        bases_10000 += sequence_length
                    elif sequence_length >= 5000:
                        sequences_5000 += 1
                        bases_5000 += sequence_length
                    elif sequence_length >= 2500:
                        sequences_2500 += 1
                        bases_2500 += sequence_length
                    elif sequence_length >= 1000:
                        sequences_1000 += 1
                        bases_1000 += sequence_length

                    sequence_length = 0

            bases = floor(bases / 1000)
            
            # sequence type
            atgcu = 0
            ts = 0
            us = 0
            if "A" in alphabet:
                atgcu += alphabet["A"]
            if "a" in alphabet:
                atgcu += alphabet["a"]
            if "T" in alphabet:
                atgcu += alphabet["T"]
                ts += alphabet["T"]
            if "t" in alphabet:
                atgcu += alphabet["t"]
                ts += alphabet["t"]
            if "G" in alphabet:
                atgcu += alphabet["G"]
            if "g" in alphabet:
                atgcu += alphabet["g"]
            if "C" in alphabet:
                atgcu += alphabet["C"]
            if "c" in alphabet:
                atgcu += alphabet["c"]
            if "U" in alphabet:
                atgcu += alphabet["U"]
                us += alphabet["U"]
            if "u" in alphabet:
                atgcu += alphabet["u"]
                us += alphabet["u"]

            if atgcu / bases > 0.5:
                if us > ts:
                    type = "rna"
                else:
                    type = "dna"
            else:
                type = "protein"

            # maskings
            maskings = set()
            hard_markings = ["N"]
            if any(char for char in alphabet if char in hard_markings):
                maskings.add("hard")
                basesHardMasked = alphabet["N"]
            else:
                basesHardMasked = 0
            if any(char for char in alphabet if char.islower()):
                maskings.add("soft")
                basesSoftMasked = 0
                for char in alphabet:
                    if char.islower():
                        basesSoftMasked += alphabet[char]
            else:
                basesSoftMasked = 0

            if "soft" not in maskings and "hard" not in maskings:
                maskings.add("none")
            
            predicted_maskings = ",".join(maskings)
            
            data = list(zip(headers, sequence_lengths))
            data.sort(key=itemgetter(1), reverse=True)
            # number of sequences
            sequences = len(data)

            # N50 / N90
            cumulative_length = 0
            n50 = 0
            n90 = 0
            for sequence in data:
                cumulative_length += sequence[1]
                if cumulative_length >= bases * 0.5 and not n50:
                    n50 = sequence[1]
                if cumulative_length >= bases * 0.9 and not n90:
                    n90 = sequence[1]

            # GC
            gc = alphabet["C"] + alphabet["G"]
            if "soft" in maskings:
                gc_soft = gc + alphabet["c"] + alphabet["g"]
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
                "sequencesLarger1000": sequences_1000,
                "cumulativeSequenceLengthSequencesLarger1000": bases_1000,
                "sequencesLarger2500": sequences_2500,
                "cumulativeSequenceLengthSequencesLarger2500": bases_2500,
                "sequencesLarger5000": sequences_5000,
                "cumulativeSequenceLengthSequencesLarger5000": bases_5000,
                "sequencesLarger10000": sequences_10000,
                "cumulativeSequenceLengthSequencesLarger10000": bases_10000,
                "sequencesLarger25000": sequences_25000,
                "cumulativeSequenceLengthSequencesLarger25000": bases_25000,
                "sequencesLarger50000": sequences_50000,
                "cumulativeSequenceLengthSequencesLarger50000": bases_50000,
                "sequencesLarger100000": sequences_100000,
                "cumulativeSequenceLengthSequencesLarger100000": bases_100000,
                "sequencesLarger250000": sequences_250000,
                "cumulativeSequenceLengthSequencesLarger250000": bases_250000,
                "sequencesLarger500000": sequences_500000,
                "cumulativeSequenceLengthSequencesLarger500000": bases_500000,
                "sequencesLarger1000000": sequences_1000000,
                "cumulativeSequenceLengthSequencesLarger1000000": bases_1000000,
                "sequencesLarger2500000": sequences_2500000,
                "cumulativeSequenceLengthSequencesLarger2500000": bases_2500000,
                "sequencesLarger5000000": sequences_5000000,
                "cumulativeSequenceLengthSequencesLarger5000000": bases_5000000,
                "sequencesLarger10000000": sequences_10000000,
                "cumulativeSequenceLengthSequencesLarger10000000": bases_10000000,
                "sequencesLarger25000000": sequences_25000000,
                "cumulativeSequenceLengthSequencesLarger25000000": bases_25000000,
                "sequencesLarger50000000": sequences_50000000,
                "cumulativeSequenceLengthSequencesLarger50000000": bases_50000000,
                "types": type,
                "maskings": predicted_maskings,
            }

            if fixedType and fixedType != type:
                return 0, {
                    "label": "Error",
                    "message": f"File includes sequences of types {type}!",
                    "type": "error",
                }
            
            return data_dict, {}

        except:
            return 0, {
                "label": "Error",
                "message": "Something went wrong while parsing file!",
                "type": "error",
            }


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
            return 0, {
                "label": "Error",
                "message": "Error while opening busco results!",
                "type": "error",
            }

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
            return 0, {
                "label": "Error",
                "message": "Error while parsing busco summary file!",
                "type": "error",
            }

        if len(data.keys()):
            return data, {}
        else:
            return 0, {
                "label": "Error",
                "message": "No data found!",
                "type": "error",
            }

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
            return 0, {
                "label": "Error",
                "message": "Error while opening fCat results!",
                "type": "error",
            }

        try:
            data = {}
            columns = [x.strip().replace("\n", "") for x in summaryData[0].split("\t")]

            for line in summaryData[1:]:
                values = line.split("\t")
                data[values[0]] = {}

                for index, value in enumerate(values[2:]):
                    data[values[0]][columns[index + 2]] = int(value)
        except:
            return 0, {
                "label": "Error",
                "message": "Error while parsing fCat results.",
                "type": "error",
            }

        if len(data.keys()):
            return data, {}
        else:
            return 0, {
                "label": "Error",
                "message": "No data found!",
                "type": "error",
            }

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
            return 0, {
                "label": "Error",
                "message": "Error while opening Repeatmasker results!",
                "type": "error",
            }

        try:
            data = {}
            value_pattern = compile(r"[\d.]+ ")

            number_of_sequences = 0
            total_sequence_length = 0
            sequence_length = 0
            gc_level = 0.0
            data["numberN"] = 0
            data["percentN"] = 0.0

            data["sines"] = 0
            data["sines_length"] = 0
            data["lines"] = 0
            data["lines_length"] = 0
            data["ltr_elements"] = 0
            data["ltr_elements_length"] = 0
            data["dna_elements"] = 0
            data["dna_elements_length"] = 0
            data["unclassified"] = 0
            data["unclassified_length"] = 0
            total_interspersed_repeats = 0
            data["rolling_circles"] = 0
            data["rolling_circles_length"] = 0
            data["small_rna"] = 0
            data["small_rna_length"] = 0
            data["satellites"] = 0
            data["satellites_length"] = 0
            data["simple_repeats"] = 0
            data["simple_repeats_length"] = 0
            data["low_complexity"] = 0
            data["low_complexity_length"] = 0
            for line in summaryData:
                if line[0] == "=" or line[0] == "-":
                    continue

                values = value_pattern.findall(line)
                values = [value.strip() for value in values]

                # header
                if len(values) == 0:
                    continue
                elif "sequences" in line.lower():
                    print(line, values)
                    number_of_sequences = int(values[0])
                    print("numberSequences", number_of_sequences)
                    continue

                elif "total length" in line.lower():
                    total_sequence_length = int(values[0])
                    sequence_length = int(values[0])
                    print("totalLength", total_sequence_length)
                    continue

                elif "gc level" in line.lower():
                    gc_level = float(values[0])
                    print("gc", gc_level)
                    continue

                elif "bases masked" in line.lower():
                    data["numberN"] = int(values[0])
                    data["percentN"] = float(values[1])
                    print("n", data["numberN"])
                    print("pn", data["percentN"])
                    continue

                # body
                if "sines" in line.lower():
                    length_occupied = int(values[1])
                    data["sines"] = int(values[0])
                    data["sines_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "lines" in line.lower():
                    length_occupied = int(values[1])
                    data["lines"] = int(values[0])
                    data["lines_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "ltr elements" in line.lower():
                    length_occupied = int(values[1])
                    data["ltr_elements"] = int(values[0])
                    data["ltr_elements_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "dna transposons" in line.lower() or "dna elements" in line.lower():
                    length_occupied = int(values[1])
                    data["dna_elements"] = int(values[0])
                    data["dna_elements_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "unclassified" in line.lower():
                    length_occupied = int(values[1])
                    data["unclassified"] = int(values[0])
                    data["unclassified_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "total interspersed repeats" in line.lower():
                    print(line, values)
                    total_interspersed_repeats = int(values[0])

                elif "rolling-circles" in line.lower():
                    length_occupied = int(values[1])
                    data["rolling_circles"] = int(values[0])
                    data["rolling_circles_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "small rna" in line.lower():
                    length_occupied = int(values[1])
                    data["small_rna"] = int(values[0])
                    data["small_rna_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "satellites" in line.lower():
                    length_occupied = int(values[1])
                    data["satellites"] = int(values[0])
                    data["satellites_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "simple repeats" in line.lower():
                    length_occupied = int(values[1])
                    data["simple_repeats"] = int(values[0])
                    data["simple_repeats_length"] = length_occupied
                    sequence_length -= length_occupied

                elif "low complexity" in line.lower():
                    length_occupied = int(values[1])
                    data["low_complexity"] = int(values[0])
                    data["low_complexity_length"] = length_occupied
                    sequence_length -= length_occupied

            data["total_non_repetitive_length"] = sequence_length
            data["total_repetitive_length"] = total_sequence_length - sequence_length
        except:
            return 0, {
                "label": "Error",
                "message": "Error while parsing repeatmasker results.",
                "type": "error",
            }

        if len(data.keys()):
            return data, {}
        else:
            return 0, {
                "label": "Error",
                "message": "No data found!",
                "type": "error",
            }
