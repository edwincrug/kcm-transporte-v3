import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { Http } from '@angular/http';

import { LoginPage } from '../pages/login/login';

import { WebApiProvider } from '../providers/web-api-provider';
import { LocalDataProvider } from '../providers/local-data-provider';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = LoginPage;
  mesFinal: string;

  constructor(public platform: Platform, public sodisaService: WebApiProvider, public dataServices: LocalDataProvider,
    public http: Http) {

    this.initializeApp();

  }

  initializeApp() {
    var internetConnected = false;
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();

      this.dataServices.openDatabase()
        .then(() => this.dataServices.createTableUsuario())
        .then(() => this.dataServices.createTableViaje())
        .then(() => this.dataServices.createTableViajeDetalle())
        .then(() => this.dataServices.createTableViajeSync())
        .then(() => this.dataServices.createTableParadaIncidenteSync())
        .then(() => this.dataServices.createTableViajeDetalleSync())
        .then(() => this.dataServices.createTableUltimaActualizacion())
        .then(() => {
          this.rootPage = LoginPage;
        });

      let wsSodisa = new WebApiProvider(this.http);
      let lstDocumento = [];
      document.addEventListener("online", function () {
        //alert('Entra online Bandera: ' + internetConnected);
        if (internetConnected) {
          return;
        }
        else {
          let dbService = new LocalDataProvider();

          dbService.openDatabase()
            .then(() => {
              dbService.viajesPorSincronizar().then(result => {
                // alert('Viajes por sincronizar: ' + result.length);

                if (result.length > 0) {

                  let fecha = new Date();
                  let mesOriginal = fecha.getMonth() + 1;
                  if (mesOriginal.toString().length == 1) {
                    this.mesFinal = '0' + mesOriginal.toString();
                  }
                  else {
                    this.mesFinal = mesOriginal.toString();
                  }

                  let fechaEnviada = fecha.getFullYear() + '-' + this.mesFinal + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes();

                  for (let x = 0; x < result.length; x++) {

                    if (result[x].idEstatus == 3 || result[x].idEstatus == 4 || result[x].idEstatus == 9 || result[x].idEstatus == 10) {
                      wsSodisa.aceptaRechazaViaje(result[x].idOrigen, result[x].idConcentrado, result[x].idOperador, result[x].idMotivoRechazo, result[x].idEstatus, result[x].idDispositivo).subscribe(resp => {
                        if (resp.pResponseCode == 1) {
                          // alert('Origen: ' + result[x].idOrigen);
                          // alert('Concentrado: ' + result[x].idConcentrado);
                          // alert('Operador: ' + result[x].idOperador);
                          // alert('Motivo: ' + result[x].idMotivoRechazo);
                          // alert('Estatus: ' + result[x].idEstatus);
                          // alert('Dispositivo: ' + result[x].idDispositivo); 

                          dbService.eliminaViajeSync(result[x].idViajeSync).then(() => {
                            if (result[x].idEstatus == 4) {
                              dbService.eliminaViajeLocal(result[x].idViaje).then(() => {
                                // alert('Eliminado Local');
                              });
                            }

                            dbService.insertaUltimaActualizacion(fechaEnviada).then(() => {
                              console.log('Inserto la fecha ');
                            });

                          }).catch(() => {
                            // alert('Local no eliminado');
                          });
                        }
                        else {

                        }
                      });
                    }
                    else if (result[x].idEstatus == 5 || result[x].idEstatus == 6 || result[x].idEstatus == 7 || result[x].idEstatus == 11 || result[x].idEstatus == 12 || result[x].idEstatus == 13 || result[x].idEstatus == 14 || result[x].idEstatus == 15) {
                      if (result[x].idEstatus == 15) {

                        dbService.getViajeDetalleSync(result[x].idViaje).then(res => {
                          if (res.length > 0) {
                            for (let j = 0; j < res.length; j++) {
                              let detalleDocumento = {
                                pIdOperadorVc: res[j].idOperador,
                                pIdDispositvoVc: res[j].idDispositivo,
                                pIdLocalidadIn: res[j].idLocalidad,
                                pIdDestinoIn: res[j].cliente,
                                pIdConcentradoVc: res[j].idConcentrado,
                                pIdClienteAnteriorIn: res[j].clienteAnterior,
                                pIdConsignatarioIn: res[j].consignatario,
                                pIdDocumentoVc: res[j].idDocumento,
                                pIdEstatusViajeIn: res[j].idEstatus,
                                pEvidenciaFotograficaVc: res[j].evidencia,
                                pFechaEventoDt: res[j].fecha,
                                pGeoLocalizacionEventoVc: res[j].coordenadas
                              }

                              lstDocumento.push(detalleDocumento);
                            }

                            wsSodisa.actualizaViajeEntrega(result[x].idOperador, result[x].idDispositivo, lstDocumento, result[x].evidencia).subscribe(data => {
                              if (data.pResponseCode == 1) {
                                // alert('Operador: ' + result[x].idOperador);
                                // alert('Dispositivo: ' + result[x].idDispositivo);
                                // alert('Estatus: ' + result[x].idEstatus);

                                dbService.eliminaViajeSync(result[x].idViajeSync).then(() => {
                                  if (result[x].idEstatus == 7 || result[x].idEstatus == 14 || result[x].idEstatus == 15) {
                                    dbService.eliminaViajeLocal(result[x].idViaje).then(() => {
                                      dbService.eliminaViajeDetalleSync(result[x].idViaje).then(() => {
                                        dbService.insertaUltimaActualizacion(fechaEnviada).then(() => {
                                          console.log('Inserto la fecha ')

                                        });
                                      })
                                    });
                                  }

                                }).catch(() => {
                                  // alert('Local no eliminado');
                                });
                              }
                              else {

                              }
                            }, (err) => {
                              // alert('Error webapi: ' + err);
                            });
                          }
                        });

                      }
                      else {
                        wsSodisa.actualizaViaje(result[x].idOrigen, result[x].idConcentrado, result[x].idOperador, 0, result[x].idEstatus, result[x].idDispositivo, result[x].fecha, result[x].geolocalizacion, result[x].odometro, result[x].remolque, result[x].evidencia).subscribe(resp => {
                          if (resp.pResponseCode == 1) {
                            // alert('Origen: ' + result[x].idOrigen);
                            // alert('Concentrado: ' + result[x].idConcentrado);
                            // alert('Operador: ' + result[x].idOperador);
                            // alert('Documento: ' + 0);
                            // alert('Estatus: ' + result[x].idEstatus);
                            // alert('Dispositivo: ' + result[x].idDispositivo);
                            // alert('Fecha: ' + result[x].fecha);
                            // alert('Coordenadas: ' + result[x].geolocalizacion);
                            // alert('Kilometraje' + result[x].odometro);
                            // alert('Remolque: ' + result[x].remolque);

                            dbService.eliminaViajeSync(result[x].idViajeSync).then(() => {
                              if (result[x].idEstatus == 7 || result[x].idEstatus == 14 || result[x].idEstatus == 15) {
                                dbService.eliminaViajeLocal(result[x].idViaje).then(() => {
                                  // alert('Eliminado Local');
                                  dbService.insertaUltimaActualizacion(fechaEnviada).then(() => {
                                    console.log('Inserto la fecha ')

                                  });
                                });
                              }

                            }).catch(() => {
                              // alert('Local no eliminado');
                            });
                          }
                          else {
                            // alert('No lo afecto pero hay comunicactión');
                          }
                        });
                      }

                    }
                  }
                }

              });
            })
            .then(() => {
              dbService.paradasIncidentesPorSincronizar().then(result => {

                for (let x = 0; x < result.length; x++) {
                  let fecha = new Date();
                  let mesOriginal = fecha.getMonth() + 1;
                  if (mesOriginal.toString().length == 1) {
                    this.mesFinal = '0' + mesOriginal.toString();
                  }
                  else {
                    this.mesFinal = mesOriginal.toString();
                  }

                  let fechaEnviada = fecha.getFullYear() + '-' + this.mesFinal + '-' + fecha.getDate() + ' ' + fecha.getHours() + ':' + fecha.getMinutes();

                  wsSodisa.RegistraParadaIncidente(result[x].idOperador, result[x].idLocalidad, result[x].idConcentrado, result[x].idTipoEvento, result[x].idEvento, result[x].evidencia, result[x].observacion, result[x].geolocalizacion, result[x].fecha, result[x].idDispositivo).subscribe(data => {
                    if (data.pResponseCode == 1) {
                      dbService.eliminaParadaIncidenteSync(result[x].idParadaIncidenteSync).then(() => {
                        //Elimina parada/incidente local
                        dbService.insertaUltimaActualizacion(fechaEnviada).then(() => {
                          console.log('Inserto la fecha ')

                        });
                      }).catch(() => {
                        // alert('Local no eliminado');
                      });
                    }
                  }, (err) => {
                    alert('Error al sincronizar parada/incidente');
                  });

                }

              });
            });

          internetConnected = true;
        }
        //alert('Sale online Bandera: ' + internetConnected);

      }, false);

      document.addEventListener("offline", function () {
        //alert('Entra OFFLINE Bandera: ' + internetConnected);

        internetConnected = false;

        //alert('Sale OFFLINE Bandera: ' + internetConnected);
      }, false);

    });
  }

}
