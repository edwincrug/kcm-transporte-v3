import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Network } from 'ionic-native';
import { Platform } from 'ionic-angular';

import 'rxjs/add/operator/map';

declare var Connection;

@Injectable()
export class NetworkProvider {
onDevice: boolean;

  constructor(public http: Http, public platform: Platform) {
    this.onDevice = this.platform.is('cordova');
  }

  isOnline(): boolean {
    if(this.onDevice && Network.connection){
      return Network.connection !== Connection.NONE;
    } else {
      return navigator.onLine; 
    }
  }
 
  noConnection(): boolean {
    if(this.onDevice && Network.connection){
      return Network.connection === Connection.NONE;
    } else {
      return !navigator.onLine;   
    }
  }

  // noConnection() {
  //   return (Network.connection === 'none');
  // }


  // noConnection() {
  //   alert('Entra api network: ');
  //   return Network.onDisconnect().subscribe(() => {
  //     return true;
  //   }, error => {
  //     alert('Error api network: ' + error);
  //   });
  // }

}
