export interface Ship {
  id: number;
  data: {
    name: string;
    imo: string;
    abb: string;
  };
}

export type ShipMap = Record<number, { name: string; imo: string }>;

export function createDefaultShip(): Ship {
  return {
    id: 0,
    data: {
      name: '',
      imo: '',
      abb: '',
    }
  }
}


