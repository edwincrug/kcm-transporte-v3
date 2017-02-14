import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Geolocation, Device } from 'ionic-native';

import { LoginPage } from '../login/login';
import { HomePage } from '../home/home';

import { NetworkProvider } from '../../providers/network-provider';
import { LocalDataProvider } from '../../providers/local-data-provider';
import { WebApiProvider } from '../../providers/web-api-provider';

/*
  Generated class for the ViajeTerminado page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-viaje-terminado',
  templateUrl: 'viaje-terminado.html'
})
export class ViajeTerminadoPage {
  map: any;
  lat: any;
  lng: any;
  username: string;
  nombre: string;
  noTracto: string;
  mensaje: string;
  odometro: number;
  remolque: string;
  viaje: any;
  origen: any;
  concentrado: any;
  pintaMapa: number;

  constructor(public navCtrl: NavController, public params: NavParams, public alertCtrl: AlertController,
    private loadingCtrl: LoadingController, public networkService: NetworkProvider, public dataServices: LocalDataProvider,
    public sodisaService: WebApiProvider, public toastCtrl: ToastController) {

    this.username = params.get('usuario');
    this.nombre = params.get('nombre');
    this.noTracto = params.get('noTracto');
    this.odometro = params.get('odometroFinal');
    this.remolque = params.get('noRemolque');
    this.viaje = params.get('idViaje');
    this.origen = params.get('idOrigen');
    this.concentrado = params.get('idConcentrado');

    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    this.loadMap();
    this.map = { lat: 0, lng: 0, zoom: 15 };
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViajeTerminadoPage');
  }

  loadMap() {
    if (this.networkService.noConnection()) {
      this.pintaMapa = 0;
    }
    else {
      this.pintaMapa = 1;

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
  }

  TerminarViaje() {
    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    let fecha = new Date();
    let fechaEnviada = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes();
    let coordenadas = this.lat + ',' + this.lng;

    if (this.lat == null || this.lng == null) { coordenadas = 'Sin cobertura'; }

    if (this.networkService.noConnection()) {
      this.dataServices.insertaIniciaTerminaViajeSync(this.viaje, this.origen, this.concentrado, this.username, 0, 7, Device.uuid, coordenadas, fechaEnviada, this.odometro, this.remolque, '').then(() => {
        this.dataServices.actualizaViajeLocal(7, 0, this.viaje, this.odometro, this.remolque).then(response => {
          let alert = this.alertCtrl.create({
            subTitle: 'Viaje terminado',
            buttons: ['OK']
          });
          alert.present();

          this.navCtrl.setRoot(HomePage, {
            usuario: this.username,
            nombre: this.nombre,
            eco: this.noTracto
          });
        });
      });
    }
    else {
      this.sodisaService.actualizaViaje(this.origen, this.concentrado, this.username, 0, 7, Device.uuid, fechaEnviada, coordenadas, this.odometro, this.remolque, null).subscribe(data => {
        // this.sodisaService.actualizaViaje(idOrigen, idConcentrado, 'C55163', 0, 7, 'aa1add0d87db4099', fechaEnviada, coordenadas).subscribe(data => {
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.eliminaViajeLocal(this.viaje).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: 'Viaje terminado',
                buttons: ['OK']
              });
              alert.present();

              this.navCtrl.setRoot(HomePage, {
                usuario: this.username,
                nombre: this.nombre,
                eco: this.noTracto
              });

            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (data.pResponseCode == -8) {
            this.EliminaViajeDesasociado(this.viaje, 0);
          }

          this.navCtrl.setRoot(HomePage, {
            usuario: this.username,
            nombre: this.nombre,
            eco: this.noTracto
          });
        }
      });
    }
  }

  RedirectManiobra() {
    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    let fecha = new Date();
    let fechaEnviada = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes();
    let coordenadas = this.lat + ',' + this.lng;

    if (this.lat == null || this.lng == null) { coordenadas = 'Sin Cobertura'; }

    if (this.networkService.noConnection()) {
      //alert('Acepta Maniobra: ' + this.viaje);
      this.dataServices.openDatabase()
        .then(() => {
          this.dataServices.insertaIniciaTerminaViajeSync(this.viaje, this.origen, this.concentrado, this.username, 0, 9, Device.uuid, coordenadas, fechaEnviada, 0, '', '').then(resp => {            
            console.log('Inserta Maniobra Aceptada: ' + resp);
            this.dataServices.actualizaViajeLocal(9, 0, this.viaje, 0, '').then(response => {
              console.log('Update Correcto: ' + response);
              let alert = this.alertCtrl.create({
                subTitle: 'Maniobra aceptada',
                buttons: ['OK']
              });
              alert.present();

              this.navCtrl.setRoot(HomePage, {
                usuario: this.username,
                nombre: this.nombre,
                eco: this.noTracto
              });
            }).catch(error => {
              console.log('No actualiza Maniobra Aceptada: ' + error);
            });
          }).catch(error => {
            console.log('Maniobra Aceptada Sync Error: ' + error);
          });
        });

    }
    else {
      this.sodisaService.actualizaViaje(this.origen, this.concentrado, this.username, 0, 9, Device.uuid, fechaEnviada, coordenadas, 0, '', null).subscribe(data => {
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.actualizaViajeLocal(9, 0, this.viaje, this.odometro, this.remolque).then(response => {
              console.log('Actualiza estatus 9: ' + response);
              let alert = this.alertCtrl.create({
                subTitle: 'Maniobra aceptada',
                buttons: ['OK']
              });
              alert.present();

              this.navCtrl.setRoot(HomePage, {
                usuario: this.username,
                nombre: this.nombre,
                eco: this.noTracto
              });

            }).catch(error => {
              console.log('Error al actualizar estatus 9: ' + error);
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (data.pResponseCode == -8) {
            this.EliminaViajeDesasociado(this.viaje, 0);
          }

          this.navCtrl.setRoot(HomePage, {
            usuario: this.username,
            nombre: this.nombre,
            eco: this.noTracto
          });
        }
      });
    }
  }

  interpretaRespuesta(codigoRespuesta) {
    switch (codigoRespuesta.pResponseCode) {
      case -1:
        this.mensaje = "Usuario no registrado";
        break;
      case -2:
        this.mensaje = "Más de un dispositivo asignado";
        break;
      case -3:
        this.mensaje = "Credenciales incorrectas";
        break;
      case -4:
        this.mensaje = "Dispositivo no asignado";
        break;
      case -5:
        this.mensaje = "La sesión expiro";
        break;
      case -8:
        this.mensaje = "Este viaje fue desasignado";
        break;
    }

    let toast = this.toastCtrl.create({
      message: this.mensaje,
      duration: 2000,
      position: 'middle'
    });
    toast.present();

    if (codigoRespuesta.pResponseCode == 1) {
      this.navCtrl.push(HomePage, {
        usuario: this.username,
        nombre: this.nombre,
        eco: this.noTracto
      });
    }
    else if (codigoRespuesta.pResponseCode == -5) {
      this.navCtrl.setRoot(LoginPage);
    }
  }

  EliminaViajeDesasociado(idViaje, idViajeSync) {
    this.dataServices.openDatabase()
      .then(() => {

        this.dataServices.eliminaViajeLocal(idViaje).then(() => {
          // alert('Eliminado Local');
        });

        this.dataServices.eliminaViajeSync(idViajeSync).then(() => {
          //alert('Eliminado sync');
        });
      });
  }

}
