import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

 
  constructor() { }

  //DATE
  public formatFechaEsCo(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  public getYesterdayDate(): Date {
    const today = new Date();
    today.setDate(today.getDate() -1);
    return today;
  }

  public parseStoredDate(fechaGuardada: string): Date {    // Reemplaza espacio por 'T' si viene con hora, para que Date lo entienda mejor en formato ISO
    const fechaISO = fechaGuardada.replace(' ', 'T');
    return new Date(fechaISO);
  }

  getTodayDate(): string { // sistema de calificacion
    const date = new Date(); // Obtener el día, mes y año
    const day = String(date.getDate()).padStart(2, '0'); // Día
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes (los meses comienzan desde 0)
    const year = date.getFullYear(); // Año  // Formatear como YYYY-MM-DD
    return `${year}${month}${day}`;
  }

  getStoredDate(): number{
    const storedDate=localStorage.getItem('storedDate');
    if(Number(storedDate)){
      return Number(storedDate)
    }else{ return 0 }
  }

  formatRemainingHoursOfDay(): string[] {
    const now = new Date();
    const hoursList: string[] = [];
    for (let i = 1; i <= 15; i++) { // Solo las próximas 15 horas
      const hour = new Date(now);
      hour.setHours(now.getHours() + i);
      hour.setMinutes(0, 0, 0);
      hoursList.push(this.formatHour(hour));
    }
    return hoursList;
  }

  formatHour(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (/chrome|crios|crmo/i.test(userAgent) && !/edge|edgios|opr/i.test(userAgent)) {
      return 'Chrome';
    }
    if (/safari/i.test(userAgent) && !/chrome|crios|crmo/i.test(userAgent)) {
      return 'Safari';
    }
    if (/firefox|fxios/i.test(userAgent)) {
      return 'Firefox';
    }
    if (/edg/i.test(userAgent)) {
      return 'Edge';
    }
    if (/opr\//i.test(userAgent)) {
      return 'Opera';
    }
    return 'este navegador';
  }

  reloadPage(router) {
    router.navigate(['/']).then(() => {
      window.location.reload(); // fuerza recarga de toda la app
    });
  }

  //uso
  //fakeScore:any=this.generarNumeroAleatorio(4.0, 4.6);
  generarNumeroAleatorio(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(1));
  }

  convertToArray(selectedMediosTexto: string): number[] {   // Convertir el string separado por comas en un array de números
    if(selectedMediosTexto){
      let selectedMedios = selectedMediosTexto.split(',').map(num => parseInt(num, 10));
      return selectedMedios;
    }
  }

  

  resetApp(router){
    router.navigate(['/']).then(() => {
      window.location.reload(); // fuerza recarga de toda la app
    });
  }




}
