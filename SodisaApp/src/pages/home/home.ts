import { Component } from '@angular/core';
import { Geolocation, Device } from 'ionic-native';
import { NavController, Platform, NavParams, ModalController, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { ViajeAsignadoPage } from '../viaje-asignado/viaje-asignado';
import { ModalPage } from '../modal/modal';
import { SincronizacionPage } from '../sincronizacion/sincronizacion';
import { ModalParadasPage } from '../modal-paradas/modal-paradas';
import { ModalIncidentePage } from '../modal-incidente/modal-incidente';
import { ViajeTerminadoPage } from '../viaje-terminado/viaje-terminado';
import { EvidenciaPage } from '../evidencia/evidencia';
import { DocumentacionPage } from '../documentacion/documentacion';
import { LoginPage } from '../login/login';
import { ConfiguracionPage } from '../configuracion/configuracion';

import { LocalDataProvider } from '../../providers/local-data-provider';
import { NetworkProvider } from '../../providers/network-provider';
import { WebApiProvider } from '../../providers/web-api-provider';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  map: any;
  aceptado: any;
  slots: boolean = true;
  remolque: string = "remolque1";
  listaViajesLocales: any[] = [];
  imei: string;
  username: string;
  mensaje: string;
  nombre: string;
  noTracto: string;
  idRechazoSelected;
  idParadaSelected;
  lat: any;
  lng: any;
  idIncidenteSelected;
  pintaMapa: number;


  constructor(public navCtrl: NavController, private platform: Platform, public params: NavParams,
    public modalCtrl: ModalController, private loadingCtrl: LoadingController, public alertCtrl: AlertController,
    public dataServices: LocalDataProvider, public networkService: NetworkProvider, public sodisaService: WebApiProvider,
    public toastCtrl: ToastController) {

    this.username = params.get('usuario');
    this.nombre = params.get('nombre');
    this.noTracto = params.get('eco');

    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    this.loadMap();
    this.map = { lat: 0, lng: 0, zoom: 15 };

    if (params.get('aceptado') != null) {
      this.aceptado = params.get('aceptado');
    }

    console.log('Valor aceptad: ' + this.aceptado);
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create({
      content: 'Obteniendo información...'
    });

    loading.present();

    setTimeout(() => {
      this.obtieneViajesInternos();
      loading.dismiss();
    }, 2000);
  }

  obtieneViajesInternos() {
    this.dataServices.openDatabase()
      .then(() => this.dataServices.checkViajesAsignados().then(response => {
        if (response.length > 0) {
          this.listaViajesLocales = response;
        }
        else {
          this.listaViajesLocales = [];
        }
      }));
  }

  AceptaViaje(idViaje, idOrigen, idConcentrado) {
    this.imei = Device.uuid;

    // let loading = this.loadingCtrl.create({
    //   content: 'Espere por favor ...'
    // });    

    if (this.networkService.noConnection()) {
      // loading.present();
      this.dataServices.insertaAceptaRechazaViajeSync(idViaje, idOrigen, idConcentrado, this.username, 0, 3, this.imei).then(() => {
        // loading.dismiss();
        this.dataServices.actualizaViajeLocal(3, 0, idViaje, '', '').then(response => {
          let alert = this.alertCtrl.create({
            subTitle: 'Viaje aceptado',
            buttons: ['OK']
          });
          alert.present();

          this.obtieneViajesInternos();
        });
      }).catch(error => {
        // loading.dismiss();
      });
    }
    else {
      // this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, 'C55163', 0, 3, 'aa1add0d87db4099').subscribe(data => {
      this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.username, 0, 3, this.imei).subscribe(data => {
        // loading.dismiss();
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.actualizaViajeLocal(3, 0, idViaje, 0, '').then(response => {
              let alert = this.alertCtrl.create({
                subTitle: 'Viaje aceptado',
                buttons: ['OK']
              });
              alert.present();

              this.obtieneViajesInternos();
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (data.pResponseCode == -8) {
            this.EliminaViajeDesasociado(idViaje, 0);
          }

          this.obtieneViajesInternos();
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
      this.navCtrl.push(ViajeAsignadoPage);
    }
    else if (codigoRespuesta.pResponseCode == -5) {
      this.navCtrl.setRoot(LoginPage);
    }
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

  MuestraMotivos(idViaje, idOrigen, idConcentrado) {
    this.imei = Device.uuid;
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
          this.RechazaViaje(idViaje, idOrigen, idConcentrado);
        }

      }
    });

    alert.present();

  }

  RechazaViaje(idViaje, idOrigen, idConcentrado) {

    //  let loading = this.loadingCtrl.create({
    //     content: 'Espere por favor ...'
    //   });

    //   loading.present();

    if (this.networkService.noConnection()) {
      this.dataServices.insertaAceptaRechazaViajeSync(idViaje, idOrigen, idConcentrado, this.username, this.idRechazoSelected, 4, Device.uuid).then(() => {
        this.dataServices.actualizaViajeLocal(4, this.idRechazoSelected, idViaje, '', '').then(response => {
          let alert = this.alertCtrl.create({
            subTitle: 'Viaje rechazado',
            buttons: ['OK']
          });
          alert.present();

          this.obtieneViajesInternos();
        });
      });
    }
    else {
      this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.username, this.idRechazoSelected, 4, Device.uuid).subscribe(data => {
        // this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, 'C55163', this.idRechazoSelected, 4, 'aa1add0d87db4099').subscribe(data => {
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.eliminaViajeLocal(idViaje).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: 'Viaje rechazado',
                buttons: ['OK']
              });
              alert.present();

              this.obtieneViajesInternos();
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (data.pResponseCode == -8) {
            this.EliminaViajeDesasociado(idViaje, 0);
          }
          this.obtieneViajesInternos();
        }

      });
    }
  }

  IniciarViaje(idViaje, idOrigen, idConcentrado, km, noRemolque) {
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
      //alert('Inserta viaje: ' + idViaje);
      this.dataServices.insertaIniciaTerminaViajeSync(idViaje, idOrigen, idConcentrado, this.username, 0, 5, Device.uuid, coordenadas, fechaEnviada, km, noRemolque, '').then(() => {
        this.dataServices.actualizaViajeLocal(5, 0, idViaje, km, noRemolque).then(response => {
          let alert = this.alertCtrl.create({
            subTitle: 'Viaje iniciado',
            buttons: ['OK']
          });
          alert.present();

          this.obtieneViajesInternos();
        });
      });
    }
    else {
      this.sodisaService.actualizaViaje(idOrigen, idConcentrado, this.username, 0, 5, Device.uuid, fechaEnviada, coordenadas, km, noRemolque, null).subscribe(data => {
        // this.sodisaService.actualizaViaje(idOrigen, idConcentrado, 'C55163', 0, 5, 'aa1add0d87db4099', fechaEnviada, coordenadas).subscribe(data => {
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.actualizaViajeLocal(5, 0, idViaje, km, noRemolque).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: 'Viaje iniciado',
                buttons: ['OK']
              });
              alert.present();

              this.obtieneViajesInternos();
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (data.pResponseCode == -8) {
            this.EliminaViajeDesasociado(idViaje, 0);
          }

          this.obtieneViajesInternos();
        }

      });
    }
  }

  TerminarViaje(idViaje, idOrigen, idConcentrado, km, noRemolque) {
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
      //alert('Termina Viaje: ' + idViaje);
      this.dataServices.insertaIniciaTerminaViajeSync(idViaje, idOrigen, idConcentrado, this.username, 0, 6, Device.uuid, coordenadas, fechaEnviada, km, noRemolque, '').then(() => {
        this.dataServices.actualizaViajeLocal(6, 0, idViaje, km, noRemolque).then(response => {
          let alert = this.alertCtrl.create({
            subTitle: 'Llegada exitosa',
            buttons: ['OK']
          });
          alert.present();

          this.navCtrl.setRoot(ViajeTerminadoPage, {
            usuario: this.username,
            nombre: this.nombre,
            noTracto: this.noTracto,
            odometroFinal: km,
            noRemolque: noRemolque,
            idViaje: idViaje,
            idOrigen: idOrigen,
            idConcentrado: idConcentrado
          });
        });
      });
    }
    else {
      this.sodisaService.actualizaViaje(idOrigen, idConcentrado, this.username, 0, 6, Device.uuid, fechaEnviada, coordenadas, km, noRemolque, null).subscribe(data => {
        // this.sodisaService.actualizaViaje(idOrigen, idConcentrado, 'C55163', 0, 6, 'aa1add0d87db4099', fechaEnviada, coordenadas).subscribe(data => {
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.actualizaViajeLocal(6, 0, idViaje, km, noRemolque).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: 'Llegada exitosa',
                buttons: ['OK']
              });
              alert.present();

              this.navCtrl.setRoot(ViajeTerminadoPage, {
                usuario: this.username,
                nombre: this.nombre,
                noTracto: this.noTracto,
                odometroFinal: km,
                noRemolque: noRemolque,
                idViaje: idViaje,
                idOrigen: idOrigen,
                idConcentrado: idConcentrado
              });
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (data.pResponseCode == -8) {
            this.EliminaViajeDesasociado(idViaje, 0);
          }

          this.obtieneViajesInternos();
        }
      });
    }
  }

  validarDatos(km, remolque) {
    if ((km == null || km.trim() == '') && (remolque == null || remolque.trim() == '')) {
      return 'Los campos Odómetro y Remolque son obligatorios';
    }
    else if (km == null || km.trim() == '') {
      return 'El campo Odómetro es obligatorio';
    }
    else if (remolque == null || remolque.trim() == '') {
      return 'El campo Remolque es obligatorio';
    }
    else if (!/^([0-9])*$/.test(km)) {
      return 'El campo Odómetro sólo permite números';
    }
    else {
      return 'OK';
    }
  }

  OpenModal(idViaje, idOrigen, idConcentrado, economico, idTipoOdometro) {
    let modal = this.modalCtrl.create(ModalPage, {
      idTipoOdometro: idTipoOdometro,
      noRemolque: economico
    });
    modal.present();

    modal.onDidDismiss(res => {
      if (res.km != 0 && res.remolque != 0) {
        if (idTipoOdometro == 1) {
          this.IniciarViaje(idViaje, idOrigen, idConcentrado, res.km, res.remolque);
        }
        else {
          this.TerminarViaje(idViaje, idOrigen, idConcentrado, res.km, res.remolque);
        }
      }
    });
  }

  ViajesAsignados() {
    this.navCtrl.setRoot(ViajeAsignadoPage, {
      usuario: this.username,
      nombre: this.nombre,
      eco: this.noTracto
    });
  }

  MuestraParadas(idViaje, idOrigen, idConcentrado) {
    this.imei = Device.uuid;
    let alert = this.alertCtrl.create();
    alert.setTitle('Motivos parada en ruta');

    let alertAviso = this.alertCtrl.create({
      subTitle: 'Información no disponible',
      buttons: ['OK']
    });

    this.dataServices.getParadas().then(data => {
      if (data != null) {
        if (data.length > 0) {
          for (let x = 0; x < data.length; x++) {
            alert.addInput({
              type: 'radio',
              label: data[x].descripcion,
              value: data[x].idEvento,
              checked: false
            });
          }

          alert.addButton('Cerrar');
          alert.addButton({
            text: 'Aceptar',
            handler: data => {
              this.idParadaSelected = data;

              if (this.idParadaSelected != null) {
                this.OpenModalParadas(idViaje, idOrigen, idConcentrado, this.idParadaSelected);
              }

            }
          });

          alert.present();
        }
        else {
          alertAviso.present();
        }
      }
      else {
        alertAviso.present();
      }
    });

  }

  OpenModalParadas(idViaje, idOrigen, idConcentrado, idParada) {
    let modal = this.modalCtrl.create(ModalParadasPage, {
      viaje: idViaje,
      origen: idOrigen,
      concentrado: idConcentrado,
      usuario: this.username,
      parada: idParada,
      eco: this.noTracto,
      nombre: this.nombre
    });
    modal.present();
  }

  MuestraIncidentes(idViaje, idOrigen, idConcentrado) {
    let alert = this.alertCtrl.create();
    alert.setTitle('Incidentes');

    let alertAviso = this.alertCtrl.create({
      subTitle: 'Información no disponible',
      buttons: ['OK']
    });

    this.dataServices.getIncidentes().then(data => {
      if (data != null) {
        if (data.length > 0) {
          for (let x = 0; x < data.length; x++) {
            alert.addInput({
              type: 'radio',
              label: data[x].descripcion,
              value: data[x].idEvento,
              checked: false
            });
          }

          alert.addButton('Cerrar');
          alert.addButton({
            text: 'Aceptar',
            handler: data => {
              this.idIncidenteSelected = data;

              if (this.idIncidenteSelected != null) {
                this.OpenModalIncidentes(idViaje, idOrigen, idConcentrado, this.idIncidenteSelected);
              }

            }
          });

          alert.present();
        }
        else {
          alertAviso.present();
        }
      }
      else {
        alertAviso.present();
      }
    });

  }

  OpenModalIncidentes(idViaje, idOrigen, idConcentrado, idIncidente) {
    let modal = this.modalCtrl.create(ModalIncidentePage, {
      viaje: idViaje,
      origen: idOrigen,
      concentrado: idConcentrado,
      usuario: this.username,
      incidente: idIncidente
    });
    modal.present();
  }

  ManejoDeManiobra(idViaje, idOrigen, idConcentrado, idTipoViaje, idEstatus) {
    this.imei = Device.uuid;
    let subTitulo = '';

    if (idEstatus == 11) {
      subTitulo = 'Maniobra iniciada';
    }
    else if (idEstatus == 12) {
      subTitulo = 'En andén';
    }
    else {
      subTitulo = 'Maniobra finalizada, por favor capture evidencia'
    }

    let fecha = new Date();
    let fechaEnviada = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes();
    let coordenadas = this.lat + ',' + this.lng;

    if (this.lat == null || this.lng == null) { coordenadas = 'Sin cobertura'; }

    let loading = this.loadingCtrl.create({
      content: 'Espere por favor'
    });
    loading.present();

    if (this.networkService.noConnection()) {
      //alert('Maniobra: ' + subTitulo + ' ' + 'Viaje: ' + idViaje);
      this.dataServices.insertaIniciaTerminaViajeSync(idViaje, idOrigen, idConcentrado, this.username, 0, idEstatus, Device.uuid, coordenadas, fechaEnviada, 0, '', '').then(() => {
        loading.dismiss();
        this.dataServices.actualizaViajeLocal(idEstatus, 0, idViaje, 0, '').then(response => {
          let alert = this.alertCtrl.create({
            subTitle: subTitulo,
            buttons: ['OK']
          });
          alert.present();

          if (idEstatus == 13) {
            if (idTipoViaje == 2) {
              this.ManejoMercancia(idViaje, idOrigen, idConcentrado);
            }
            else {
              this.navCtrl.setRoot(EvidenciaPage, {
                tipoEntrega: 1,
                origen: idOrigen,
                concentrado: idConcentrado,
                usuario: this.username,
                eco: this.noTracto,
                nombre: this.nombre,
                idViaje: idViaje
              });
            }
          }
          else {
            this.obtieneViajesInternos();
          }
        });
      }).catch(error => {
        loading.dismiss();
      });
    }
    else {
      this.sodisaService.actualizaViaje(idOrigen, idConcentrado, this.username, 0, idEstatus, Device.uuid, fechaEnviada, coordenadas, 0, '', null).subscribe(data => {
        loading.dismiss();
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.actualizaViajeLocal(idEstatus, 0, idViaje, 0, '').then(response => {
              let alert = this.alertCtrl.create({
                subTitle: subTitulo,
                buttons: ['OK']
              });
              alert.present();

              if (idEstatus == 13) {
                if (idTipoViaje == 2) {
                  this.ManejoMercancia(idViaje, idOrigen, idConcentrado);
                }
                else {
                  this.navCtrl.setRoot(EvidenciaPage, {
                    tipoEntrega: 1,
                    origen: idOrigen,
                    concentrado: idConcentrado,
                    usuario: this.username,
                    eco: this.noTracto,
                    nombre: this.nombre,
                    idViaje: idViaje
                  });
                }
              }
              else {
                this.obtieneViajesInternos();
              }
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (data.pResponseCode == -8) {
            this.EliminaViajeDesasociado(idViaje, 0);
          }

          this.obtieneViajesInternos();
        }
      });
    }
  }

  ManejoMercancia(idViaje, idOrigen, idConcentrado) {
    let confirm = this.alertCtrl.create({
      subTitle: '¿Se realiza entrega de mercancía?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            this.navCtrl.setRoot(EvidenciaPage, {
              origen: idOrigen,
              concentrado: idConcentrado,
              usuario: this.username,
              tipoEntrega: 2,
              eco: this.noTracto,
              nombre: this.nombre,
              idViaje: idViaje
            });
          }
        },
        {
          text: 'Si',
          handler: () => {
            this.navCtrl.setRoot(DocumentacionPage, {
              idViaje: idViaje,
              origen: idOrigen,
              concentrado: idConcentrado,
              usuario: this.username,
              eco: this.noTracto,
              nombre: this.nombre
            });
          }
        }
      ]
    });
    confirm.present();
  }

  redirectSync() {
    this.navCtrl.setRoot(SincronizacionPage, {
      usuario: this.username,
      nombre: this.nombre,
      eco: this.noTracto
    });
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

  RedireccionaViajeTerminado(viaje) {
    console.log('entre');
    this.navCtrl.setRoot(ViajeTerminadoPage, {
      usuario: this.username,
      nombre: this.nombre,
      noTracto: this.noTracto,
      odometroFinal: viaje.odometro,
      noRemolque: viaje.economico,
      idViaje: viaje.idViaje,
      idOrigen: viaje.idOrigen,
      idConcentrado: viaje.idConcentrado
    });
  }

  RedireccionaEvidencias(viaje) {
    console.log('entre');
    this.navCtrl.setRoot(EvidenciaPage, {
      tipoEntrega: 1,
      origen: viaje.idOrigen,
      concentrado: viaje.idConcentrado,
      usuario: this.username,
      eco: this.noTracto,
      nombre: this.nombre,
      idViaje: viaje.idViaje
    });
  }

  RedireccionaDocumentos(viaje) {
    this.navCtrl.setRoot(DocumentacionPage, {
      idViaje: viaje.idViaje,
      origen: viaje.idOrigen,
      concentrado: viaje.idConcentrado,
      usuario: this.username,
      eco: this.noTracto,
      nombre: this.nombre
    });
  }

  redirectConfiguracion() {
    this.navCtrl.setRoot(ConfiguracionPage, {
      usuario: this.username,
      nombre: this.nombre,
      eco: this.noTracto
    });
  }

}