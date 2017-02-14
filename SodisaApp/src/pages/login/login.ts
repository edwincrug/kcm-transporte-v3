import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { Device } from 'ionic-native';

import { NetworkProvider } from '../../providers/network-provider';
import { LocalDataProvider } from '../../providers/local-data-provider';
import { WebApiProvider } from '../../providers/web-api-provider';

import { HomePage } from '../home/home';

/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  imei: string;
  username: string;
  password: string;
  public credenciales: any;
  mensaje: string;
  listaViajesAsignados: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public toastCtrl: ToastController,
    private loadingCtrl: LoadingController, public networkService: NetworkProvider, public dataServices: LocalDataProvider,
    private sodisaService: WebApiProvider, public alertCtrl: AlertController) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  validaCredenciales() {
    //alert('Entra a validar');
    this.imei = Device.uuid;

    let loading = this.loadingCtrl.create({
      content: 'Autenticando...',
      duration: 10000
    });

    loading.present();

    this.dataServices.openDatabase()
      .then(() => this.dataServices.checkUsuario(this.username, this.password, this.imei).then(respuesta => {
        if (respuesta == 'KO') {
          if (this.networkService.noConnection()) {
            loading.dismiss();

            let alert = this.alertCtrl.create({
              title: 'Sin cobertura',
              subTitle: 'Inténtelo más tarde',
              buttons: ['OK']
            });
            alert.present();
          }
          else {
            this.sodisaService.login(this.username, this.password, this.imei).subscribe(data => {
              loading.dismiss();
              this.credenciales = data;
              this.interpretaRespuesta(this.credenciales);
            });
          }

        }
        else {
          this.sodisaService.login(this.username, this.password, this.imei).subscribe(data => {
            loading.dismiss();
            this.credenciales = data;
            this.interpretaRespuesta(this.credenciales);
          });
          // this.sodisaService.viajesAsignados(this.username, Device.uuid).subscribe(data => {
          //   loading.dismiss();
          //   this.listaViajesAsignados = data.pListaViajeMovil;
          //   if (data.pResponseCode == 1) {
          //     if (data.pListaViajeMovil.length > 0) {
          //       this.dataServices.openDatabase()
          //         .then(() => this.dataServices.insertaViajesAsignados(data.pListaViajeMovil).then(result => {

          //         }));
          //     }
          //   }
          //   else {
          //     if (data.pResponseCode == -5) {
          //       this.navCtrl.push(LoginPage);
          //     }
          //   }
          // });

          let presentacion = this.loadingCtrl.create({
            content: '¡Bienvenido..' + respuesta.nombreCompleto + ' !',
            duration: 3000
          });
          presentacion.present();

          this.navCtrl.setRoot(HomePage, {
            usuario: this.username,
            nombre: respuesta.nombreCompleto,
            eco: respuesta.tracto
          });


        }
      }).catch(error => {
        alert('Error lectura BD 1');
        loading.dismiss();
      })).catch(error => {
        alert('Error lectura BD 2');
        loading.dismiss();
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
      case 1:
        this.mensaje = "¡Bienvenido " + codigoRespuesta.pOperadorNombre + ' !';
    }

    let toast = this.toastCtrl.create({
      message: this.mensaje,
      duration: 1000,
      position: 'middle'
    });
    toast.present();

    if (codigoRespuesta.pResponseCode == 1) {

      this.dataServices.openDatabase()
        .then(() => this.dataServices.ObtieneUsuario().then(respuesta => {
          let usuarioLocal = respuesta.userName;
          let pwdLocal = respuesta.password;

          if (usuarioLocal != undefined && pwdLocal != undefined) {
            if (this.username == usuarioLocal && this.password == pwdLocal) {
              this.registraUsuario(codigoRespuesta.pIdOperador, this.password, codigoRespuesta.pNumeroEconomicoTractocamion, codigoRespuesta.pOperadorNombre, this.imei).then(res => {
                this.registraViajesAsignados(codigoRespuesta.pListaViajeMovil);

              }).catch(error => {
                alert('Error al insertar usuario');
              });
            }
            else {
              this.eliminaInfoLocal().then(() => {
                this.registraUsuario(codigoRespuesta.pIdOperador, this.password, codigoRespuesta.pNumeroEconomicoTractocamion, codigoRespuesta.pOperadorNombre, this.imei).then(res => {
                  this.registraViajesAsignados(codigoRespuesta.pListaViajeMovil);

                }).catch(error => {
                  alert('Error al insertar usuario');
                });
              });
            }
          }
          else {
            this.eliminaInfoLocal().then(() => {
              this.registraUsuario(codigoRespuesta.pIdOperador, this.password, codigoRespuesta.pNumeroEconomicoTractocamion, codigoRespuesta.pOperadorNombre, this.imei).then(res => {
                this.registraViajesAsignados(codigoRespuesta.pListaViajeMovil);

              }).catch(error => {
                alert('Error al insertar usuario');
              });
            });
          }

          this.navCtrl.setRoot(HomePage, {
            usuario: codigoRespuesta.pIdOperador,
            nombre: codigoRespuesta.pOperadorNombre,
            eco: codigoRespuesta.pNumeroEconomicoTractocamion
          });

        }));

    }
  }

  registraViajesAsignados(ListaViajes) {
    if (ListaViajes.length > 0) {
      this.dataServices.openDatabase()
        .then(response => {
          this.dataServices.insertaViajesAsignados(ListaViajes);
        });
    }
  }

  registraUsuario(userName, password, noTracto, nombreCompleto, imei) {
    return this.dataServices.openDatabase()
      .then(response => {
        this.dataServices.insertaUsuario(userName.toUpperCase(), password.toUpperCase(), noTracto.toUpperCase(), nombreCompleto.toUpperCase(), imei.toUpperCase());
      });
  }

  validaCredencialLocal() {
    return this.dataServices.openDatabase()
      .then(() => this.dataServices.ObtieneUsuario().then(respuesta => {

        let usuarioLocal = respuesta.userName;
        let pwdLocal = respuesta.password;

        if (respuesta.userName != undefined && respuesta.password != undefined) {
          if (this.username.toUpperCase() == usuarioLocal.toUpperCase() && this.password.toUpperCase() == pwdLocal.toUpperCase()) {
            return Promise.resolve('OK');
          }
          else {
            return Promise.resolve('KO');
          }
        } else {
          return Promise.resolve('KO');
        }
      }).catch(error => {
        return Promise.resolve('ERROR: ' + error);
      }));
  }

  eliminaInfoLocal() {
    return this.dataServices.openDatabase()
      .then(() => this.dataServices.EliminaTablaViajeSync())
      .then(() => this.dataServices.EliminaTablaViajeDetalle())
      .then(() => this.dataServices.EliminaTablaViaje())
      .then(() => this.dataServices.EliminaTablaUsuario());
  }

}
