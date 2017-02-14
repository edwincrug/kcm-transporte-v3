import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { Camera, Device, Geolocation } from 'ionic-native';

import { LoginPage } from '../login/login';
import { HomePage } from '../home/home';

import { WebApiProvider } from '../../providers/web-api-provider';
import { LocalDataProvider } from '../../providers/local-data-provider';
import { NetworkProvider } from '../../providers/network-provider';

/*
  Generated class for the ModalParadas page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-modal-paradas',
  templateUrl: 'modal-paradas.html'
})
export class ModalParadasPage {
  base64Image;
  imagenSend;
  lat: any;
  lng: any;
  idViaje;
  idOrigen;
  idConcentrado;
  userName: string;
  idParada: number;
  observaciones: string;
  mensaje: string;
  descripcionParada: string;
  nombre: string;
  noTracto: any;


  constructor(public navCtrl: NavController, public params: NavParams, public viewCtrl: ViewController,
    public sodisaService: WebApiProvider, public toastCtrl: ToastController, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, public networkService: NetworkProvider, public dataServices: LocalDataProvider) {

    this.idViaje = params.get('viaje');
    this.idOrigen = params.get('origen');
    this.idConcentrado = params.get('concentrado');
    this.userName = params.get('usuario');
    this.idParada = params.get('parada');
    this.nombre = params.get('nombre');
    this.noTracto = params.get('eco');

    this.RegresaDescripcion(this.idParada);

    Geolocation.getCurrentPosition()
      .then(position => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalParadasPage');
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

    if (this.lat == null || this.lng == null) { coordenadas = 'Sin cobertura'; }

    let loading = this.loadingCtrl.create({
      content: 'Espere por favor'
    });
    loading.present();

    if (this.imagenSend != null) {
      if (this.networkService.noConnection()) {
        this.dataServices.insertaParadaIncidenteSync(this.userName, this.idOrigen, this.idConcentrado, 1, this.idParada, this.imagenSend, this.observaciones, coordenadas, fechaEnviada, Device.uuid).then(() => {
          setTimeout(() => {
            loading.dismiss();

            let alert = this.alertCtrl.create({
              subTitle: 'Parada permitida registrada',
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
        this.sodisaService.RegistraParadaIncidente(this.userName, this.idOrigen, this.idConcentrado, 1, this.idParada, this.imagenSend, this.observaciones, coordenadas, fechaEnviada, Device.uuid).subscribe(data => {
          loading.dismiss();
          if (data.pResponseCode == 1) {
            let alert = this.alertCtrl.create({
              subTitle: 'Parada permitida registrada',
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

  RegresaDescripcion(idParada) {
    if (idParada == 1) {
      this.descripcionParada = 'Carga de combustible';
    }
    else if (idParada == 2) {
      this.descripcionParada = 'Manifestación';
    }
    else if (idParada == 3) {
      this.descripcionParada = 'Mal clima';
    }
    else if (idParada == 4) {
      this.descripcionParada = 'Comida';
    }
    else if (idParada == 5) {
      this.descripcionParada = 'Descanso';
    }
    else if (idParada == 6) {
      this.descripcionParada = 'Otro';
    }
  }

  RedirectHome() {
    this.navCtrl.setRoot(HomePage, {
      usuario: this.userName,
      nombre: this.nombre,
      eco: this.noTracto
    });
  }
}
