export interface Spot {
  name: string;
  status: string;
}

export interface StatusSnapshot {
  id: number;
  timestamp: string;
  spots: string; // JSON string of Spot[]
}

export interface DataByHour {
  [hour: number]: {
    [spotName: string]: string;
  };
}

export interface DateData {
  date: string;
  spots: string[];
  dataByHour: DataByHour;
}

export interface SidebarData {
  timestamp: string;
  spots: Spot[];
}
