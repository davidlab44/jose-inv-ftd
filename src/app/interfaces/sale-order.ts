export interface SaleOrder {
}

export interface SaleOrderDraft {
    id: number;
    int_field_1: number;
    patient_name: string;
    patient_type_document: number;
    patient_dni: string;
    patient_area: string;
}

export interface SaleOrderLine {
    id: number;
    order_id: [number,string];
    product_id: [number,string];
    productUomQty: number;
    priceUnit: number;
    discount: number;
}


