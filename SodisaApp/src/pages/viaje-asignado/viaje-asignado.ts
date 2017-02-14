import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Device } from 'ionic-native';

import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';
import { NuevoViajePage } from '../nuevo-viaje/nuevo-viaje';

import { LocalDataProvider } from '../../providers/local-data-provider';
import { NetworkProvider } from '../../providers/network-provider';
import { WebApiProvider } from '../../providers/web-api-provider';

/*
  Generated class for the ViajeAsignado page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-viaje-asignado',
  templateUrl: 'viaje-asignado.html'
})
export class ViajeAsignadoPage {
  listaViajeManiobraLocales: any[] = [];
  imei: string;
  mensaje: string;
  username: string;
  nombre: string;
  economico: string;
  subTitulo: string;
  idEstatusActualizar: number;
  idRechazoSelected;
  listaViajesAsignados: any[] = [];

  constructor(public navCtrl: NavController, public params: NavParams, public dataServices: LocalDataProvider,
    public networkService: NetworkProvider, public sodisaService: WebApiProvider, public alertCtrl: AlertController,
    private loadingCtrl: LoadingController, public toastCtrl: ToastController) {

    this.username = params.get('usuario');
    this.nombre = params.get('nombre');
    this.economico = params.get('eco');

    this.imei = Device.uuid;
  }

  ionViewDidLoad() {
    this.ObtieneViajeManiobraInternos();
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

  ViajeTracking(idViaje, idOrigen, origenNombre, destino, idConcentrado, economico, idTipoViaje) {
    this.navCtrl.setRoot(NuevoViajePage, {
      usuario: this.username,
      nombre: this.nombre,
      eco: this.economico,
      idViaje: idViaje,
      idOrigen: idOrigen,
      idConcentrado: idConcentrado,
      origenNombre: origenNombre,
      destino: destino,
      tipoViaje: idTipoViaje,
      noRemolque: economico
    });
  }

  RedirectHome() {
    this.navCtrl.setRoot(HomePage, {
      usuario: this.username,
      nombre: this.nombre,
      eco: this.economico
    });
  }

  AceptaViajeManiobra(idViaje, idOrigen, idConcentrado, idTipoViaje, noRemolque) {
    if (idTipoViaje == 1) {
      this.subTitulo = 'Viaje aceptado';
      this.idEstatusActualizar = 3;
    }
    else {
      this.subTitulo = 'Maniobra aceptada';
      this.idEstatusActualizar = 9;
    }

    let loading = this.loadingCtrl.create({
      content: 'Espere por favor ...'
    });
    loading.present();

    if (this.networkService.noConnection()) {
      loading.dismiss();
      
      this.dataServices.insertaAceptaRechazaViajeSync(idViaje, idOrigen, idConcentrado, this.username, 0, this.idEstatusActualizar, this.imei).then(() => {
        loading.dismiss();
        this.dataServices.actualizaViajeLocal(this.idEstatusActualizar, 0, idViaje, 0, noRemolque).then(response => {
          let alert = this.alertCtrl.create({
            subTitle: this.subTitulo,
            buttons: ['OK']
          });
          alert.present();

          this.ObtieneViajeManiobraInternos();
        });
      }).catch(error => {
        alert('Error al registrar en bd');
        loading.dismiss();
      });
    }
    else {
      this.sodisaService.aceptaRechazaViaje(idOrigen, idConcentrado, this.username, 0, this.idEstatusActualizar, this.imei).subscribe(data => {
        loading.dismiss();
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.actualizaViajeLocal(this.idEstatusActualizar, 0, idViaje, 0, noRemolque).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: this.subTitulo,
                buttons: ['OK']
              });
              alert.present();

              this.ObtieneViajeManiobraInternos();
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (data.pResponseCode == -8) {
            this.EliminaViajeDesasociado(idViaje, 0);
          }

          this.ObtieneViajeManiobraInternos();
        }
      });
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
          this.RechazaViaje(idViaje, idOrigen, idConcentrado, idTipoViaje);
        }

      }
    });

    alert.present();

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

          this.ObtieneViajeManiobraInternos();
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

              this.ObtieneViajeManiobraInternos();
            }));
        }
        else {
          this.interpretaRespuesta(data);

          if (data.pResponseCode == -8) {
            this.EliminaViajeDesasociado(idViaje, 0);
          }
          this.ObtieneViajeManiobraInternos();
        }

      });
    }
  }

  obtieneViajesAsignados(refresher) {
    setTimeout(() => {
      // this.sodisaService.viajesAsignados('C55163', 'aa1add0d87db4099')
      this.sodisaService.viajesAsignados(this.username, Device.uuid)
        .subscribe(data => {
          this.listaViajesAsignados = data.pListaViajeMovil;
          if (data.pResponseCode == 1) {
            if (data.pListaViajeMovil.length > 0) {
              this.dataServices.openDatabase()
                .then(() => this.dataServices.insertaViajesAsignados(data.pListaViajeMovil).then(result => {
                  let loading = this.loadingCtrl.create({
                    content: 'Recuperando información...'
                  });

                  loading.present();

                  setTimeout(() => {
                    this.ObtieneViajeManiobraInternos();
                    loading.dismiss();
                  }, 3000);
                }));
            }
            else {
              let alert = this.alertCtrl.create({
                subTitle: 'Sin nuevos viajes asignados',
                buttons: ['OK']
              });
              alert.present();
            }
          }
          else {
            let toast = this.toastCtrl.create({
              message: data.pMessage,
              duration: 2000,
              position: 'middle'
            });
            toast.present();

            if (data.pResponseCode == -5) {
              this.navCtrl.push(LoginPage);
            }
          }
        });
      refresher.complete();
    }, 2000);
  }
}
