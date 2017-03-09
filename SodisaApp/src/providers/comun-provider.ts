import { Injectable, NgZone } from '@angular/core';
import { Http } from '@angular/http';
import { Geolocation, Geoposition } from 'ionic-native';
import { Push, PushToken } from '@ionic/cloud-angular';

import 'rxjs/add/operator/map';

import { LocalDataProvider } from '../providers/local-data-provider';

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

  constructor(public http: Http, public zone: NgZone, public push: Push,
    public dataServices: LocalDataProvider) {
      
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

  generaTokenPushNotificacion() {
    return this.push.register().then((t: PushToken) => {
      return this.push.saveToken(t);
    }).then((t: PushToken) => {
      console.log('Token saved:', t.token);
      return t.token;
    }).catch(error => {
      console.log('Error al generar Token: ' + error);
    });

  }

  eliminaViajeDesasociado(idViaje, idViajeSync) {
    this.dataServices.openDatabase()
      .then(() => {

        this.dataServices.eliminaViajeLocal(idViaje).then(() => {
          // alert('Eliminado local');
        });

        this.dataServices.eliminaViajeSync(idViajeSync).then(() => {
          //alert('Eliminado sync');
        });
      });
  }

}
