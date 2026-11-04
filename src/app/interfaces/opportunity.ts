export interface Opportunity {
    id: number;
    name: string;
    description:string;
    create_uid:[number,string];
    categ_id:[number,string];
    default_code: boolean;
    list_price: number;
    qty_available: number;
    image_1920: boolean | string;
}

export interface ProductData {
    name: string;
    list_price: number;
    type: string;
    categ_id:[number | boolean,string];
    description: string;
    resizedImage:string;
}
