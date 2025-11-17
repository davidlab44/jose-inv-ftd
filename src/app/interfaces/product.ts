


export interface Product {
  id: number;
  creado_en: string;               // ISO datetime string
  datos: {
    um: string;                    // unidad de medida (string porque viene "8")
    qty: number;
    name: string;
    categ: number[];               // array de IDs numéricos
  };
}





export const defaultProduct: Product = {
  id: 0,
  creado_en: new Date().toISOString(),
  datos: {
    um: "0",
    qty: 1,
    name: "",
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
