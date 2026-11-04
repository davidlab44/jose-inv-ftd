import { Injectable } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(public toastCtrl: ToastController,) { }

  extractNumber(dbFieldName: string): number {
    try { // 1️⃣ Primer intento: usando substring (formato fijo "i###")
      let extractedNumber = Number(dbFieldName.substring(1));
      if (isNaN(extractedNumber)) {// 2️⃣ Validación: si el resultado no es un número válido, probamos la segunda opción
        extractedNumber = parseInt(dbFieldName.replace(/\D+/g, ""), 10);
      }
      if (isNaN(extractedNumber)) { // 3️⃣ Si sigue siendo NaN, retornamos 0
        return 0;
      }
      return extractedNumber;
    } catch (error) {
      console.error("Error extrayendo número:", error);
      return 0; // Valor por defecto si algo falla
    }
  }

  async presentToast(msg:string,color:string='primary',duration=3000) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: duration, // Duración en milisegundos
      position: 'bottom', // Posición del toast
      color: color// Puedes cambiar el color (primary, secondary, danger, etc.)
    });
    await toast.present();
  }


  private loading: HTMLIonLoadingElement | null = null;
  async presentLoading(loadingController:LoadingController, msg: string) {
    this.loading = await loadingController.create({
      spinner: 'crescent',
      message: msg
    });
    await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  //   //reviews
  // async openModal(modalController:ModalController,reviews:Revision[]) {
  //   const modal = await modalController.create({
  //     component: CommentsListModalComponent,
  //     componentProps: { //items: ['Item 1', 'Item 2', 'Item 3', 'Item 4'] 
  //       items:reviews
  //     }
  //   });
  //   return await modal.present();
  // }

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
      window.location.reload(); 
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





