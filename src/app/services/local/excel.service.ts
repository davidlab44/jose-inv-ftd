import { Injectable } from '@angular/core';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable({providedIn:'root'})
export class ExcelService{
  constructor(){}

  async exportInventory(items:any[],ums:any[]=[],categories:any[]=[],fileName:string='inventario'){
    if(!items?.length)return;

    const umMap:any={};
    ums?.forEach(u=>umMap[u.id]=u.data?.name||'');

    const categoryMap:any={};
    categories?.forEach(c=>categoryMap[c.id]=c.data?.nombre||'');

    const wb=new ExcelJS.Workbook();
    const ws=wb.addWorksheet('Inventario');

    ws.columns=[
      {header:'Categoría',key:'categ',width:25},
      {header:'Nombre',key:'name',width:60},
      {header:'Cant.',key:'qty',width:15},
      {header:'Unidad',key:'um',width:20}
    ];

    items.forEach(item=>{
      const d=item.data||{};
      const categ=Array.isArray(d.categ)
        ? d.categ.map((id:any)=>categoryMap[id]||id).join(', ')
        : categoryMap[d.categ]||d.categ||'';

      ws.addRow({
        categ,
        name:d.name||'',
        qty:d.qty||'',
        um:umMap[d.um]||d.um||''
      });
    });

    const header=ws.getRow(1);
    header.font={bold:true,color:{argb:'FFFFFF'}};
    header.fill={type:'pattern',pattern:'solid',fgColor:{argb:'4472C4'}};
    ws.views=[{state:'frozen',ySplit:1}];
    ws.autoFilter={from:'A1',to:{row:1,column:ws.columnCount}};

    saveAs(new Blob([await wb.xlsx.writeBuffer()]),`${fileName}.xlsx`);
  }
}
