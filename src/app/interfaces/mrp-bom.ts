

export interface MrpBom {
    id: number;
    analytic_distribution: boolean;
    analytic_distribution_search: boolean;
    analytic_precision: number;
    message_is_follower: boolean;
    message_follower_ids: number[];
    message_partner_ids: number[];
    message_ids: number[];
    has_message: boolean;
    message_needaction: boolean;
    message_needaction_counter: number;
    message_has_error: boolean;
    message_has_error_counter: number;
    message_attachment_count: number;
    website_message_ids: number[];
    message_has_sms_error: boolean;
    code: boolean;
    active: boolean;
    type: string;
    product_tmpl_id: [number, string]; // Tuple with ID and description
    product_id: [number,string];
    bom_line_ids: number[];
    byproduct_ids: number[];
    product_qty: number;
    product_uom_id: [number, string]; // Tuple with ID and unit
    product_uom_category_id: [number, string]; // Tuple with ID and category
    sequence: number;
    operation_ids: number[];
    ready_to_produce: string;
    picking_type_id: boolean;
    company_id: [number, string]; // Tuple with ID and company name
    consumption: string;
    possible_product_template_attribute_value_ids: number[];
    allow_operation_dependencies: boolean;
    produce_delay: number;
    days_to_prepare_mo: number;
    display_name: string;
    create_uid: [number, string]; // Tuple with ID and username
    create_date: string; // Date as string
    write_uid: [number, string]; // Tuple with ID and username
    write_date: string; // Date as string
    analytic_distribution_text: boolean;
    analytic_account_ids: number[];
    str_field_1: string;
    str_field_2: string;
    str_field_3: string;
    str_field_4: string;
    str_field_5: string;
    bool_field_1: boolean;
    bool_field_2: boolean;
    bool_field_3: boolean;
    bool_field_4: boolean;
    bool_field_5: boolean;
    sale_image_1920: '' | boolean;
    int_field_1: number;
    int_field_2: number;
    int_field_3: number;
    int_field_4: number;
    int_field_5: number;
}

export interface MrpBomLine {
    product_id: number,
    product_qty: number,
    product_uom_id: number,
    str_field_5: string;
}
