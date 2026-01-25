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
}

export interface Index {
  dates: DateInfo[];
}

export interface DataByHour {
  [hour: number]: {
    [spotName: string]: string;
  };
}

export interface DailyData {
  date: string;
  generatedAt: string;
  hours: {
    [hour: number]: {
      [spotName: string]: string;
    };
  };
}
