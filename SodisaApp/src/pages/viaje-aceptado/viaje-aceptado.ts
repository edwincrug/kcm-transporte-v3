import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { Geolocation } from 'ionic-native';

import { ModalPage } from '../modal/modal';
import { ModalAccidentePage } from '../modal-accidente/modal-accidente';
import { ViajeAsignadoPage } from '../viaje-asignado/viaje-asignado';
import { HomePage } from '../home/home';
import { ViajeTerminadoPage } from '../viaje-terminado/viaje-terminado';
import { SincronizacionPage } from '../sincronizacion/sincronizacion';
import { ModalParadasPage } from '../modal-paradas/modal-paradas';
import { ModalIncidentePage } from '../modal-incidente/modal-incidente';

/*
  Generated class for the ViajeAceptado page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-viaje-aceptado',
  templateUrl: 'viaje-aceptado.html'
})
export class ViajeAceptadoPage {
  slots: boolean = true;
  map: any;
  terminado: boolean = false;
  remolque: string = "remolque1";

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, private loadingCtrl: LoadingController,
    public alertCtrl: AlertController) {
    this.loadMap();
    this.map = { lat: 0, lng: 0, zoom: 15 };
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViajeAceptadoPage');
  }

  openModal(characterNum) {
    let modal = this.modalCtrl.create(ModalPage, characterNum);
    modal.present();
  }

  openModalAccidente(characterNum) {
    let modal = this.modalCtrl.create(ModalAccidentePage, characterNum);
    modal.present();
  }

  viajesAsignados() {
    this.navCtrl.setRoot(ViajeAsignadoPage);
  }

  terminaViaje() {
    this.navCtrl.setRoot(ViajeTerminadoPage);
  }

  terminarViaje() {
    let loading = this.loadingCtrl.create({
      content: '¡ Trabajo terminado !',
      duration: 2000
    });

    loading.present();

    this.navCtrl.setRoot(HomePage);
  }

  redirectSync() {
    this.navCtrl.setRoot(SincronizacionPage);;
  }

  openParadas() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Paradas en ruta');

    alert.addInput({
      type: 'radio',
      label: 'Carga de combustible',
      value: '1',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Manifestación',
      value: '2',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Mal clima',
      value: '3',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Comida',
      value: '4',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Descanso',
      value: '5',
      checked: false
    });

    alert.addButton('Cerrar');
    alert.addButton({
      text: 'Aceptar',
      handler: data => {

        let modal = this.modalCtrl.create(ModalParadasPage);
        modal.present();

      }
    });

    alert.present();
  }

  openIncidentes() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Incidentes');

    alert.addInput({
      type: 'radio',
      label: 'Bloqueo de tarjeta Iave',
      value: '6',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Desvió de ruta',
      value: '7',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Falla mecánica',
      value: '8',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Intento de robo',
      value: '9',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Siniestro unidad',
      value: '10',
      checked: false
    });

    alert.addButton('Cerrar');
    alert.addButton({
      text: 'Aceptar',
      handler: data => {

        let modal = this.modalCtrl.create(ModalIncidentePage);
        modal.present();

      }
    });

    alert.present();
  }

}
