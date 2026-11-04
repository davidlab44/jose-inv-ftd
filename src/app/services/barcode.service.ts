
import { Injectable } from '@angular/core';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {

  constructor() { }

  printIn50mmPortablePrinterBt(productName:string,barcodes:string[],text:string) {

    const pageWidthMm = 48;
    const pageHeightMm = 25;

    const pxPerMm = 16;
    const canvasWidth = pageWidthMm * pxPerMm;
    const canvasHeight = pageHeightMm * pxPerMm;

    // 🔢 Layout vertical: 20 / 60 / 20
    const topTextHeightPx = canvasHeight * 0.2;
    const barcodeHeightPx = canvasHeight * 0.6;
    const bottomTextHeightPx = canvasHeight * 0.2;

    barcodes.forEach((code) => {

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      JsBarcode(svg, code, {
        format: 'CODE128',
        displayValue: false,
        margin: 0
      });

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.src = url;

      img.onload = () => {

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Canvas no soportado');
          return;
        }

        // 🎨 Fondo blanco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 🏢 Texto superior (20%)
        ctx.fillStyle = '#000000';
        ctx.font = `${pxPerMm * 2.2}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(
          productName.slice(0, 30),
          canvasWidth / 2,
          topTextHeightPx / 2
        );

        // 🧾 Código de barras (60%) – más angosto y centrado
        const horizontalScaleFactor = 0.8; // 👈 ajuste clave

        const scale = canvasWidth / img.width;
        const drawWidth = img.width * scale * horizontalScaleFactor;
        const drawHeight = barcodeHeightPx;

        const barcodeX = (canvasWidth - drawWidth) / 2;
        const barcodeY = topTextHeightPx;

        ctx.drawImage(
          img,
          barcodeX,
          barcodeY,
          drawWidth,
          drawHeight
        );

        // ✍️ Texto inferior (20%)
        ctx.font = `${pxPerMm * 2.5}px monospace`;

        const textX = canvasWidth / 2;
        const textY =
          topTextHeightPx +
          barcodeHeightPx +
          (bottomTextHeightPx / 2);

        ctx.fillText(text, textX, textY);

        // 💾 Descargar PNG
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `barcode-${code}.png`;
            a.click();
            URL.revokeObjectURL(downloadUrl);
          } else {
            console.error('No se pudo generar el PNG.');
          }
          URL.revokeObjectURL(url);
        }, 'image/png');
      };

      img.onerror = (err) => {
        console.error('Error cargando imagen del código:', code, err);
        URL.revokeObjectURL(url);
      };
    });
  }


 printIn50mmPortablePrinterBt2(barcodes: string[]) {
    console.log('Imprimiendo en rollo 50mm. Códigos:', barcodes);
    // Medidas en mm
    const pageWidth = 50;     // ancho del rollo (50 mm)
    const margin = 2;         // margen lateral
    const barcodeWidth = pageWidth - margin * 2; // ancho útil
    const barcodeHeight = 20; // alto del código de barras en mm (ajústalo a gusto)
    const pageHeight = 100;   // alto de la “página” del rollo (puede ser arbitrario)

    // PDF con ancho 50 mm
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageWidth, pageHeight],
    });

    // Resolución del canvas para que el código se vea nítido
    const pxPerMm = 8; // 8 px/mm ~ 200 dpi aprox (típico en térmicas 203 dpi)
    const canvasWidth = barcodeWidth * pxPerMm;
    const canvasHeight = barcodeHeight * pxPerMm;

    let currentY = margin; // posición vertical actual dentro de la página

    const promises = barcodes.map((code, index) => {
      return new Promise<void>((resolve, reject) => {
        console.log(`Generando SVG para barcode (50mm): ${code}`);

        // 1. Generamos el SVG con JsBarcode
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        JsBarcode(svg, code, {
          format: 'CODE128',
          displayValue: true,
          margin: 0, // ya controlamos el margen en el PDF
        });

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // 2. Pasamos el SVG a <img> para poder dibujarlo en un canvas
        const img = new Image();
        img.src = url;

        img.onload = () => {
          console.log(`Imagen cargada (50mm) para barcode: ${code}`);

          const canvas = document.createElement('canvas');
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject('Canvas no soportado');
            return;
          }

          // Fondo blanco
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // 3. Escalamos la imagen para que quepa exactamente en el ancho útil
          const scale = Math.min(
            canvasWidth / img.width,
            canvasHeight / img.height,
          );

          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;
          const offsetX = (canvasWidth - drawWidth) / 2;
          const offsetY = (canvasHeight - drawHeight) / 4; // deja un poco de espacio abajo para el texto
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          const pngData = canvas.toDataURL('image/png');
          if (currentY + barcodeHeight + margin > pageHeight) {
            doc.addPage([pageWidth, pageHeight]);
            currentY = margin;
          }
          doc.addImage(
            pngData,
            'PNG',
            margin,          // x
            currentY,        // y
            barcodeWidth,    // ancho en mm (dentro de los 50 mm)
            barcodeHeight    // alto en mm
          );
          currentY += barcodeHeight + margin;
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = (err) => {
          console.error('Error cargando imagen del barcode (50mm):', code, err);
          URL.revokeObjectURL(url);
          reject(err);
        };
      });
    });

    Promise.all(promises)
      .then(() => {
        console.log('PDF 50mm generado correctamente.');
        doc.save('barcodes-50mm.pdf');
      })
      .catch(err => {
        console.error('Error generando el PDF 50mm:', err);
      });
  }

  printInA4PaperPdf(barcodes: string[]) {
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



}




