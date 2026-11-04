import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RgxService {

  constructor() { }

  isInteger(value: any): boolean {
    return /^-?\d+$/.test(String(value).trim());
  }

}
