import { MrpBom, MrpBomLine } from "./mrp-bom";
import { SaleOrderDraft, SaleOrderLine } from "./sale-order";

export interface ObjectToPrint {
    granId: number;
    sol: SaleOrderLine;
    mrpBom: MrpBom;
    mrpBomLinePresentacion: MrpBomLine;
    mrpBomLineVia: MrpBomLine;
    mrpBomLineTinfusion: MrpBomLine;
    mrpBomLineVehiculo: MrpBomLine;
    mrpBomLineConcentracionMg: MrpBomLine;
    mrpBomLineConcentracionMl: MrpBomLine;
    mrpBomLineConcentracionUi: MrpBomLine;
    temperaturaCaliente: string;
    temperaturaFria: string;
    observaciones: string;
    draft: SaleOrderDraft;
    cantidad: any;
    mrpBomLinesMadre: any;
    qfLibera: string;
    qfElabora: string;
}