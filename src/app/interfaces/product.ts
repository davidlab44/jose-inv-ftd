


export interface Product {
  id: number;
  creado_en: string;               // ISO datetime string
  data: {
    um: string;     
    qty: number;
    name: string;
    barcode: string;
    categ: number[];
  };
}





export const defaultProduct: Product = {
  id: 0,
  creado_en: new Date().toISOString(),
  data: {
    um: "0",
    qty: 0,
    name: "",
    barcode: "",
    categ: []
  }
};




export function createDefaultWithdrawn(): Withdrawn {
  return {
    id: 0,
    ext_id: null,
    created_at: '',
    updated_at: '',
    data: { ...defaultWithdrawnData },
    refdate: '',
    state: '',
    diff: 0
  };
}



export const defaultWithdrawnData: WithdrawnData = {
  kg: 0,
  img: '',
  psi: 0,
  date: '',
  name: 0,
  seal: [],
  wnet: 0,
  price: 0,
  wtare: 0,
  wgross: 0,
  datein: '',
  dateout: '',
  shipin: 0,
  shipout: 0,
  tripin: '',
  tripout: '',
  ticket: '',
  wticket: 0,
  vendor: 0,
  rotogate: 0,
  deliveryin: '',
  deliveryout:'',
};  

export interface WithdrawnData {
  kg: number;
  img: string;
  psi: number;
  date: string;
  name: number;
  seal: string[];
  wnet: number;
  price: number;
  wtare: number;
  wgross: number;
  datein: string;
  dateout: string;
  shipin: number;
  shipout: number;
  tripin: string;
  tripout: string;
  ticket: string;
  wticket: number;
  vendor: number;
  rotogate: number;
  deliveryin: string;
  deliveryout: string;
}

export interface Withdrawn {
  id: number;
  ext_id: number | null;
  created_at: string;
  updated_at: string;
  data: WithdrawnData;
  refdate: string;
  state: string;
  diff: number;
}

export const defaultWithdrawn: Withdrawn= {
    id: 0,
    ext_id: null,
    created_at: '',
    updated_at: '',
    data: defaultWithdrawnData,
    refdate: '',
    state: '',
    diff: 0
}


