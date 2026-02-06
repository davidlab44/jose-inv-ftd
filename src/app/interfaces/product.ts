


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





/*export interface Product {*/
    /*id:string;*/
    /*categ_id:[number,string];*/
    /*create_uid:[number,string];*/
    /*default_code:boolean;*/
    /*description:[boolean | string];*/
    /*image_1920:[boolean | string];*/
    /*list_price:number;*/
    /*name:string;*/
    /*qty_available:string;*/
/*}*/
