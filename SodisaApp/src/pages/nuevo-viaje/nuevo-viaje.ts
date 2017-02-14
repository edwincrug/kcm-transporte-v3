import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Device, Geolocation } from 'ionic-native';

import { ViajeAceptadoPage } from '../viaje-aceptado/viaje-aceptado';
import { HomePage } from '../home/home';
import { ViajeAsignadoPage } from '../viaje-asignado/viaje-asignado';
import { SincronizacionPage } from '../sincronizacion/sincronizacion';
import { ModalPage } from '../modal/modal';
import { LoginPage } from '../login/login';

import { WebApiProvider } from '../../providers/web-api-provider';
import { LocalDataProvider } from '../../providers/local-data-provider';
import { NetworkProvider } from '../../providers/network-provider';

/*
  Generated class for the NuevoViaje page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-nuevo-viaje',
  templateUrl: 'nuevo-viaje.html'
})
export class NuevoViajePage {
  map: any;
  username: string;
  nombre: string;
  remolque: string;
  viaje: any;
  origen: any;
  concentrado: any;
  origenNombre: any;
  destino: any;
  idRechazoSelected;
  subTitulo: string;
  idEstatusActualizar: number;
  listaViajeManiobraLocales: any[] = [];
  mensaje: string;
  economico: string;
  lat: any;
  lng: any;
  idTipoViaje: any;
  pintaMapa: number;

  constructor(public navCtrl: NavController, public params: NavParams, public modalCtrl: ModalController,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController, public dataServices: LocalDataProvider,
    public networkService: NetworkProvider, public sodisaService: WebApiProvider, public toastCtrl: ToastController) {

    this.username = params.get('usuario');
    this.nombre = params.get('nombre');
    this.economico = params.get('eco');
    this.viaje = params.get('idViaje');
    this.origen = params.get('idOrigen');
    this.concentrado = params.get('idConcentrado');
    this.origenNombre = params.get('origenNombre');
    this.destino = params.get('destino');
    this.idTipoViaje = params.get('tipoViaje');
    this.remolque = params.get('noRemolque');

    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    this.loadMap();
    this.map = { lat: 0, lng: 0, zoom: 15 };
  }

  openModal() {
    let profileModal = this.modalCtrl.create(ModalPage);
    profileModal.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NuevoViajePage');
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
    /*Geolocation.getCurrentPosition().then((position) => {
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
    });*/
  }

  MuestraMotivos(idViaje, idOrigen, idConcentrado, idTipoViaje) {
    let alert = this.alertCtrl.create();
    alert.setTitle('Motivos de rechazo');

    alert.addInput({
      type: 'radio',
      label: 'Salud del operador',
      value: '1',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Día de descanso',
      value: '2',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Negativa del operador',
      value: '3',
      checked: false
    });

    alert.addButton('Cerrar');
    alert.addButton({
      text: 'Aceptar',
      handler: data => {

        this.idRechazoSelected = data;

        if (this.idRechazoSelected != null) {
          this.RechazaViaje(this.viaje, this.origen, this.concentrado, this.idTipoViaje);
        }

      }
    });

    alert.present();

  }

  redirectViajeAceptado() {
    this.navCtrl.setRoot(ViajeAceptadoPage);
  }

  redirectSync() {
    this.navCtrl.setRoot(SincronizacionPage);;
  }

  viajesAsignados() {
    this.navCtrl.setRoot(ViajeAsignadoPage);
  }

  AceptaViajeManiobra() {
    if (this.idTipoViaje == 1) {
      this.subTitulo = 'Viaje Aceptado';
      this.idEstatusActualizar = 3;
    }
    else {
      this.subTitulo = 'Maniobra Aceptada';
      this.idEstatusActualizar = 9;
    }

    let loading = this.loadingCtrl.create({
      content: 'Espere por favor ...'
    });

    if (this.networkService.noConnection()) {
      loading.present();
      this.dataServices.insertaAceptaRechazaViajeSync(this.viaje, this.origen, this.concentrado, this.username, 0, this.idEstatusActualizar, Device.uuid).then(() => {
        loading.dismiss();
        this.dataServices.actualizaViajeLocal(this.idEstatusActualizar, 0, this.viaje, 0, this.remolque).then(response => {
          let alert = this.alertCtrl.create({
            subTitle: this.subTitulo,
            buttons: ['OK']
          });
          alert.present();

          this.RedirectViajesAsignados();
        });
      }).catch(error => {
        loading.dismiss();
      });
    }
    else {
      this.sodisaService.aceptaRechazaViaje(this.origen, this.concentrado, this.username, 0, this.idEstatusActualizar, Device.uuid).subscribe(data => {
        loading.dismiss();
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.actualizaViajeLocal(this.idEstatusActualizar, 0, this.viaje, 0, this.remolque).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: this.subTitulo,
                buttons: ['OK']
              });
              alert.present();

              this.RedirectViajesAsignados();
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (data.pResponseCode == -8) {
            this.EliminaViajeDesasociado(this.viaje, 0);
          }

          this.RedirectViajesAsignados();
        }
      });
    }
  }

  RechazaViaje(idViaje, idOrigen, idConcentrado, idTipoViaje) {
    if (idTipoViaje == 1) {
      this.subTitulo = 'Viaje rechazado';
      this.idEstatusActualizar = 4;
    }
    else {
      this.subTitulo = 'Maniobra rechazada';
      this.idEstatusActualizar = 10;
    }

    let loading = this.loadingCtrl.create({
      content: 'Espere por favor ...'
    });

    loading.present();

    if (this.networkService.noConnection()) {
      this.dataServices.insertaAceptaRechazaViajeSync(idViaje, idOrigen, idConcentrado, this.username, this.idRechazoSelected, this.idEstatusActualizar, Device.uuid).then(() => {
        loading.dismiss();
        this.dataServices.actualizaViajeLocal(this.idEstatusActualizar, this.idRechazoSelected, idViaje, 0, '').then(response => {
          let alert = this.alertCtrl.create({
            subTitle: this.subTitulo,
            buttons: ['OK']
          });
          alert.present();

          this.RedirectViajesAsignados();
        });
      });
    }
    else {
      this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.username, this.idRechazoSelected, this.idEstatusActualizar, Device.uuid).subscribe(data => {
        loading.dismiss();
        // this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, 'C55163', this.idRechazoSelected, 4, 'aa1add0d87db4099').subscribe(data => {
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.eliminaViajeLocal(idViaje).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: this.subTitulo,
                buttons: ['OK']
              });
              alert.present();

              this.RedirectViajesAsignados();
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (data.pResponseCode == -8) {
            this.EliminaViajeDesasociado(idViaje, 0);
          }
          this.RedirectViajesAsignados();
        }

      });
    }
  }

  ObtieneViajeManiobraInternos() {
    this.dataServices.openDatabase()
      .then(() => this.dataServices.ViajeManiobraAsignados().then(response => {
        if (response.length > 0) {
          this.listaViajeManiobraLocales = response;
        }
        else {
          this.listaViajeManiobraLocales = [];
        }
      }));
  }

  EliminaViajeDesasociado(idViaje, idViajeSync) {
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
      this.RedirectHome();
    }
    else if (codigoRespuesta.pResponseCode == -5) {
      this.navCtrl.setRoot(LoginPage);
    }
  }

  RedirectHome() {
    this.navCtrl.setRoot(HomePage, {
      usuario: this.username,
      nombre: this.nombre,
      eco: this.economico
    });
  }
  RedirectViajesAsignados() {
    this.navCtrl.setRoot(ViajeAsignadoPage, {
      usuario: this.username,
      nombre: this.nombre,
      eco: this.economico
    });
  }

}