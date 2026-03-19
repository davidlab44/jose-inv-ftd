import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'datelatam' })
export class DatelatamPipe implements PipeTransform {

  transform(fecha: string | null): string {
    if (!fecha) return '';

    const d = new Date(fecha);

    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();

    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  }
}
