import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { HomePage } from '../home/home';

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

  constructor(public navCtrl: NavController, public params: NavParams) {

    this.username = params.get('usuario');
    this.nombre = params.get('nombre');
    this.economico = params.get('eco');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfiguracionPage');
  }

  redirectHome() {
    this.navCtrl.setRoot(HomePage, {
      usuario: this.username,
      nombre: this.nombre,
      eco: this.economico
    });
  }

}
