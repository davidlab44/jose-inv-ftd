export interface Replenishment {
  id: number;
  created_at: string;
  updated_at: string;
  ext_id: number;
  data: ReplenishmentData;
}

export interface ReplenishmentData {
  fecha_v: string;
  cont_vacio: string;
  rem_vacio: string;
  fe_ing_m: string;
  rem_m_ll: string;
  sur: string;
  nort: string;
  fecha: string;
  ticket: string;
  psi: number;
  opc: number;
  impo: number;
  p_total: number;
  rotogate: number;
  p_vacio_b: number;
  peso_lleno_b: number;
  p_neto: number;
  dif: number;
  precio_p: number;
  fecha_f: string;
  factura: string;
  valor_fact: number;
  sello1: string;
  sello2: string;
  sello3: string;
}









