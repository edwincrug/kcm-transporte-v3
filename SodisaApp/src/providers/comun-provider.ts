import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the ComunProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ComunProvider {

  constructor(public http: Http) {
    console.log('Hello ComunProvider Provider');
  }

  fechaActual() {
    let fecha = new Date();
    let mesFinal: string;
    let diaFinal: string;
    let horaFinal: string;
    let minutoFinal: string;

    let mesOriginal = fecha.getMonth() + 1;
    if (mesOriginal.toString().length == 1) {
      mesFinal = '0' + mesOriginal.toString();
    }
    else {
      mesFinal = mesOriginal.toString();
    }

    let diaOriginal = fecha.getDate();
    if (diaOriginal.toString().length == 1) {
      diaFinal = '0' + diaOriginal.toString();
    }
    else {
      diaFinal = diaOriginal.toString();
    }

    let horaOriginal = fecha.getHours();
    if (horaOriginal.toString().length == 1) {
      horaFinal = '0' + horaOriginal.toString();
    }
    else {
      horaFinal = horaOriginal.toString();
    }

    let minutoOriginal = fecha.getMinutes();
    if (minutoOriginal.toString().length == 1) {
      minutoFinal = '0' + minutoOriginal.toString();
    }
    else {
      minutoFinal = minutoOriginal.toString();
    }

    let fechaEnviada = diaFinal + '-' + mesFinal + '-' + fecha.getFullYear() + ' ' + horaFinal + ':' + minutoFinal;

    return fechaEnviada;
  }

}
