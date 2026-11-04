import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LstService {

  constructor() { }

  sortByName(list: any[]): any[] {
    return [...list].sort((a, b) =>
      (a.data?.name ?? '').localeCompare(
        b.data?.name ?? '',
        'es',
        { sensitivity: 'base' }
      )
    );
  }



}
