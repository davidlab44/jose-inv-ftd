// export interface Vehicle {
//     id:number;
//     name:string;



export interface Category {
  id: number;
  name: string;
  /**
   * parent_id puede venir como:
   * - false (si no tiene padre)
   * - null
   * - un número (si el backend sólo envía id)
   * - un array [id, name] (forma común de Odoo)
   */
  parent_id: number | [number, string] | null | false;
}

export const defaultCategory:Category={
    id: 0,
    name: "",
    parent_id: [0,""]
}
