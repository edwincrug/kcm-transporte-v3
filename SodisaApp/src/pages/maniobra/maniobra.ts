import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Geolocation } from 'ionic-native';

import { EvidenciaPage } from '../evidencia/evidencia';
import { DocumentacionPage } from '../documentacion/documentacion';
import { SincronizacionPage } from '../sincronizacion/sincronizacion';
import { ViajeAsignadoPage } from '../viaje-asignado/viaje-asignado';

/*
  Generated class for the Maniobra page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-maniobra',
  templateUrl: 'maniobra.html'
})
export class ManiobraPage {
  map: any;
  remolque: string = "remolque1";

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
    private loadingCtrl: LoadingController) {
    this.loadMap();
    this.map = { lat: 0, lng: 0, zoom: 15 };
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ManiobraPage');
  }

  loadMap() {
    Geolocation.getCurrentPosition().then((position) => {
      this.map =
        {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: 15
        };
    }).catch((error) => {
      this.map =
        {
          lat: 19.438029,
          lng: -99.2118746,
          zoom: 15
        };
      });
  }

  redirectSync() {
    this.navCtrl.setRoot(SincronizacionPage);;
  }

  viajesAsignados() {
    this.navCtrl.setRoot(ViajeAsignadoPage);
  }

  startManionbra() {
    let loading = this.loadingCtrl.create({
      content: 'Maniobra iniciada ...',
      duration: 2000
    });

    loading.present();
  }

  finishManiobra() {
    let confirm = this.alertCtrl.create({
      subTitle: '¿Se realiza entrega de mercancía?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            this.navCtrl.setRoot(EvidenciaPage);
          }
        },
        {
          text: 'Si',
          handler: () => {
            this.navCtrl.setRoot(DocumentacionPage);
          }
        }
      ]
    });
    confirm.present();
  }
}
