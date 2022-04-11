export interface AssemblyInterface {
  addedBy: number;
  addedOn: Date;
  charCountString: string;
  commonName?: string;
  cumulativeSequenceLength: number;
  gcPercent: number;
  gcPercentMasked: number;
  id: number;
  imagePath: string;
  label?: string;
  largestSequence: number;
  lastUpdatedBy: number;
  lastUpdatedOn: string;
  lengthDistributionString: string;
  meanSequence: number;
  medianSequence: number;
  n50: number;
  n90: number;
  name: string;
  ncbiTaxonID: number;
  numberOfSequences: number;
  parentNcbiTaxonID: number;
  path: string;
  scientificName: string;
  sequenceType: string;
  shortestSequence: number;
  taxonID: number;
  taxonRank: string;
  username: string;
  annotations?: number;
  buscos?: number;
  fcats?: number;
  mappings?: number;
  maxBuscoScore?: number;
  maxFcatScoreM1?: number;
  maxFcatScoreM2?: number;
  maxFcatScoreM3?: number;
  maxFcatScoreM4?: number;
  taxaminers?: number;
  repeatmaskers?: number;
  averageRepetitiveness?: number;
  bookmarked?: boolean;
}

export interface AssemblyTagInterface {
  id: number;
  assemblyID: number;
  tag: string;
  color?: string;
  backgroundColor?: string;
}
