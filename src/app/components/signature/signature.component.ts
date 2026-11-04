import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.css'],
})
export class SignatureComponent implements AfterViewInit {
  @ViewChild('canvas') canvasEl!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;
  
  ngAfterViewInit() {
    setTimeout(() => {
      const canvas = this.canvasEl.nativeElement;

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d')!.scale(ratio, ratio);

      this.signaturePad = new SignaturePad(canvas, {
        backgroundColor: '#ffffff',
        penColor: 'black',
      });
    });
  }

/*  ngAfterViewInit() {*/
    /*const canvas = this.canvasEl.nativeElement;*/

    /*// Ajuste automático al tamaño del contenedor*/
    /*canvas.width = canvas.offsetWidth;*/
    /*canvas.height = canvas.offsetHeight;*/

    /*this.signaturePad = new SignaturePad(canvas, {*/
      /*backgroundColor: '#ffffff',*/
      /*penColor: 'black',*/
      /*throttle: 0,*/
    /*});*/
  /*}*/

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

