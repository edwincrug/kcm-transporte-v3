import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { Camera, Device, Geolocation } from 'ionic-native';

import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';

import { WebApiProvider } from '../../providers/web-api-provider';
import { LocalDataProvider } from '../../providers/local-data-provider';
import { NetworkProvider } from '../../providers/network-provider';

/*
  Generated class for the Evidencia page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-evidencia',
  templateUrl: 'evidencia.html'
})
export class EvidenciaPage {
  base64Image: any = null;
  imagenSend: any = null;
  lat: any;
  lng: any;
  mensaje: string;
  idOrigen;
  idConcentrado;
  userName: string;
  idTipoEntrega: any;
  idDocumento: any;
  idEstatus: any;
  noTracto: string;
  nombre: string;
  listaFacturas = [];
  estatusDoc: number;
  lstDocumento = [];
  idViaje: number;

  constructor(public navCtrl: NavController, public params: NavParams, private loadingCtrl: LoadingController,
    public sodisaService: WebApiProvider, public alertCtrl: AlertController, public toastCtrl: ToastController,
    public networkService: NetworkProvider, public dataServices: LocalDataProvider) {

    this.idOrigen = params.get('origen');
    this.idConcentrado = params.get('concentrado');
    this.userName = params.get('usuario');
    this.idTipoEntrega = params.get('tipoEntrega');
    this.noTracto = params.get('eco');
    this.listaFacturas = params.get('lstFacturas');
    this.nombre = params.get('nombre');
    this.idViaje = params.get('idViaje');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EvidenciaPage');
  }

  redirectHome() {
    this.navCtrl.setRoot(HomePage, {
      usuario: this.userName,
      nombre: this.nombre,
      eco: this.noTracto
    });
  }

  CapturaEvidencia() {
    let options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    Camera.getPicture(options).then((imageData) => {
      this.base64Image = "data:image/jpeg;base64," + imageData;
      this.imagenSend = imageData;

    });
  }

  EnviaEvidencia() {
    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    let fecha = new Date();
    let fechaEnviada = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes();
    let coordenadas = this.lat + ',' + this.lng;

    if (this.lat == null || this.lng == null) { coordenadas = 'Sin Cobertura'; }

    if (this.imagenSend != null) {
      if (this.idTipoEntrega == 1) {
        this.entregaTotal(fechaEnviada, coordenadas);

      }
      else {
        this.idEstatus = 15;

        if (this.listaFacturas != null) {
          this.entregaDocumentos(this.listaFacturas, fechaEnviada, coordenadas);
        }
        else {
          this.entregaTotal(fechaEnviada, coordenadas);
        }
      }
    }
    else {
      let alert = this.alertCtrl.create({
        subTitle: 'Debe capturar una evidencia',
        buttons: ['OK']
      });
      alert.present();
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

    if (codigoRespuesta.pResponseCode == -5) {
      this.navCtrl.setRoot(LoginPage);
    }
  }

  entregaDocumentos(listaFacturas, fechaEnviada, coordenadas) {
    let loading = this.loadingCtrl.create({
      content: 'Espere por favor'
    });

    loading.present();

    for (let x = 0; x < listaFacturas.length; x++) {

      if (listaFacturas[x].idEstatus == true) {
        this.estatusDoc = 14;
      }
      else {
        this.estatusDoc = 15;
      }

      let detalleDocumento = {
        pIdOperadorVc: this.userName,
        pIdDispositvoVc: Device.uuid,
        pIdLocalidadIn: this.idOrigen,
        pIdDestinoIn: listaFacturas[x].cliente,
        pIdConcentradoVc: this.idConcentrado,
        pIdClienteAnteriorIn: listaFacturas[x].cliente,
        pIdConsignatarioIn: listaFacturas[x].consignatario,
        pIdDocumentoVc: listaFacturas[x].noFactura,
        pIdEstatusViajeIn: this.estatusDoc,
        pEvidenciaFotograficaVc: ' ',
        pFechaEventoDt: fechaEnviada,
        pGeoLocalizacionEventoVc: coordenadas
      }

      this.lstDocumento.push(detalleDocumento);
    }

    if (this.networkService.noConnection()) {
      // alert('Entrega documentos, viaje: ' + this.idViaje + ',  estatus: ' + this.idEstatus);
      this.dataServices.insertaIniciaTerminaViajeSync(this.idViaje, this.idOrigen, this.idConcentrado, this.userName, 0, this.idEstatus, Device.uuid, coordenadas, fechaEnviada, 0, '', this.imagenSend).then(() => {
        loading.dismiss();

        for (let x = 0; x < this.lstDocumento.length; x++) {
          this.dataServices.insertaViajeDetalleSync(this.idViaje, this.userName, Device.uuid, this.idOrigen, listaFacturas[x].cliente, this.idConcentrado, listaFacturas[x].cliente, listaFacturas[x].consignatario, listaFacturas[x].noFactura, this.estatusDoc, '', fechaEnviada, coordenadas).then(() => {
            //alert('Registra Detalle Factura');
          });
        }

        this.dataServices.actualizaViajeLocal(this.idEstatus, 0, this.idViaje, 0, '').then(response => {
          let alert = this.alertCtrl.create({
            subTitle: 'Viaje terminado',
            buttons: ['OK']
          });
          alert.present();

          this.redirectHome();
        });
      }).catch(error => {
        loading.dismiss();
      });
      
    }
    else {
      this.sodisaService.actualizaViajeEntrega(this.userName, Device.uuid, this.lstDocumento, this.imagenSend).subscribe(data => {
        loading.dismiss();
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.eliminaViajeLocal(this.idViaje).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: 'Viaje terminado',
                buttons: ['OK']
              });
              alert.present();

              this.redirectHome();

            }));
        }
        else {
          this.interpretaRespuesta(data);
        }
      }, (err) => {
        alert('Error webapi: ' + err);
      });

    }

  }

  entregaTotal(fechaEnviada, coordenadas) {
    this.idDocumento = 0;
    this.idEstatus = 14

    let loading = this.loadingCtrl.create({
      content: 'Espere por favor'
    });

    loading.present();

    if (this.networkService.noConnection()) {  //this.idViaje, this.idOrigen, this.idConcentrado, this.userName, 0, this.idEstatus, Device.uuid
      //alert('Entrega total, viaje: ' + this.idViaje + ',  estatus: ' + this.idEstatus);
      this.dataServices.insertaIniciaTerminaViajeSync(this.idViaje, this.idOrigen, this.idConcentrado, this.userName, 0, this.idEstatus, Device.uuid, coordenadas, fechaEnviada, 0, '', this.imagenSend).then(() => {
        loading.dismiss();
        this.dataServices.actualizaViajeLocal(this.idEstatus, 0, this.idViaje, 0, '').then(response => {
          let alert = this.alertCtrl.create({
            subTitle: 'Trabajo terminado',
            buttons: ['OK']
          });
          alert.present();

          this.redirectHome();
        });
      }).catch(error => {
        loading.dismiss();
      });
    }
    else {
      this.sodisaService.actualizaViaje(this.idOrigen, this.idConcentrado, this.userName, this.idDocumento, this.idEstatus, Device.uuid, fechaEnviada, coordenadas, 0, '', this.imagenSend).subscribe(data => {
        loading.dismiss();
        if (data.pResponseCode == 1) {
          this.dataServices.openDatabase()
            .then(() => this.dataServices.eliminaViajeLocal(this.idViaje).then(response => {
              let alert = this.alertCtrl.create({
                subTitle: 'Viaje terminado',
                buttons: ['OK']
              });
              alert.present();

              this.redirectHome();

            }));

        }
        else {
          this.interpretaRespuesta(data);
        }

      }, (err) => {
        alert('Hubo error en cámara');
      });

    }


  }

}
