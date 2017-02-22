import { Injectable, NgZone } from '@angular/core';
import { Http } from '@angular/http';
import { Geolocation, Geoposition, BackgroundGeolocation } from 'ionic-native';

import 'rxjs/add/operator/map';

/*
  Generated class for the ComunProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ComunProvider {
  public lat: number = 0;
  public lng: number = 0;
  public coordenadas: string;
  public watch: any;

  constructor(public http: Http, public zone: NgZone) {
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

  obtieneCoordenadas(descripcion) {
    let options = {
      enableHighAccuracy: true
    };

    this.watch = Geolocation.watchPosition(options).subscribe((position: Geoposition) => {
      //console.log(position);

      this.zone.run(() => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;

        if (this.lat == null || this.lng == null) {
          if (descripcion == 1) {
            this.coordenadas = 'Sin Cobertura';
          }
          else {
            this.coordenadas = null;
          }
        }
        else {
          this.coordenadas = this.lat.toString() + ', ' + this.lng.toString();
        }

      });

    });    

    return this.coordenadas;
  }

}
