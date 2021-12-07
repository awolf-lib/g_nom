from sys import argv
from os.path import exists, basename, getsize
from re import compile
from time import time

FASTA_PATTERN = compile(r"^(.+)(\.fa|\.fasta|\.fna|\.faa)$")
__TYPE_AUTO_DETECT_ATGCU_THRESHOLD = 65

# parse fasta (.fa/.fasta/.faa/.fna)
def parseFasta(path):
    """
    Reads content of .fa/.fasta/.faa/.fna
    """

    if not exists(path):
        return 0, {
            "label": "Error",
            "message": "Path not found.",
            "type": "error",
        }

    filename = basename(path)
    print(f"Parsing {filename}...")

    extensionMatch = FASTA_PATTERN.match(filename)
    if not extensionMatch:
        return (
            0,
            {
                "label": "Error",
                "message": "Uncorrect filetype! Only files of type .fa/.fasta/.faa/.fna are allowed.",
                "type": "error",
            },
        )

    lines = []
    try:
        with open(path, "r") as fa:
            lines = fa.readlines()
            fa.close()
    except:
        return 0, {
            "label": "Error",
            "message": f"Error while opening {filename}.",
            "type": "error",
        }

    if not len(lines):
        return 0, {
            "label": "Error",
            "message": f"{filename} is empty!",
            "type": "error",
        }

    # header and sequences
    try:
        sequences = []
        cumulative_char_counts = {}
        cumulative_sequence_length = 0
        length_distribution = {
            0: {},
            1000: {},
            2500: {},
            5000: {},
            10000: {},
            25000: {},
            50000: {},
            100000: {},
            250000: {},
            500000: {},
            1000000: {},
            2500000: {},
            5000000: {},
            10000000: {},
            25000000: {},
            50000000: {},
        }

        for idx, line in enumerate(lines):
            lines[idx] = line.replace("\n", "")
            # header
            if line[0] == ">":
                sequence_header = lines[idx]
                sequence_header_idx = idx
                sequence = ""
                sequence_length = 0
                char_counts = {}
            # sequences
            else:
                sequence = sequence + lines[idx]
                sequence_length = sequence_length + len(lines[idx])

                for char in lines[idx]:
                    if char in cumulative_char_counts:
                        cumulative_char_counts[char] = cumulative_char_counts[char] + 1
                    else:
                        cumulative_char_counts[char] = 1

                    if char in char_counts:
                        char_counts[char] = char_counts[char] + 1
                    else:
                        char_counts[char] = 1

            if (idx + 1 < len(lines) - 1 and lines[idx + 1][0] == ">") or idx == len(lines) - 1:
                # length distribution
                for length in length_distribution:
                    if sequence_length >= length:
                        if "n" in length_distribution[length]:
                            length_distribution[length]["n"] = length_distribution[length]["n"] + 1
                            length_distribution[length]["l"] = length_distribution[length]["l"] + sequence_length
                        else:
                            length_distribution[length]["n"] = 1
                            length_distribution[length]["l"] = sequence_length

                # local GC
                local_gc = 0
                local_gc_masked = 0
                if "G" in char_counts:
                    local_gc += char_counts["G"]
                if "g" in char_counts:
                    local_gc += char_counts["g"]
                    local_gc_masked += char_counts["g"]
                if "C" in char_counts:
                    local_gc += char_counts["C"]
                if "c" in char_counts:
                    local_gc += char_counts["c"]
                    local_gc_masked += char_counts["c"]

                local_gc /= sequence_length
                local_gc_masked /= sequence_length
                sequences.append(
                    {
                        "header": sequence_header,
                        "header_idx": sequence_header_idx,
                        "sequence": sequence,
                        "statistics": {
                            "sequence_length": sequence_length,
                            "char_counts": char_counts,
                            "GC_local": local_gc,
                            "GC_local_masked": local_gc_masked,
                        },
                    }
                )
                cumulative_sequence_length += sequence_length

                # print progress status
                progress = ((idx + 1) * 100) // len(lines)
                print(f"{progress}% done", end="\r")

        # sequence type auto detection
        DNA_RNA_ALPHABET = ["A", "a", "C", "c", "G", "g", "T", "t", "U", "u", "N", "n"]
        dna_rna_char_sum = 0
        for char in DNA_RNA_ALPHABET:
            if char in cumulative_char_counts:
                dna_rna_char_sum += cumulative_char_counts[char]

        if dna_rna_char_sum * 100 // cumulative_sequence_length <= __TYPE_AUTO_DETECT_ATGCU_THRESHOLD:
            sequence_type = "protein"
        else:
            Ts = 0
            Us = 0
            if "T" in cumulative_char_counts:
                Ts += cumulative_char_counts["T"]
            if "U" in cumulative_char_counts:
                Us += cumulative_char_counts["U"]

            if Ts > Us:
                sequence_type = "dna"
            elif Ts < Us:
                sequence_type = "rna"
            else:
                sequence_type = ""

        print(f"Sequence type detected: {sequence_type.upper()}")

        if sequence_type == "dna" or sequence_type == "rna":
            print(f"{len(sequences):,} sequences loaded! (Total length: {cumulative_sequence_length:,} bp)")
        elif sequence_type == "protein":
            print(f"{len(sequences):,} sequences loaded! (Total length: {cumulative_sequence_length:,} aa)")
        else:
            print(f"{len(sequences):,} sequences loaded! (Total length: {cumulative_sequence_length:,} chars)")

        # sorting
        print("Sorting sequences by sequence length...")
        sequences.sort(key=lambda x: x["statistics"]["sequence_length"], reverse=True)
        print("Sequences sorted!")

        # additional statistics
        print("Calculating additional statistics!")
        number_of_sequences = len(sequences)

        # mean sequence length
        mean_sequence_length = cumulative_sequence_length / number_of_sequences

        # median sequence length
        index = (number_of_sequences - 1) // 2
        if number_of_sequences % 2:
            median_sequence_length = sequences[index]["statistics"]["sequence_length"]
        else:
            median_sequence_length = (
                sequences[index]["statistics"]["sequence_length"]
                + sequences[index + 1]["statistics"]["sequence_length"]
            ) / 2

        # N50 / N90
        seq_length_sum = 0
        n50 = 0
        n90 = 0
        for seq in sequences:
            seq_length_sum += seq["statistics"]["sequence_length"]
            if seq_length_sum * 100 // cumulative_sequence_length >= 50 and not n50:
                n50 = seq["statistics"]["sequence_length"]
            if seq_length_sum * 100 // cumulative_sequence_length >= 90 and not n90:
                n90 = seq["statistics"]["sequence_length"]

        # GC
        gc_count = 0
        gc_count_masked = 0
        if "G" in cumulative_char_counts:
            gc_count += cumulative_char_counts["G"]
        if "g" in cumulative_char_counts:
            gc_count_masked += cumulative_char_counts["g"]
        if "C" in cumulative_char_counts:
            gc_count += cumulative_char_counts["C"]
        if "c" in cumulative_char_counts:
            gc_count_masked += cumulative_char_counts["c"]
        gc_count_masked += gc_count

        gc = gc_count / cumulative_sequence_length
        gc_masked = gc_count_masked / cumulative_sequence_length

        print("\nLength distribution:")
        for key in length_distribution:
            print("{:10s}".format(str(key)) + f": {length_distribution[key]}")
        print("")

        statistics = {
            "cumulative_sequence_length": cumulative_sequence_length,
            "cumulative_char_counts": cumulative_char_counts,
            "number_of_sequences": number_of_sequences,
            "min_sequence_length": sequences[-1]["statistics"]["sequence_length"],
            "max_sequence_length": sequences[0]["statistics"]["sequence_length"],
            "mean_sequence_length": mean_sequence_length,
            "median_sequence_length": median_sequence_length,
            "N50": n50,
            "N90": n90,
            "GC": gc,
            "GC_masked": gc_masked,
            "length_distribution": length_distribution,
        }

        print("\nSequence statistics:")
        for key in statistics:
            print("{:30s}".format(" ".join(key.split("_"))) + f": {statistics[key]}")
        print("")

        print(f"Done parsing {filename}!")

        return {
            "filename": filename,
            "filesize": getsize(path),
            "sequences": sequences,
            "type": sequence_type,
            "statistics": statistics,
        }, {}

    except:
        return 0, {
            "label": "Error",
            "message": f"Something went wrong while parsing {filename}!",
            "type": "error",
        }


def __readArguments():
    args = {}
    if len(argv[1:]) % 2:
        return 0

    for idx in range(1, len(argv), 2):
        if idx + 1 >= len(argv):
            return 0
        args.update({argv[idx]: argv[idx + 1]})

    return args


if __name__ == "__main__":
    start_time = time()

    # arguments
    args = __readArguments()
    if "path" not in args and "p" not in args:
        raise Exception("No path provided!")

    # parser
    fasta_content, error = parseFasta(args["path"])
    if not fasta_content:
        raise Exception(error["message"])

    end_time = time()

    print(f"Runtime: {end_time - start_time:,} seconds")
