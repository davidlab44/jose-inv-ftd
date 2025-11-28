import { Injectable } from '@angular/core';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {

  constructor() { }


downloadPDF(barcodes: string[]) {
  console.log("downloadPDF llamado con barcodes:", barcodes);

  const doc = new jsPDF();

  const promises = barcodes.map((code, index) => {
    return new Promise<void>((resolve, reject) => {
      console.log(`Generando SVG para barcode: ${code}`);

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svg, code, { format: 'CODE128', displayValue: true });

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.src = url;

      img.onload = () => {
        console.log(`Imagen cargada para barcode: ${code}`);

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("Canvas no soportado");

        ctx.drawImage(img, 0, 0);

        const pngData = canvas.toDataURL('image/png');

        const x = 10;
        const y = 10 + index * 40;
        const width = 80;
        const height = 30;
        doc.addImage(pngData, 'PNG', x, y, width, height);

        console.log(`Barcode agregado al PDF: ${code}`);
        resolve();
      };

      img.onerror = (err) => {
        console.error("Error cargando imagen del barcode:", code, err);
        reject(err);
      };
    });
  });

  Promise.all(promises)
    .then(() => {
      console.log("Todas las imágenes cargadas. Guardando PDF...");
      doc.save('barcodes.pdf');
    })
    .catch(err => {
      console.error("Error generando el PDF:", err);
    });
}











  /*generateBarcodesPDF(barcodes: string[]) {*/
    /*// Número mínimo y máximo por página*/
    /*const MIN = 20;*/
    /*const MAX = 50;*/

    /*if (barcodes.length < MIN) {*/
      /*console.warn(`Mínimo ${MIN} barcodes. Se recibieron: ${barcodes.length}`);*/
    /*}*/
    /*if (barcodes.length > MAX) {*/
      /*console.warn(`Máximo ${MAX} barcodes. Se recibieron: ${barcodes.length}`);*/
    /*}*/

    /*const doc = new jsPDF({ unit: 'mm', format: 'a4' });*/

    /*const pageWidth = 210;   // A4 mm*/
    /*const pageHeight = 297;  // A4 mm*/

    /*const margin = 10;*/
    /*const usableWidth = pageWidth - margin * 2;*/
    /*const usableHeight = pageHeight - margin * 2;*/

    /*// Ajuste para acomodar 20–50 barcodes respetando la hoja A4*/
    /*const barcodesPerPage = Math.min(Math.max(barcodes.length, MIN), MAX);*/

    /*// Cálculo automático de columnas y filas*/
    /*const cols = 3;                 // 3 columnas es el equilibrio ideal A4*/
    /*const rows = Math.ceil(barcodesPerPage / cols);*/

    /*// Dimensiones del barcode*/
    /*const barcodeWidth = usableWidth / cols - 5;   // compactado*/
    /*const barcodeHeight = 18;                      // reducidos*/

    /*let currentIndex = 0;*/

    /*const promises = barcodes.map((code) => {*/
      /*return new Promise<void>((resolve, reject) => {*/
        /*const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');*/
        /*JsBarcode(svg, code, {*/
          /*format: 'CODE128',*/
          /*displayValue: true,*/
          /*fontSize: 10,*/
          /*width: 1,*/
          /*height: 30*/
        /*});*/

        /*const svgData = new XMLSerializer().serializeToString(svg);*/
        /*const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });*/
        /*const url = URL.createObjectURL(blob);*/

        /*const img = new Image();*/
        /*img.src = url;*/

        /*img.onload = () => {*/
          /*const canvas = document.createElement('canvas');*/
          /*canvas.width = 260; // más pequeño → PNG más liviano*/
          /*canvas.height = 80;*/
          /*const ctx = canvas.getContext('2d');*/
          /*if (!ctx) return reject("Canvas no soportado");*/

          /*ctx.drawImage(img, 0, 0, canvas.width, canvas.height);*/

          /*const png = canvas.toDataURL('image/png', 0.7); // compresión PNG*/

          /*const colIndex = currentIndex % cols;*/
          /*const rowIndex = Math.floor(currentIndex / cols);*/

          /*const x = margin + colIndex * (barcodeWidth + 5);*/
          /*const y = margin + rowIndex * (barcodeHeight + 12);*/

          /*doc.addImage(png, 'PNG', x, y, barcodeWidth, barcodeHeight);*/

          /*currentIndex++;*/
          /*resolve();*/
        /*};*/

        /*img.onerror = reject;*/
      /*});*/
    /*});*/

    /*Promise.all(promises)*/
      /*.then(() => {*/
        /*doc.save('barcodes.pdf');*/
      /*})*/
      /*.catch(err => console.error("Error generando PDF:", err));*/
  /*}*/



