import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { ViajeAsignadoPage } from '../pages/viaje-asignado/viaje-asignado';
import { NuevoViajePage } from '../pages/nuevo-viaje/nuevo-viaje';
import { ModalPage } from '../pages/modal/modal';
import { ModalAccidentePage } from '../pages/modal-accidente/modal-accidente';
import { ViajeAceptadoPage } from '../pages/viaje-aceptado/viaje-aceptado';
import { DocumentacionPage } from '../pages/documentacion/documentacion';
import { SincronizacionPage } from '../pages/sincronizacion/sincronizacion';
import { ViajeTerminadoPage } from '../pages/viaje-terminado/viaje-terminado';
import { EvidenciaPage } from '../pages/evidencia/evidencia';
import { ManiobraPage } from '../pages/maniobra/maniobra';
import { ModalParadasPage } from '../pages/modal-paradas/modal-paradas';
import { ModalIncidentePage } from '../pages/modal-incidente/modal-incidente';
import { ConfiguracionPage } from '../pages/configuracion/configuracion';
import { ModalFrecuenciaPage } from '../pages/modal-frecuencia/modal-frecuencia';

import { AgmCoreModule } from 'angular2-google-maps/core';
import { GoogleMapsAPIWrapper } from 'angular2-google-maps/core/services/google-maps-api-wrapper';

import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

import { WebApiProvider } from '../providers/web-api-provider';
import { NetworkProvider } from '../providers/network-provider';
import { LocalDataProvider } from '../providers/local-data-provider';
import { ComunProvider } from '../providers/comun-provider';

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '22facc6c'
  },
  'push': {
    'sender_id': '460409150193',
    'pluginConfig': {
      'android': {
        'iconColor': '#343434'
      }
    }
  }
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    ViajeAsignadoPage,
    NuevoViajePage,
    ModalPage,
    ModalAccidentePage,
    ViajeAceptadoPage,
    DocumentacionPage,
    SincronizacionPage,
    ViajeTerminadoPage,
    EvidenciaPage,
    ManiobraPage,
    ModalParadasPage,
    ModalIncidentePage,
    ConfiguracionPage,
    ModalFrecuenciaPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    CloudModule.forRoot(cloudSettings),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAI77psI4o9uLihSJSDF5cm4-eZUxG6-Ng',
      libraries: ['places']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    ViajeAsignadoPage,
    NuevoViajePage,
    ModalPage,
    ModalAccidentePage,
    ViajeAceptadoPage,
    DocumentacionPage,
    SincronizacionPage,
    ViajeTerminadoPage,
    EvidenciaPage,
    ManiobraPage,
    ModalParadasPage,
    ModalIncidentePage,
    ConfiguracionPage,
    ModalFrecuenciaPage
  ],
  providers: [{ provide: ErrorHandler, useClass: IonicErrorHandler },
    GoogleMapsAPIWrapper, WebApiProvider, NetworkProvider, LocalDataProvider, ComunProvider]
})
export class AppModule { }
