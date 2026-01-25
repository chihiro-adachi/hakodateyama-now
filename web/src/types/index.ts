export interface Spot {
  name: string;
  status: string;
}

export interface SpotData {
  fetchedAt: string;
  spots: Spot[];
}

export interface DateInfo {
  date: string;
  files: string[];
}

export interface Index {
  dates: DateInfo[];
}

export interface DataByHour {
  [hour: number]: {
    [spotName: string]: string;
  };
}
