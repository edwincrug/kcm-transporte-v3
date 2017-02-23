import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ModalController } from 'ionic-angular';

import { HomePage } from '../home/home';

import { WebApiProvider } from '../../providers/web-api-provider';
import { LocalDataProvider } from '../../providers/local-data-provider';
import { NetworkProvider } from '../../providers/network-provider';
import { ComunProvider } from '../../providers/comun-provider';

/*
  Generated class for the Configuracion page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-configuracion',
  templateUrl: 'configuracion.html'
})
export class ConfiguracionPage {
  username: string;
  nombre: string;
  economico: string;
  lastDateParada: string;
  lastDateIncidente: string;
  lastDateFrecuencia: number;

  constructor(public navCtrl: NavController, public params: NavParams, public dataServices: LocalDataProvider,
    public sodisaService: WebApiProvider, public networkService: NetworkProvider, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, public comunService: ComunProvider, public modalCtrl: ModalController) {

    this.username = params.get('usuario');
    this.nombre = params.get('nombre');
    this.economico = params.get('eco');
  }

  ionViewDidLoad() {
    this.obtieneUltimaActualizacionParada();
    this.obtieneUltimaActualizacionIncidente();
    this.obtieneUltimaActualizacionFrecuencia();
  }

  redirectHome() {
    this.navCtrl.setRoot(HomePage, {
      usuario: this.username,
      nombre: this.nombre,
      eco: this.economico
    });
  }

  updateCatalogo(idTipoEvento) {
    let alert = this.alertCtrl.create({
      subTitle: 'La actualización no se pudo llevar a cabo, inténtelo más tarde',
      buttons: ['OK']
    });

    let alertUpdate = this.alertCtrl.create({
      subTitle: 'Catálogo actualizado correctamente',
      buttons: ['OK']
    });

    let loading = this.loadingCtrl.create({
      content: 'Actualizando...'
    });
    loading.present();

    this.sodisaService.obtenCatalogoActualizado(idTipoEvento).subscribe(resp => {
      if (resp.length > 0) {
        if (idTipoEvento == 1) {
          this.dataServices.eliminaParadas().then(() => {
            for (let x = 0; x < resp.length; x++) {
              this.dataServices.insertaCatalogoParadas(resp[x].pidEventoIn, resp[x].pnombreEventoVc);
            }

            this.dataServices.actualizaFechaCatalogoParada(this.comunService.fechaActual()).then(() => {
              this.obtieneUltimaActualizacionParada();
              loading.dismiss();
              alertUpdate.present();
            });
          });
        }
        else {
          this.dataServices.eliminaIncidente().then(() => {
            for (let x = 0; x < resp.length; x++) {
              this.dataServices.insertaCatalogoIncidente(resp[x].pidEventoIn, resp[x].pnombreEventoVc);
            }

            this.dataServices.actualizaFechaCatalogoIncidente(this.comunService.fechaActual()).then(() => {
              this.obtieneUltimaActualizacionIncidente();
              loading.dismiss();
              alertUpdate.present();
            });
          });
        }
      }
      else {
        loading.dismiss();
        alert.present();
      }
    }, error => {
      loading.dismiss();
      alert.present();
    });
  }

  showConfirm(idTipoEvento) {
    if (this.networkService.noConnection()) {
      let alert = this.alertCtrl.create({
        subTitle: 'Sin cobertura',
        buttons: ['OK']
      });
      alert.present();
    }
    else {

      let confirm = this.alertCtrl.create({
        title: 'Advertencia',
        message: '¿Está seguro en actualizar este catálogo?',
        buttons: [
          {
            text: 'No'
          },
          {
            text: 'Si',
            handler: () => {
              this.updateCatalogo(idTipoEvento);
            }
          }
        ]
      });
      confirm.present();

    }
  }

  obtieneUltimaActualizacionParada() {
    this.dataServices.getUltimoUpdateParada().then(resp => {
      if (resp.ultimaActualizacion != null) {
        this.lastDateParada = resp.ultimaActualizacion;
      }
    });
  }

  obtieneUltimaActualizacionIncidente() {
    this.dataServices.getUltimoUpdateIncidente().then(resp => {
      if (resp.ultimaActualizacion != null) {
        this.lastDateIncidente = resp.ultimaActualizacion;
      }
    });
  }

  obtieneUltimaActualizacionFrecuencia() {
    this.dataServices.getFrecuenciaNotificacion().then(resp => {
      if (resp.tiempo != null) {
        this.lastDateFrecuencia = (resp.tiempo / 60000);
      }
    });
  }

  showConfirmFrecuency() {
    if (this.networkService.noConnection()) {
      let alert = this.alertCtrl.create({
        subTitle: 'Sin cobertura',
        buttons: ['OK']
      });
      alert.present();
    }
    else {

      let confirm = this.alertCtrl.create({
        title: 'Advertencia',
        message: '¿Está seguro en actualizar la frecuencia del GPS?',
        buttons: [
          {
            text: 'No'
          },
          {
            text: 'Si',
            handler: () => {
              this.updateFrecuency();
            }
          }
        ]
      });
      confirm.present();

    }
  }

  updateFrecuency() {
    let alert = this.alertCtrl.create({
      subTitle: 'La actualización no se pudo llevar a cabo, inténtelo más tarde',
      buttons: ['OK']
    });

    let alertUpdate = this.alertCtrl.create({
      subTitle: 'Frecuencia actualizada correctamente',
      buttons: ['OK']
    });


    let respuesta = this.validaFrecuencia(this.lastDateFrecuencia);
    if (respuesta == 'OK') {
      let loading = this.loadingCtrl.create({
        content: 'Actualizando...'
      });
      loading.present();

      this.dataServices.actualizaFrecuenciaNotificacion((this.lastDateFrecuencia * 60000)).then(() => {
        loading.dismiss();
        this.obtieneUltimaActualizacionFrecuencia();
        alertUpdate.present();
      }).catch(error => {
        loading.dismiss();
        alert.present();
      });
    }
    else {
      let alertError = this.alertCtrl.create({
        subTitle: respuesta,
        buttons: ['OK']
      });

      alertError.present();
    }

  }

  validaFrecuencia(frecuencia) {
    let subTitle: string = 'OK';

    if (frecuencia == null) {
      subTitle = 'Debe capturar la frecuencia';
    }
    else if (frecuencia < 15) {
      subTitle = 'La frecuencia mínima debe ser de 15 minutos';
    }

    return subTitle;
  }

}




