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





}