/*//genera 30 por hoja*/
  /*generateBarcodesPDF(barcodes: string[]) {*/
    /*const MIN = 20;*/
    /*const MAX = 50;*/
    /*const doc = new jsPDF({ unit: 'mm', format: 'a4' });*/
    /*const pageWidth = 210;*/
    /*const pageHeight = 297;*/
    /*const margin = 10;*/
    /*const usableWidth = pageWidth - margin * 2;*/
    /*const usableHeight = pageHeight - margin * 2;*/
    /*const barcodesPerPage = Math.min(Math.max(barcodes.length, MIN), MAX);*/
    /*const cols = 3;*/
    /*const rows = Math.ceil(barcodesPerPage / cols);*/
    /*const barcodeWidth = usableWidth / cols - 5;*/
    /*const barcodeHeight = 18;*/
    /*let currentIndex = 0;*/
    /*const promises = barcodes.map(code => {*/
      /*return new Promise<void>((resolve, reject) => {*/
        /*const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');*/
        /*JsBarcode(svg, code, { format: 'CODE128', displayValue: false, width: 1, height: 30 });*/
        /*const svgData = new XMLSerializer().serializeToString(svg);*/
        /*const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });*/
        /*const url = URL.createObjectURL(blob);*/
        /*const img = new Image();*/
        /*img.src = url;*/
        /*img.onload = () => {*/
          /*const canvas = document.createElement('canvas');*/
          /*canvas.width = 260;*/
          /*canvas.height = 80;*/
          /*const ctx = canvas.getContext('2d');*/
          /*if (!ctx) return reject("Canvas no soportado");*/
          /*ctx.drawImage(img, 0, 0, canvas.width, canvas.height);*/
          /*const png = canvas.toDataURL('image/png', 0.7);*/
          /*const colIndex = currentIndex % cols;*/
          /*const rowIndex = Math.floor(currentIndex / cols);*/
          /*const x = margin + colIndex * (barcodeWidth + 5);*/
          /*const y = margin + rowIndex * (barcodeHeight + 12);*/
          /*doc.addImage(png, 'PNG', x, y, barcodeWidth, barcodeHeight);*/
          /*currentIndex++;*/
          /*resolve();*/
        /*};*/
        /*img.onerror = reject;*/
      /*});*/
    /*});*/
    /*Promise.all(promises).then(() => { doc.save('barcodes.pdf'); }).catch(err => console.error(err));*/
  /*}*/












//60 barcodes
generateBarcodesPDF(barcodes: string[]) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 6;
  const cols = 5;
  const rows = 12;
  const barcodeWidth = (pageWidth - margin * 2) / cols - 2;
  const barcodeHeight = 16;
  let currentIndex = 0;
  const promises = barcodes.map(code => {
    return new Promise<void>((resolve, reject) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svg, code, { format: 'CODE128', displayValue: true, width: 1, height: 30 });
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 260;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("Canvas no soportado");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const png = canvas.toDataURL('image/png', 0.7);
        const colIndex = currentIndex % cols;
        const rowIndex = Math.floor(currentIndex / cols);
        const x = margin + colIndex * (barcodeWidth + 2);
        const y = margin + rowIndex * (barcodeHeight + 4);
        doc.addImage(png, 'PNG', x, y, barcodeWidth, barcodeHeight);
        currentIndex++;
        resolve();
      };
      img.onerror = reject;
    });
  });
  Promise.all(promises).then(() => { doc.save('barcodes.pdf'); }).catch(err => console.error(err));
}




  /*generateBarcodesPDF(barcodes: string[]) {*/
    /*const doc = new jsPDF({ unit: 'mm', format: 'a4' });*/
    /*const pageWidth = 210;*/
    /*const pageHeight = 297;*/
    /*const margin = 6;*/
    /*const cols = 9;*/
    /*const rows = 12;*/
    /*const barcodeWidth = (pageWidth - margin * 2) / cols - 1;*/
    /*const barcodeHeight = 16;*/
    /*let currentIndex = 0;*/
    /*const promises = barcodes.map(code => {*/
      /*return new Promise<void>((resolve, reject) => {*/
        /*const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');*/
        /*JsBarcode(svg, code, { format: 'CODE128', displayValue: false, width: 1, height: 30 });*/
        /*const svgData = new XMLSerializer().serializeToString(svg);*/
        /*const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });*/
        /*const url = URL.createObjectURL(blob);*/
        /*const img = new Image();*/
        /*img.src = url;*/
        /*img.onload = () => {*/
          /*const canvas = document.createElement('canvas');*/
          /*canvas.width = 260;*/
          /*canvas.height = 80;*/
          /*const ctx = canvas.getContext('2d');*/
          /*if (!ctx) return reject("Canvas no soportado");*/
          /*ctx.drawImage(img, 0, 0, canvas.width, canvas.height);*/
          /*const png = canvas.toDataURL('image/png', 0.7);*/
          /*const colIndex = currentIndex % cols;*/
          /*const rowIndex = Math.floor(currentIndex / cols);*/
          /*const x = margin + colIndex * (barcodeWidth + 1);*/
          /*const y = margin + rowIndex * (barcodeHeight + 3.6);*/
          /*doc.addImage(png, 'PNG', x, y, barcodeWidth, barcodeHeight);*/
          /*currentIndex++;*/
          /*resolve();*/
        /*};*/
        /*img.onerror = reject;*/
      /*});*/
    /*});*/
    /*Promise.all(promises).then(() => { doc.save('barcodes.pdf'); }).catch(err => console.error(err));*/
  /*}*/







}




