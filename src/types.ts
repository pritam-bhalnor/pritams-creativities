export interface FormData {
  leftSideLength: string;
  rightSideLength: string;
  bottomBaseLength: string;
  topSlantLength: string;
  numberOfPartitions: string;
  measureFrom: 'left' | 'right';
}

export interface Area {
  sqFt: number;
  guntha: number;
}

export interface Cut {
  k: number;
  x: number;
  y: number;
  length: number;
  sectionArea: Area;
  initiatedFrom: string;
}

export interface Partition {
  partitionIndex: number;
  leftSide: number;
  rightSide: number;
  bottomSide: number;
  topSide: number;
  area: Area;
}

export interface Results {
  totalArea: Area;
  cuts: Cut[];
  partitions: Partition[];
}
