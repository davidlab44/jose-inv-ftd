export interface Cco {
  id: number;
  data: {
    name: string;
    color: string;
  };
}

export type CcoMap = Record<number, { name: string; color: string }>;

export function createDefaultCco(): Cco {
  return {
    id: 0,
    data: {
      name: '',
      color: '',
    }
  }
}


