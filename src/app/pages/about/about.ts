import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
  styleUrls: ['./about.scss'],
})
export class AboutPage implements AfterViewInit {
  @ViewChild('canvas') canvasEl!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;

  ngAfterViewInit() {
    const canvas = this.canvasEl.nativeElement;

    // Ajuste automático al tamaño del contenedor
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: '#ffffff',
      penColor: 'black',
      throttle: 0,
    });
  }

  clear() {
    this.signaturePad.clear();
  }

  undo() {
    const data = this.signaturePad.toData();
    if (data.length) {
      data.pop();
      this.signaturePad.fromData(data);
    }
  }

  save(): string | null {
    if (this.signaturePad.isEmpty()) {
      return null;
    }

    return this.signaturePad.toDataURL('image/png');
  }
}

