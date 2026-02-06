import { Injectable } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';



@Injectable({
  providedIn: 'root'
})
export class GuiService {

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





}
