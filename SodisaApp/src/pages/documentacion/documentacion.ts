import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { EvidenciaPage } from '../evidencia/evidencia';

import { LocalDataProvider } from '../../providers/local-data-provider';

/*
  Generated class for the Documentacion page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-documentacion',
  templateUrl: 'documentacion.html'
})
export class DocumentacionPage {
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
  idViaje;
  listaFacturas = [];
  viajeDetalle;

  constructor(public navCtrl: NavController, public params: NavParams, public dataServices: LocalDataProvider) {

    this.userName = params.get('usuario');
    this.noTracto = params.get('eco');
    this.nombre = params.get('nombre');

    this.idOrigen = params.get('origen');
    this.idConcentrado = params.get('concentrado');
    this.idTipoEntrega = params.get('tipoEntrega');
    this.idViaje = params.get('idViaje');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DocumentacionPage');
    this.ObtieneDetalleViaje();
  }

  RedirectEvidencia() {
    this.navCtrl.setRoot(EvidenciaPage, {
      origen: this.idOrigen,
      concentrado: this.idConcentrado,
      usuario: this.userName,
      tipoEntrega: this.idTipoEntrega,
      eco: this.noTracto,
      lstFacturas: this.listaFacturas,
      nombre: this.nombre,
      idViaje: this.idViaje
    });
  }

  ObtieneDetalleViaje() {
    this.dataServices.openDatabase()
      .then(() => this.dataServices.checkDetalleViaje(this.idViaje).then(response => {
        if (response.length > 0) {

          for (let x = 0; x < response.length; x++) {

            let valores = response[x].idDestino.split('|');
            if (valores.length == 1) {
              let viajeDetalle = {
                cliente: valores[0],
                consignatario: 0,
                noFactura: response[x].idDocumento,
                idEstatus: false,
                labelEntrega: 'Parcial'
              }
              this.listaFacturas.push(viajeDetalle);
            }
            else {
              let viajeDetalle = {
                cliente: valores[0],
                consignatario: valores[1],
                noFactura: response[x].idDocumento,
                idEstatus: false,
                labelEntrega: 'Parcial'
              }

              this.listaFacturas.push(viajeDetalle);
            }

          }
        }
        else {
          this.listaFacturas = [];
        }
      }).catch(error => {
        alert('Viaje detalle error: ' + error);
      }));
  }

  CambiaEtiqueta(idEstatus, indice) {
    if (idEstatus == false) {
      this.listaFacturas[indice].idEstatus = true;
      this.listaFacturas[indice].labelEntrega = 'Total';
    }
    else {
      this.listaFacturas[indice].idEstatus = false;
      this.listaFacturas[indice].labelEntrega = 'Parcial';
    }

  }
}
