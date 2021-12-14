export interface AssemblyInterface {
  addedBy: number;
  addedOn: string;
  bookmarked: number;
  charCountString: string;
  cumulativeSequenceLength: number;
  gcPercent: number;
  gcPercentMasked: number;
  id: number;
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
  path: string;
  sequenceType: string;
  shortestSequence: string;
  taxonID: string;
  username: string;
}

export interface AssemblyTagInterface {
  id: number;
  assemblyID: number;
  tag: string;
  color?: string;
}
