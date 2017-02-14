import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

/*
  Generated class for the Modal page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html'
})
export class ModalPage {
  odometro: number;
  remolque: string;
  tipoOdometro: string;

  constructor(public navCtrl: NavController, public params: NavParams, public viewCtrl: ViewController) {
    this.remolque = params.get('noRemolque');

    if (params.get('idTipoOdometro') == 1) {
      this.tipoOdometro = 'Inicial';
    }
    else {
      this.tipoOdometro = 'Final';
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalPage');
  }

  dismiss() {
    this.viewCtrl.dismiss({ km: 0, remolque: 0 });
  }

  validarDatos() {
    if ((this.odometro == null) && (this.remolque == null || this.remolque.trim() == '')) {
      alert('Los campos odómetro y remolque son obligatorios');
    }
    else if (this.odometro == null) {
      alert('El campo odómetro es obligatorio');
    }
    else if (this.odometro <= 0) {
      alert('El campo odómetro debe ser mayor a cero');
    }
    else if (this.remolque == null || this.remolque.trim() == '') {
      alert('El campo remolque es obligatorio');
    }
    else if (!/^([0-9])*$/.test(this.odometro.toString())) {
      alert('El campo odómetro sólo permite números');
    }
    else {
      this.viewCtrl.dismiss({ km: this.odometro, remolque: this.remolque });
    }
  }

}
