import { Component, ElementRef, ViewChild } from '@angular/core';
import JsBarcode from 'jsbarcode';
import jsPDF from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';



@Component({
  selector: 'app-barcode-generator',
  templateUrl: './barcode-generator.component.html',
 // styleUrls: ['./barcode-generator.component.scss']
})
export class BarcodeGeneratorComponent {
  @ViewChild('barcode', { static: false }) barcode!: ElementRef<SVGSVGElement>;
  value: string = '';

  // Generar un código de barra en el SVG
  generateBarcode() {
    JsBarcode(this.barcode.nativeElement, this.value || '123456789', {
      format: 'CODE128',
      displayValue: true
    });
  }



downloadPDF(barcodes: string[]) {
  const doc = new jsPDF();

  barcodes.forEach((code, index) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, code, { format: 'CODE128', displayValue: true });

    // Convertir SVG a PNG usando canvas
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.src = url;

    img.onload = () => {
      const x = 10;
      const y = 10 + index * 40;
      doc.addImage(img, 'PNG', x, y, 80, 30); // ancho y alto en mm aprox
      if (index === barcodes.length - 1) {
        doc.save('barcodes.pdf');
      }
    };
  });
}






}

