
import { Injectable } from '@angular/core';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {

  constructor() { }



printIn50mmPortablePrinterBt(barcodes: string[], text: string) {
  const pageWidthMm = 48; // Ancho reducido para margen izquierdo
  const pageHeightMm = 25;

  const pxPerMm = 16; // Resolución duplicada (más calidad)
  const canvasWidth = pageWidthMm * pxPerMm;
  const canvasHeight = pageHeightMm * pxPerMm;

  const barcodeHeightMm = pageHeightMm * 0.7;
  const barcodeHeightPx = barcodeHeightMm * pxPerMm;

  barcodes.forEach((code) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, code, {
      format: 'CODE128',
      displayValue: false,
      margin: 0,
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

      // 🧾 Dibujar código de barras (70% alto)
      const scale = canvasWidth / img.width;
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;

      const offsetX = 0;
      const offsetY = 0;

      ctx.drawImage(img, offsetX, offsetY, drawWidth, barcodeHeightPx);

      // ✍️ Texto en parte inferior (30%)
      ctx.fillStyle = '#000000';
      ctx.font = `${pxPerMm * 2.5}px sans-serif`; // Tamaño ajustado a mayor resolución
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textX = canvasWidth / 2;
      const textY = barcodeHeightPx + ((canvasHeight - barcodeHeightPx) / 2);

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




  /*printIn50mmPortablePrinterBt(barcodes: string[], text: string) {*/
  /*const pageWidthMm = 50;*/
  /*const pageHeightMm = 25;*/

  /*const pxPerMm = 8;*/
  /*const canvasWidth = pageWidthMm * pxPerMm;*/
  /*const canvasHeight = pageHeightMm * pxPerMm;*/

  /*const barcodeHeightMm = pageHeightMm * 0.7;*/
  /*const barcodeHeightPx = barcodeHeightMm * pxPerMm;*/

  /*barcodes.forEach((code) => {*/
    /*const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');*/
    /*JsBarcode(svg, code, {*/
      /*format: 'CODE128',*/
      /*displayValue: false,*/
      /*margin: 0,*/
    /*});*/

    /*const svgData = new XMLSerializer().serializeToString(svg);*/
    /*const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });*/
    /*const url = URL.createObjectURL(svgBlob);*/

    /*const img = new Image();*/
    /*img.src = url;*/

    /*img.onload = () => {*/
      /*const canvas = document.createElement('canvas');*/
      /*canvas.width = canvasWidth;*/
      /*canvas.height = canvasHeight;*/

      /*const ctx = canvas.getContext('2d');*/
      /*if (!ctx) {*/
        /*console.error('Canvas no soportado');*/
        /*return;*/
      /*}*/

      /*// 🎨 Fondo blanco*/
      /*ctx.fillStyle = '#ffffff';*/
      /*ctx.fillRect(0, 0, canvasWidth, canvasHeight);*/

      /*// 🧾 Dibujar código de barras (70% alto)*/
      /*const scale = canvasWidth / img.width;*/
      /*const drawWidth = img.width * scale;*/
      /*const drawHeight = img.height * scale;*/

      /*const offsetX = 0;*/
      /*const offsetY = 0;*/

      /*ctx.drawImage(img, offsetX, offsetY, drawWidth, barcodeHeightPx);*/

      /*// ✍️ Texto en parte inferior (30%)*/
      /*ctx.fillStyle = '#000000';*/
      /*ctx.font = `${pxPerMm * 2.5}px sans-serif`; // ≈20px*/
      /*ctx.textAlign = 'center';*/
      /*ctx.textBaseline = 'middle';*/

      /*const textX = canvasWidth / 2;*/
      /*const textY = barcodeHeightPx + ((canvasHeight - barcodeHeightPx) / 2);*/

      /*ctx.fillText(text, textX, textY);*/

      /*// 💾 Descargar PNG*/
      /*canvas.toBlob((blob) => {*/
        /*if (blob) {*/
          /*const downloadUrl = URL.createObjectURL(blob);*/
          /*const a = document.createElement('a');*/
          /*a.href = downloadUrl;*/
          /*a.download = `barcode-${code}.png`;*/
          /*a.click();*/
          /*URL.revokeObjectURL(downloadUrl);*/
        /*} else {*/
          /*console.error('No se pudo generar el PNG.');*/
        /*}*/
        /*URL.revokeObjectURL(url);*/
      /*}, 'image/png');*/
    /*};*/

    /*img.onerror = (err) => {*/
      /*console.error('Error cargando imagen del código:', code, err);*/
      /*URL.revokeObjectURL(url);*/
    /*};*/
  /*});*/
/*}*/





//imprime el codigo sobre el texto


/*printIn50mmPortablePrinterBt(barcodes: string[], text: string) {*/
  /*const pageWidthMm = 50;*/
  /*const barcodeHeightMm = 15;*/
  /*const textAreaHeightMm = 12;*/
  /*const pageHeightMm = barcodeHeightMm + textAreaHeightMm;*/

  /*const pxPerMm = 8;*/
  /*const canvasWidth = pageWidthMm * pxPerMm;*/
  /*const canvasHeight = pageHeightMm * pxPerMm;*/
  /*const barcodeHeightPx = barcodeHeightMm * pxPerMm;*/

  /*barcodes.forEach((code) => {*/
    /*const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');*/
    /*JsBarcode(svg, code, {*/
      /*format: 'CODE128',*/
      /*displayValue: false,*/
      /*margin: 0,*/
    /*});*/

    /*const svgData = new XMLSerializer().serializeToString(svg);*/
    /*const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });*/
    /*const url = URL.createObjectURL(svgBlob);*/

    /*const img = new Image();*/
    /*img.src = url;*/

    /*img.onload = () => {*/
      /*const canvas = document.createElement('canvas');*/
      /*canvas.width = canvasWidth;*/
      /*canvas.height = canvasHeight;*/

      /*const ctx = canvas.getContext('2d');*/
      /*if (!ctx) {*/
        /*console.error('Canvas no soportado');*/
        /*return;*/
      /*}*/

      /*// 🎨 Fondo blanco*/
      /*ctx.fillStyle = '#ffffff';*/
      /*ctx.fillRect(0, 0, canvasWidth, canvasHeight);*/

      /*// 🔳 Dibujar código de barras (escalado al ancho)*/
      /*const scale = canvasWidth / img.width;*/
      /*const drawWidth = img.width * scale;*/
      /*const drawHeight = img.height * scale;*/

      /*const offsetX = 0;*/
      /*const offsetY = 0;*/

      /*ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);*/

      /*// ✍️ Agregar texto debajo del código*/
      /*ctx.fillStyle = '#000000';*/
      /*ctx.font = `${pxPerMm * 2.5}px sans-serif`; // ≈20px*/
      /*ctx.textAlign = 'center';*/
      /*ctx.textBaseline = 'middle';*/

      /*const textX = canvasWidth / 2;*/
      /*const textY = barcodeHeightPx + ((canvasHeight - barcodeHeightPx) / 2); // mitad del área inferior*/

      /*ctx.fillText(text, textX, textY);*/

      /*// 💾 Descargar PNG*/
      /*canvas.toBlob((blob) => {*/
        /*if (blob) {*/
          /*const downloadUrl = URL.createObjectURL(blob);*/
          /*const a = document.createElement('a');*/
          /*a.href = downloadUrl;*/
          /*a.download = `barcode-${code}.png`;*/
          /*a.click();*/
          /*URL.revokeObjectURL(downloadUrl);*/
        /*} else {*/
          /*console.error('No se pudo generar el PNG.');*/
        /*}*/
        /*URL.revokeObjectURL(url);*/
      /*}, 'image/png');*/
    /*};*/

    /*img.onerror = (err) => {*/
      /*console.error('Error cargando imagen del código:', code, err);*/
      /*URL.revokeObjectURL(url);*/
    /*};*/
  /*});*/
/*}*/








//esto imprime el texto
/*printIn50mmPortablePrinterBt(barcodes: string[], text: string) {*/
  /*// 📐 Tamaño del canvas en milímetros*/
  /*const pageWidthMm = 50;*/
  /*const pageHeightMm = 20;*/

  /*// 📏 Conversión a pixeles (200 DPI ≈ 8 px/mm)*/
  /*const pxPerMm = 8;*/
  /*const canvasWidth = pageWidthMm * pxPerMm;*/
  /*const canvasHeight = pageHeightMm * pxPerMm;*/

  /*// 🖼️ Crear canvas*/
  /*const canvas = document.createElement('canvas');*/
  /*canvas.width = canvasWidth;*/
  /*canvas.height = canvasHeight;*/

  /*const ctx = canvas.getContext('2d');*/
  /*if (!ctx) {*/
    /*console.error('No se pudo crear el contexto del canvas');*/
    /*return;*/
  /*}*/

  /*// 🎨 Fondo blanco*/
  /*ctx.fillStyle = '#ffffff';*/
  /*ctx.fillRect(0, 0, canvasWidth, canvasHeight);*/

  /*// ✍️ Texto negro, centrado*/
  /*ctx.fillStyle = '#000000';*/
  /*ctx.font = `${pxPerMm * 2.5}px sans-serif`; // ≈20px*/
  /*ctx.textAlign = 'center';*/
  /*ctx.textBaseline = 'middle';*/

  /*const textX = canvasWidth / 2;*/
  /*const textY = canvasHeight / 2;*/

  /*ctx.fillText(text, textX, textY);*/

  /*// 💾 Descargar PNG*/
  /*canvas.toBlob((blob) => {*/
    /*if (blob) {*/
      /*const downloadUrl = URL.createObjectURL(blob);*/
      /*const a = document.createElement('a');*/
      /*a.href = downloadUrl;*/
      /*a.download = 'texto.png';*/
      /*a.click();*/
      /*URL.revokeObjectURL(downloadUrl);*/
    /*} else {*/
      /*console.error('No se pudo generar el PNG.');*/
    /*}*/
  /*}, 'image/png');*/
/*}*/








//perfecto pero sin texto

/*printIn50mmPortablePrinterBt(barcodes: string[], belowText:string) {*/
  /*console.log('Generando PNGs para impresión térmica 50mm FULL WIDTH:', barcodes);*/

  /*// 📐 Ancho total del rollo (50 mm)*/
  /*const pageWidthMm = 50;*/
  /*const barcodeHeightMm = 15; // un poco más alto si quieres*/
  /*const marginMm = 1; // margen lateral mínimo para que no se corte*/

  /*// 📏 Resolución: 8 px/mm = ~200 DPI*/
  /*const pxPerMm = 8;*/
  /*const canvasWidth = pageWidthMm * pxPerMm; // 🔥 ahora usamos todo el ancho disponible*/
  /*const canvasHeight = barcodeHeightMm * pxPerMm;*/

  /*barcodes.forEach((code) => {*/
    /*const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');*/
    /*JsBarcode(svg, code, {*/
      /*format: 'CODE128',*/
      /*displayValue: true,*/
      /*margin: 0, // sin margen interno, lo controlamos con el canvas*/
    /*});*/

    /*const svgData = new XMLSerializer().serializeToString(svg);*/
    /*const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });*/
    /*const url = URL.createObjectURL(svgBlob);*/
    /*const img = new Image();*/
    /*img.src = url;*/

    /*img.onload = () => {*/
      /*const canvas = document.createElement('canvas');*/
      /*canvas.width = canvasWidth;*/
      /*canvas.height = canvasHeight;*/

      /*const ctx = canvas.getContext('2d');*/
      /*if (!ctx) {*/
        /*console.error('Canvas no soportado');*/
        /*return;*/
      /*}*/

      /*// Fondo blanco*/
      /*ctx.fillStyle = '#ffffff';*/
      /*ctx.fillRect(0, 0, canvasWidth, canvasHeight);*/

      /*// 🔍 Escalar el código para que use todo el ancho*/
      /*const scale = canvasWidth / img.width;*/
      /*const drawWidth = img.width * scale;*/
      /*const drawHeight = img.height * scale;*/
      /*const offsetX = 0;*/
      /*const offsetY = (canvasHeight - drawHeight) / 2;*/

      /*ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);*/

      /*// 🔽 Descargar la imagen (puedes luego usarla en RAW BT)*/
      /*canvas.toBlob((blob) => {*/
        /*if (blob) {*/
          /*const downloadUrl = URL.createObjectURL(blob);*/
          /*const a = document.createElement('a');*/
          /*a.href = downloadUrl;*/
          /*a.download = `barcode-${code}.png`;*/
          /*a.click();*/
          /*URL.revokeObjectURL(downloadUrl);*/
        /*} else {*/
          /*console.error('No se pudo generar el PNG.');*/
        /*}*/
        /*URL.revokeObjectURL(url);*/
      /*}, 'image/png');*/
    /*};*/

    /*img.onerror = (err) => {*/
      /*console.error('Error cargando imagen del código:', code, err);*/
      /*URL.revokeObjectURL(url);*/
    /*};*/
  /*});*/
/*}*/


  /*printIn50mmPortablePrinterBt(barcodes: string[]) {*/
  /*console.log('Generando PNGs para impresión térmica 50mm FULL WIDTH:', barcodes);*/

  /*// 📐 Ancho total del rollo (50 mm)*/
  /*const pageWidthMm = 50;*/
  /*const barcodeHeightMm = 15; // un poco más alto si quieres*/
  /*const marginMm = 1; // margen lateral mínimo para que no se corte*/

  /*// 📏 Resolución: 8 px/mm = ~200 DPI*/
  /*const pxPerMm = 8;*/
  /*const canvasWidth = pageWidthMm * pxPerMm; // 🔥 ahora usamos todo el ancho disponible*/
  /*const canvasHeight = barcodeHeightMm * pxPerMm;*/

  /*barcodes.forEach((code) => {*/
    /*const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');*/
    /*JsBarcode(svg, code, {*/
      /*format: 'CODE128',*/
      /*displayValue: true,*/
      /*margin: 0, // sin margen interno, lo controlamos con el canvas*/
    /*});*/

    /*const svgData = new XMLSerializer().serializeToString(svg);*/
    /*const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });*/
    /*const url = URL.createObjectURL(svgBlob);*/
    /*const img = new Image();*/
    /*img.src = url;*/

    /*img.onload = () => {*/
      /*const canvas = document.createElement('canvas');*/
      /*canvas.width = canvasWidth;*/
      /*canvas.height = canvasHeight;*/

      /*const ctx = canvas.getContext('2d');*/
      /*if (!ctx) {*/
        /*console.error('Canvas no soportado');*/
        /*return;*/
      /*}*/

      /*// Fondo blanco*/
      /*ctx.fillStyle = '#ffffff';*/
      /*ctx.fillRect(0, 0, canvasWidth, canvasHeight);*/

      /*// 🔍 Escalar el código para que use todo el ancho*/
      /*const scale = canvasWidth / img.width;*/
      /*const drawWidth = img.width * scale;*/
      /*const drawHeight = img.height * scale;*/
      /*const offsetX = 0;*/
      /*const offsetY = (canvasHeight - drawHeight) / 2;*/

      /*ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);*/

      /*// 🔽 Descargar la imagen (puedes luego usarla en RAW BT)*/
      /*canvas.toBlob((blob) => {*/
        /*if (blob) {*/
          /*const downloadUrl = URL.createObjectURL(blob);*/
          /*const a = document.createElement('a');*/
          /*a.href = downloadUrl;*/
          /*a.download = `barcode-${code}.png`;*/
          /*a.click();*/
          /*URL.revokeObjectURL(downloadUrl);*/
        /*} else {*/
          /*console.error('No se pudo generar el PNG.');*/
        /*}*/
        /*URL.revokeObjectURL(url);*/
      /*}, 'image/png');*/
    /*};*/

    /*img.onerror = (err) => {*/
      /*console.error('Error cargando imagen del código:', code, err);*/
      /*URL.revokeObjectURL(url);*/
    /*};*/
  /*});*/
/*}*/




/*printIn50mmPortablePrinterBt(barcodes: string[]) {*/
  /*console.log('Generando PNGs para RAW BT - térmica 50mm. Códigos:', barcodes);*/

  /*// Dimensiones del rollo (en mm)*/
  /*const pageWidthMm = 50;*/
  /*const barcodeHeightMm = 10;*/
  /*const marginMm = 4;*/

  /*// Resolución adecuada (~200dpi)*/
  /*const pxPerMm = 8;*/
  /*const canvasWidth = (pageWidthMm - marginMm * 2) * pxPerMm;*/
  /*const canvasHeight = barcodeHeightMm * pxPerMm;*/

  /*barcodes.forEach((code) => {*/
    /*const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');*/
    /*JsBarcode(svg, code, {*/
      /*format: 'CODE128',*/
      /*displayValue: true,*/
      /*margin: 0,*/
    /*});*/

    /*const svgData = new XMLSerializer().serializeToString(svg);*/
    /*const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });*/
    /*const url = URL.createObjectURL(svgBlob);*/
    /*const img = new Image();*/
    /*img.src = url;*/

    /*img.onload = () => {*/
      /*const canvas = document.createElement('canvas');*/
      /*canvas.width = canvasWidth;*/
      /*canvas.height = canvasHeight;*/

      /*const ctx = canvas.getContext('2d');*/
      /*if (!ctx) {*/
        /*console.error('Canvas no soportado');*/
        /*return;*/
      /*}*/

      /*// Fondo blanco*/
      /*ctx.fillStyle = '#ffffff';*/
      /*ctx.fillRect(0, 0, canvasWidth, canvasHeight);*/

      /*// Escala y centrado*/
      /*const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);*/
      /*const drawWidth = img.width * scale;*/
      /*const drawHeight = img.height * scale;*/
      /*const offsetX = (canvasWidth - drawWidth) / 2;*/
      /*const offsetY = (canvasHeight - drawHeight) / 2;*/

      /*ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);*/

      /*// Convertir a Blob PNG*/
      /*canvas.toBlob((blob) => {*/
        /*if (blob) {*/
          /*// 👉 Descargar imagen como archivo PNG (para enviar manualmente desde RAW BT)*/
          /*const downloadUrl = URL.createObjectURL(blob);*/
          /*const a = document.createElement('a');*/
          /*a.href = downloadUrl;*/
          /*a.download = `barcode-${code}.png`;*/
          /*a.click();*/
          /*URL.revokeObjectURL(downloadUrl);*/
        /*} else {*/
          /*console.error('No se pudo generar el blob PNG');*/
        /*}*/
        /*URL.revokeObjectURL(url);*/
      /*}, 'image/png');*/
    /*};*/

    /*img.onerror = (err) => {*/
      /*console.error('Error cargando imagen del barcode:', code, err);*/
      /*URL.revokeObjectURL(url);*/
    /*};*/
  /*});*/
/*}*/




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

          // 4. Si no cabe en la página actual, creamos una nueva
          if (currentY + barcodeHeight + margin > pageHeight) {
            doc.addPage([pageWidth, pageHeight]);
            currentY = margin;
          }

          // 5. Metemos el código en el PDF
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

        // 🔹 OPCIÓN 1: Guardar el PDF (para probar tamaño en pantalla)
        doc.save('barcodes-50mm.pdf');

        // 🔹 OPCIÓN 2 (real): Obtener el blob/base64 y mandarlo a tu plugin BT
        // const pdfBlob = doc.output('blob');
        // const pdfArrayBuffer = doc.output('arraybuffer');
        // aquí llamas a tu servicio de impresión Bluetooth con ese buffer
        // this.miServicioBluetooth.printPdf(pdfArrayBuffer);
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




