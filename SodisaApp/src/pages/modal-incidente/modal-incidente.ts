import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { Camera, Device, Geolocation } from 'ionic-native';

import { LoginPage } from '../login/login';

import { WebApiProvider } from '../../providers/web-api-provider';
import { LocalDataProvider } from '../../providers/local-data-provider';
import { NetworkProvider } from '../../providers/network-provider';

/*
  Generated class for the ModalIncidente page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-modal-incidente',
  templateUrl: 'modal-incidente.html'
})
export class ModalIncidentePage {
  base64Image;
  imagenSend;
  lat: any;
  lng: any;
  idViaje;
  idOrigen;
  idConcentrado;
  userName: string;
  idIncidente: number;
  observaciones: string;
  mensaje: string;
  descripcionIncidente: string;

  constructor(public navCtrl: NavController, public params: NavParams, public viewCtrl: ViewController,
    public sodisaService: WebApiProvider, public toastCtrl: ToastController, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, public networkService: NetworkProvider, public dataServices: LocalDataProvider) {

    this.idViaje = params.get('viaje');
    this.idOrigen = params.get('origen');
    this.idConcentrado = params.get('concentrado');
    this.userName = params.get('usuario');
    this.idIncidente = params.get('incidente');

    this.RegresaDescripcion(this.idIncidente);

    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalIncidentePage');
  }

  dismiss() {
    this.viewCtrl.dismiss();
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

    let loading = this.loadingCtrl.create({
      content: 'Espere por favor'
    });
    loading.present();

    if (this.imagenSend != null) {
      if (this.networkService.noConnection()) {
        this.dataServices.insertaParadaIncidenteSync(this.userName, this.idOrigen, this.idConcentrado, 2, this.idIncidente, this.imagenSend, this.observaciones, coordenadas, fechaEnviada, Device.uuid).then(() => {
          setTimeout(() => {
            loading.dismiss();

            let alert = this.alertCtrl.create({
              subTitle: 'Incidente registrado',
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                    this.dismiss();
                  }
                }
              ]
            });
            alert.present();
          }, 5000);

        }).catch(error => {
          loading.dismiss();
          alert('Error al guardar la evidencia local: ' + error);
        });
      }
      else {
        this.sodisaService.RegistraParadaIncidente(this.userName, this.idOrigen, this.idConcentrado, 2, this.idIncidente, this.imagenSend, this.observaciones, coordenadas, fechaEnviada, Device.uuid).subscribe(data => {
          loading.dismiss();
          if (data.pResponseCode == 1) {
            let alert = this.alertCtrl.create({
              subTitle: 'Incidente registrado',
              buttons: ['OK']
            });
            alert.present();

            this.dismiss();
          }
          else {
            this.interpretaRespuesta(data);
          }

        }, (err) => {
          alert('Hubo error en cámara');
          loading.dismiss();
          this.dismiss();
        });
      }

    }
    else {
      loading.dismiss();

      let alert = this.alertCtrl.create({
        subTitle: 'Por favor capture una evidencia',
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

  RegresaDescripcion(idIncidente) {
    if (idIncidente == 1) {
      this.descripcionIncidente = 'Bloqueo de tarjeta Iave';
    }
    else if (idIncidente == 2) {
      this.descripcionIncidente = 'Desvio de ruta';
    }
    else if (idIncidente == 3) {
      this.descripcionIncidente = 'Falla mecánica';
    }
    else if (idIncidente == 4) {
      this.descripcionIncidente = 'Intento de robo';
    }
    else if (idIncidente == 5) {
      this.descripcionIncidente = 'Siniestro unidad';
    }
    else if (idIncidente == 6) {
      this.descripcionIncidente = 'Otro';
    }

  }

}
