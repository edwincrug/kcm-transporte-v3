import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ViewController } from 'ionic-angular';

import { NetworkProvider } from '../../providers/network-provider';
import { LocalDataProvider } from '../../providers/local-data-provider';

/*
  Generated class for the ModalFrecuencia page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-modal-frecuencia',
  templateUrl: 'modal-frecuencia.html'
})
export class ModalFrecuenciaPage {
  lastDateFrecuencia: number;
  labelFrecuencia: number;

  constructor(public navCtrl: NavController, public params: NavParams, public alertCtrl: AlertController,
    public networkService: NetworkProvider, public loadingCtrl: LoadingController, public dataServices: LocalDataProvider,
    public viewCtrl: ViewController) {

    this.lastDateFrecuencia = params.get('tiempo');
    this.labelFrecuencia = this.lastDateFrecuencia;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalFrecuenciaPage');
  }

  dismiss() {
    this.viewCtrl.dismiss({ tiempo: 0 });
  }

  updateFrecuency() {
    let respuesta = this.validaFrecuencia(this.lastDateFrecuencia);
    if (respuesta == 'OK') {
      this.viewCtrl.dismiss({ tiempo: this.lastDateFrecuencia });
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
    else if(frecuencia > 60){
      subTitle = 'La frecuencia máxima debe ser de 60 minutos (1 hora)';
    }

    return subTitle;
  }
}
