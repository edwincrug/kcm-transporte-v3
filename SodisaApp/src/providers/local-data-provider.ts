import { Injectable } from '@angular/core';
import { SQLite } from 'ionic-native';

import 'rxjs';
import 'rxjs/add/operator/map';


@Injectable()
export class LocalDataProvider {
  db: SQLite = null;
  hayViajes: any[] = [];
  sqlQuery: string;

  constructor() {
    this.db = new SQLite();
  }

  openDatabase() {
    return this.db.openDatabase({
      name: 'sodisaV3.db',
      location: 'default' // the location field is required      
    });
  }

  createTableUsuario() {
    let sql = 'CREATE TABLE IF NOT EXISTS Usuario(idUsuario INTEGER PRIMARY KEY AUTOINCREMENT, nombreCompleto TEXT, imei TEXT, userName TEXT, password TEXT, estatus INTEGER, tracto TEXT); ';
    return this.db.executeSql(sql, []);
  }

  createTableViaje() {
    let sql = 'CREATE TABLE IF NOT EXISTS Viaje(idViaje INTEGER PRIMARY KEY AUTOINCREMENT, idOrigen INTEGER, origenNombre TEXT, idConcentrado TEXT, tipoViaje INTEGER, economico TEXT, odometro INTEGER, idEstatus INTEGER, idUsuario INTEGER, idRechazo INTEGER, geolocalizacion TEXT, destino TEXT, horasDistancia INTEGER, kilometrosDistancia INTEGER, idMovimiento INTEGER); ';
    return this.db.executeSql(sql, []);
  }

  createTableViajeDetalle() {
    let sql = 'CREATE TABLE IF NOT EXISTS ViajeDetalle(idViajeDetalle INTEGER PRIMARY KEY AUTOINCREMENT, idViaje INTEGER, idDestino TEXT, destinoNombre TEXT, idEstatus INTEGER, idDocumento TEXT, fechaDocumento TEXT, geolocalizacion TEXT); ';
    return this.db.executeSql(sql, []);
  }

  createTableViajeSync() {
    let sql = 'CREATE TABLE IF NOT EXISTS ViajeSync(idViajeSync INTEGER PRIMARY KEY AUTOINCREMENT, idViaje INTEGER, idOrigen INTEGER, idConcentrado TEXT, idOperador TEXT,  idMotivoRechazo INTEGER,  odometro INTEGER, idEstatus INTEGER, idDispositivo TEXT, geolocalizacion TEXT, idDocumento TEXT, fecha TEXT, remolque TEXT, evidencia TEXT); ';
    return this.db.executeSql(sql, []);
  }

  createTableViajeDetalleSync() {
    let sql = 'CREATE TABLE IF NOT EXISTS ViajeDetalleSync(idViajeDetalleSync INTEGER PRIMARY KEY AUTOINCREMENT, idViaje INTEGER, idOperador TEXT, idDispositivo TEXT, idLocalidad INTEGER, cliente TEXT, idConcentrado TEXT, clienteAnterior TEXT, consignatario INTEGER, idDocumento TEXT, idEstatus INTEGER, evidencia TEXT, fecha TEXT, coordenadas TEXT); ';
    return this.db.executeSql(sql, []);
  }

  createTableParadaIncidenteSync() {
    let sql = 'CREATE TABLE IF NOT EXISTS ParadaIncidenteSync(idParadaIncidenteSync INTEGER PRIMARY KEY AUTOINCREMENT, idOperador TEXT, idLocalidad INTEGER, idConcentrado TEXT, idTipoEvento INTEGER, idEvento INTEGER, evidencia TEXT, observacion TEXT, geolocalizacion TEXT, fecha TEXT, idDispositivo TEXT); ';
    return this.db.executeSql(sql, []);
  }

  createTableUltimaActualizacion() {
    let sql = 'CREATE TABLE IF NOT EXISTS UltimaActualizacion(idUltimaActualizacion INTEGER PRIMARY KEY AUTOINCREMENT, fecha TEXT); ';
    return this.db.executeSql(sql, []);
  }

  createTableParada() {
    let sql = 'CREATE TABLE IF NOT EXISTS Parada(idParada INTEGER PRIMARY KEY AUTOINCREMENT, idEvento INTEGER, descripcion TEXT, ultimaActualizacion TEXT); ';
    return this.db.executeSql(sql, []).then(() => {
      let sql = 'SELECT * FROM Parada ';
      return this.db.executeSql(sql, [])
        .then(response => {
          if (response.rows.length == 0) {
            let sqlQuery = 'INSERT INTO Parada (idEvento, descripcion, ultimaActualizacion) VALUES (1, "Carga de combustible", ""); ';
            this.db.executeSql(sqlQuery, []);

            sqlQuery = 'INSERT INTO Parada (idEvento, descripcion, ultimaActualizacion) VALUES (2, "Manifestación", ""); ';
            this.db.executeSql(sqlQuery, []);

            sqlQuery = 'INSERT INTO Parada (idEvento, descripcion, ultimaActualizacion) VALUES (3, "Mal clima", ""); ';
            this.db.executeSql(sqlQuery, []);

            sqlQuery = 'INSERT INTO Parada (idEvento, descripcion, ultimaActualizacion) VALUES (4, "Comida", ""); ';
            this.db.executeSql(sqlQuery, []);

            sqlQuery = 'INSERT INTO Parada (idEvento, descripcion, ultimaActualizacion) VALUES (5, "Descanso", ""); ';
            this.db.executeSql(sqlQuery, []);

            sqlQuery = 'INSERT INTO Parada (idEvento, descripcion, ultimaActualizacion) VALUES (6, "Otro", ""); ';
            return this.db.executeSql(sqlQuery, []);
          }

        });

    });
  }

  createTableIncidente() {
    let sql = 'CREATE TABLE IF NOT EXISTS Incidente(idIncidente INTEGER PRIMARY KEY AUTOINCREMENT, idEvento INTEGER, descripcion TEXT, ultimaActualizacion TEXT); ';
    return this.db.executeSql(sql, []).then(() => {
      let sql = 'SELECT * FROM Incidente ';
      return this.db.executeSql(sql, [])
        .then(response => {
          if (response.rows.length == 0) {
            let sqlQuery = 'INSERT INTO Incidente (idEvento, descripcion, ultimaActualizacion) VALUES (1, "Bloqueo de tarjeta Iave", ""); ';
            this.db.executeSql(sqlQuery, []);

            sqlQuery = 'INSERT INTO Incidente (idEvento, descripcion, ultimaActualizacion) VALUES (2, "Desvio de ruta", ""); ';
            this.db.executeSql(sqlQuery, []);

            sqlQuery = 'INSERT INTO Incidente (idEvento, descripcion, ultimaActualizacion) VALUES (3, "Falla mecánica", ""); ';
            this.db.executeSql(sqlQuery, []);

            sqlQuery = 'INSERT INTO Incidente (idEvento, descripcion, ultimaActualizacion) VALUES (4, "Intento de robo", ""); ';
            this.db.executeSql(sqlQuery, []);

            sqlQuery = 'INSERT INTO Incidente (idEvento, descripcion, ultimaActualizacion) VALUES (5, "Siniestro Unidad", ""); ';
            this.db.executeSql(sqlQuery, []);

            sqlQuery = 'INSERT INTO Incidente (idEvento, descripcion, ultimaActualizacion) VALUES (6, "Otro", ""); ';
            return this.db.executeSql(sqlQuery, []);
          }

        });
    });
  }

  createTableFrecuenciaGPS() {
    let sql = 'CREATE TABLE IF NOT EXISTS FrecuenciaGPS(idFrecuencia INTEGER PRIMARY KEY AUTOINCREMENT, tiempo INTEGER); ';
    return this.db.executeSql(sql, []).then(() => {
      let sqlQuery = 'INSERT INTO FrecuenciaGPS (tiempo) VALUES (900000)';
      return this.db.executeSql(sqlQuery, []);
    });
  }

  getAll() {
    let sql = 'SELECT * FROM Usuario';
    return this.db.executeSql(sql, [])
      .then(response => {
        let tasks = [];
        for (let index = 0; index < response.rows.length; index++) {
          tasks.push(response.rows.item(index));
        }
        return Promise.resolve(tasks);
      })
  }

  create(task: any) {
    let sql = 'INSERT INTO tasks(title, completed) VALUES(?,?)';
    return this.db.executeSql(sql, [task.title, task.completed]);
  }

  checkUsuario(usuario, pwd, imei) {
    let sql = 'SELECT * FROM Usuario WHERE userName = ? AND password = ?';
    return this.db.executeSql(sql, [usuario, pwd])
      .then(response => {
        //alert('Cantidad de registros: ' + response.rows.length);
        if (response.rows.length > 0) {
          return Promise.resolve(response.rows.item(0));
        }
        else {
          return Promise.resolve('KO');
        }
      }).catch(error => {
        return Promise.resolve('ERROR');
      });
  }

  checkViajesAsignados() {
    let sql = 'SELECT * FROM Viaje WHERE Viaje.idEstatus IN (3, 5, 6, 9, 11, 12, 13)';
    return this.db.executeSql(sql, [])
      .then(response => {
        let hayViajes = [];
        for (let index = 0; index < response.rows.length; index++) {
          hayViajes.push(response.rows.item(index));
        }
        return Promise.resolve(hayViajes);
      });
  }

  insertaViajesAsignados(travels) {
    for (let x = 0; x < travels.length; x++) {
      let evitaDuplicadosQuery = "SELECT COUNT(*) AS Existe FROM Viaje WHERE idOrigen = ? AND idConcentrado = ?";
      this.db.executeSql(evitaDuplicadosQuery, [travels[x].pIdOrigen, travels[x].pIdConcentradoVc]).then(respuesta => {
        let existe = respuesta.rows.item(0).Existe;
        if (existe == 0) {
          this.sqlQuery = "INSERT INTO Viaje (idOrigen, origenNombre, idConcentrado, tipoViaje, economico, odometro, idEstatus, idUsuario, idRechazo, geolocalizacion, horasDistancia, kilometrosDistancia, idMovimiento) VALUES (" +
            travels[x].pIdOrigen + ", '" +
            travels[x].pOrigenNombre + "', '" +
            travels[x].pIdConcentradoVc + "', " +
            travels[x].pIdTipoViaje + ", '" +
            travels[x].pNumeroEconomicoRemolque + "', " +
            travels[x].pOdometro + ", " +
            travels[x].pIdEstatus + ", 1, 0, '" +
            travels[x].pGeoLocalizacionOrigen + "', " +
            travels[x].pHorasDistanciaIn + ", " +
            travels[x].pKilometrosDistanciaIn + ", " +
            travels[x].pIdTipoMovimientoIn + ");";

          this.db.executeSql(this.sqlQuery, []);

          //Recupero el identity
          this.sqlQuery = "SELECT MAX(idViaje) As Identificador FROM viaje";
          this.db.executeSql(this.sqlQuery, []).then(rowIdentity => {
            let identity = rowIdentity.rows.item(0).Identificador;

            for (let y = 0; y < travels[x].pViajeMovilDetalle.length; y++) {

              let date = new Date(parseInt(travels[x].pViajeMovilDetalle[y].pFechaDocumentoDt.substr(6)));
              let dia: string = date.getDate().toString();
              if (dia.length == 1) {
                dia = '0' + date.getDate();
              }

              let fechaDoc = dia + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();

              this.sqlQuery = "INSERT INTO ViajeDetalle(idViaje, idDestino, destinoNombre, idEstatus, idDocumento, fechaDocumento, geolocalizacion) VALUES (" +
                identity + ", '" +
                travels[x].pViajeMovilDetalle[y].pIdDestino + "', '" +
                travels[x].pViajeMovilDetalle[y].pDestinoNombre + "', " +
                travels[x].pViajeMovilDetalle[y].pIdEstatus + ", '" +
                travels[x].pViajeMovilDetalle[y].pIdDocumentoVc + "', '" +
                fechaDoc + "', '" +
                travels[x].pViajeMovilDetalle[y].pGeoLocalizacionDestino + "'); ";

              this.db.executeSql(this.sqlQuery, []);
            }

            //Recupero los distintos destinos
            let idDestinos: any[] = [];
            let destinos: string = "";

            this.sqlQuery = "SELECT idDestino, destinoNombre FROM ViajeDetalle WHERE idViaje = ? ";
            this.db.executeSql(this.sqlQuery, [identity]).then(res => {
              if (res.rows.length > 0) {
                for (let y = 0; y < res.rows.length; y++) {
                  if (y == 0) {
                    idDestinos.push(res.rows.item(y).idDestino);
                    destinos += res.rows.item(y).idDestino + "-" + res.rows.item(y).destinoNombre + ", ";
                  }
                  else {
                    let encontrado = idDestinos.indexOf(res.rows.item(y).idDestino);
                    if (encontrado == -1) {
                      idDestinos.push(res.rows.item(y).idDestino);
                      destinos += res.rows.item(y).idDestino + "-" + res.rows.item(y).destinoNombre + ", ";
                    }
                  }
                }

                destinos = destinos.substring(0, destinos.length - 2);

                let sqlUpdate = "UPDATE Viaje SET destino = '" + destinos + "' WHERE idViaje = ? ";
                this.db.executeSql(sqlUpdate, [identity]);
              }
            });

          });
        }
      });
    }
    return Promise.resolve('OK');
  }

  actualizaViajeLocal(idEstatus, idRechazo, idViaje, km, noRemolque) {
    let sql = "UPDATE Viaje SET idEstatus = " + idEstatus + ", idRechazo = " + idRechazo + ", odometro = " + km + ", economico = '" + noRemolque + "' WHERE idViaje = ?";
    return this.db.executeSql(sql, [idViaje]);
  }

  insertaUsuario(userName, password, noTracto, nombreCompleto, imei) {
    let usuarioQuery = "SELECT COUNT(*) AS Existe FROM Usuario WHERE userName = ? AND password = ? AND imei = ?";
    return this.db.executeSql(usuarioQuery, [userName, password, imei]).then(respuesta => {
      let existe = respuesta.rows.item(0).Existe;
      if (existe == 0) {
        usuarioQuery = "INSERT INTO Usuario (nombreCompleto, imei, userName, password, estatus, tracto) VALUES ('" +
          nombreCompleto + "', '" +
          imei + "', '" +
          userName + "', '" +
          password + "', 1, '" +
          noTracto + "'); ";

        this.db.executeSql(usuarioQuery, []).then(res => {
          usuarioQuery = "SELECT * FROM Usuario";
          this.db.executeSql(usuarioQuery, []).then(resp => {
            //alert('Usuarios Insertados: ' + resp.rows.length);
          });
        });
      }
    });
  }

  eliminaViajeLocal(idViaje) {
    let sql = "DELETE FROM Viaje WHERE idViaje = ?";
    return this.db.executeSql(sql, [idViaje]);
  }

  eliminaViajeSync(idViajeSync) {
    let sql = "DELETE FROM ViajeSync WHERE idViajeSync = ?";
    return this.db.executeSql(sql, [idViajeSync]);
  }

  viajesPorSincronizar() {
    let viajeSyncQuery = "SELECT (CASE ViajeSync.idEstatus WHEN 1 THEN 'Pendiente de Asignar' WHEN 2 THEN 'Asignado' WHEN 3 THEN 'Aceptado' WHEN 4 THEN 'Rechazado' WHEN 5 THEN 'Salida' WHEN 6 THEN 'Llegada' WHEN 7 THEN 'Pendiente de asignar maniobra' WHEN 8 THEN 'Maniobra asignada' WHEN 9 THEN 'Maniobra aceptada' WHEN 10 THEN 'Maniobra rechazada' WHEN 11 THEN 'Inicia maniobra' WHEN 12 THEN 'Carga-Descarga' WHEN 13 THEN 'Fin maniobra' WHEN 14 THEN 'Entrega total' WHEN 15 THEN 'Entrega parcial' WHEN 16 THEN 'Cancelado' WHEN 17 THEN 'Terminado' ELSE 'ESTATUS NO ASIGNADO LOCALMENTE' END) AS estatus, * FROM ViajeSync ORDER BY ViajeSync.idViaje, ViajeSync.idEstatus ASC ";
    return this.db.executeSql(viajeSyncQuery, []).then(response => {
      let hayViajes = [];
      for (let index = 0; index < response.rows.length; index++) {
        hayViajes.push(response.rows.item(index));
      }
      return Promise.resolve(hayViajes);
    });
  }

  insertaAceptaRechazaViajeSync(idViaje, idOrigen, idConcentrado, idOperador, idMotivoRechazo, idEstatus, idDispositivo) {
    let viajeQuery = "INSERT INTO ViajeSync (idViaje, idOrigen, idConcentrado, idOperador, idMotivoRechazo, idEstatus, idDispositivo) VALUES (" +
      idViaje + ", " +
      idOrigen + ", '" +
      idConcentrado + "', '" +
      idOperador + "', " +
      idMotivoRechazo + ", " +
      idEstatus + ", '" +
      idDispositivo + "'); ";

    return this.db.executeSql(viajeQuery, []);
  }

  insertaIniciaTerminaViajeSync(idViaje, idOrigen, idConcentrado, idOperador, idMotivoRechazo, idEstatus, idDispositivo, coordenadas, fecha, km, noRemolque, evidencia) {
    let viajeQuery = "INSERT INTO ViajeSync (idViaje, idOrigen, idConcentrado, idOperador, idMotivoRechazo, idEstatus, idDispositivo, geolocalizacion, fecha, odometro, remolque, evidencia) VALUES (" +
      idViaje + ", " +
      idOrigen + ", '" +
      idConcentrado + "', '" +
      idOperador + "', " +
      idMotivoRechazo + ", " +
      idEstatus + ", '" +
      idDispositivo + "', '" +
      coordenadas + "', '" +
      fecha + "', " +
      km + ", '" +
      noRemolque + "', '" +
      evidencia + "'); ";

    return this.db.executeSql(viajeQuery, []);
  }

  ViajeManiobraAsignados() {
    let sql = 'SELECT * FROM Viaje WHERE Viaje.idEstatus IN (2, 8)';
    return this.db.executeSql(sql, [])
      .then(response => {
        let hayViajes = [];
        for (let index = 0; index < response.rows.length; index++) {
          hayViajes.push(response.rows.item(index));
        }
        return Promise.resolve(hayViajes);
      });
  }

  checkDetalleViaje(idViaje) {
    let sql = 'SELECT * FROM ViajeDetalle WHERE ViajeDetalle.idViaje = ?';
    return this.db.executeSql(sql, [idViaje])
      .then(response => {
        let hayViajes = [];
        for (let index = 0; index < response.rows.length; index++) {
          hayViajes.push(response.rows.item(index));
        }
        return Promise.resolve(hayViajes);
      });
  }

  ObtieneUsuario() {
    let sql = 'SELECT * FROM Usuario ';
    return this.db.executeSql(sql, [])
      .then(response => {
        if (response.rows.length > 0) {
          return Promise.resolve(response.rows.item(0));
        }
        else {
          return Promise.resolve('KO');
        }
      }).catch(error => {
        return Promise.resolve('KO');
      });
  }

  EliminaTablaViajeSync() {
    let sql = "DELETE FROM ViajeSync ";
    return this.db.executeSql(sql, []);
  }

  EliminaTablaViajeDetalle() {
    let sql = "DELETE FROM ViajeDetalle ";
    return this.db.executeSql(sql, []);
  }

  EliminaTablaViaje() {
    let sql = "DELETE FROM Viaje ";
    return this.db.executeSql(sql, []);
  }

  EliminaTablaUsuario() {
    let sql = "DELETE FROM Usuario ";
    return this.db.executeSql(sql, []);
  }

  insertaParadaIncidenteSync(idOperador, idLocalidad, idConcentrado, idTipoEvento, idEvento, evidencia, observacion, geolocalizacion, fecha, idDispositivo) {
    let viajeQuery = "INSERT INTO ParadaIncidenteSync (idOperador, idLocalidad, idConcentrado, idTipoEvento, idEvento, evidencia, observacion, geolocalizacion, fecha, idDispositivo) VALUES ('" +
      idOperador + "', " +
      idLocalidad + ", '" +
      idConcentrado + "', " +
      idTipoEvento + ", " +
      idEvento + ", '" +
      evidencia + "', '" +
      observacion + "', '" +
      geolocalizacion + "', '" +
      fecha + "', '" +
      idDispositivo + "'); ";

    return this.db.executeSql(viajeQuery, []);
  }

  paradasIncidentesPorSincronizar() {
    let paradaIncidenteSyncQuery = "SELECT (CASE idTipoEvento WHEN 1 THEN 'Parada' WHEN 2 THEN 'Incidente' ELSE 'Tipo de evento sin declarar' END) AS tipoEvidencia, '' AS mensajeEvidencia, * FROM ParadaIncidenteSync";
    return this.db.executeSql(paradaIncidenteSyncQuery, []).then(response => {
      let hayViajes = [];
      for (let index = 0; index < response.rows.length; index++) {
        hayViajes.push(response.rows.item(index));
      }
      return Promise.resolve(hayViajes);
    });
  }

  eliminaParadaIncidenteSync(idParadaIncidenteSync) {
    let sql = "DELETE FROM ParadaIncidenteSync WHERE idParadaIncidenteSync = ?";
    return this.db.executeSql(sql, [idParadaIncidenteSync]);
  }

  insertaViajeDetalleSync(idViaje, idOperador, idDispositivo, idLocalidad, cliente, idConcentrado, clienteAnterior, consignatario, idDocumento, idEstatus, evidencia, fecha, coordenadas) {
    let viajeQuery = "INSERT INTO ViajeDetalleSync (idViaje, idOperador, idDispositivo, idLocalidad, cliente, idConcentrado, clienteAnterior, consignatario, idDocumento, idEstatus, evidencia, fecha, coordenadas) VALUES (" +
      idViaje + ", '" +
      idOperador + "', '" +
      idDispositivo + "', " +
      idLocalidad + ", '" +
      cliente + "', '" +
      idConcentrado + "', '" +
      clienteAnterior + "', " +
      consignatario + ", '" +
      idDocumento + "', " +
      idEstatus + ", '" +
      evidencia + "', '" +
      fecha + "', '" +
      coordenadas + "'); ";

    return this.db.executeSql(viajeQuery, []);
  }

  getUltimaActualizacion() {
    let sql = 'SELECT * FROM UltimaActualizacion ORDER BY idUltimaActualizacion DESC';
    return this.db.executeSql(sql, [])
      .then(response => {
        if (response.rows.length > 0) {
          return Promise.resolve(response.rows.item(0));
        }
      }).catch(error => {
        return Promise.resolve('ERROR');
      });
  }

  insertaUltimaActualizacion(fecha) {
    let viajeQuery = "INSERT INTO UltimaActualizacion (fecha) VALUES ('" + fecha + "'); ";
    return this.db.executeSql(viajeQuery, []);
  }

  getViajeDetalleSync(idViaje) {
    let sql = 'SELECT * FROM ViajeDetalleSync WHERE ViajeDetalleSync.idViaje = ?';
    return this.db.executeSql(sql, [idViaje])
      .then(response => {
        let hayViajes = [];
        for (let index = 0; index < response.rows.length; index++) {
          hayViajes.push(response.rows.item(index));
        }
        return Promise.resolve(hayViajes);
      });
  }

  eliminaTablaViajeDetalleSync() {
    let sql = "DELETE FROM ViajeDetalleSync ";
    return this.db.executeSql(sql, []);
  }

  eliminaViajeDetalleSync(idViajeDetalleSync) {
    let sql = "DELETE FROM ViajeDetalleSync WHERE idViajeDetalleSync = ?";
    return this.db.executeSql(sql, [idViajeDetalleSync]);
  }

  viajesPorSincronizarJoin() {
    let viajeSyncQuery = "SELECT (CASE ViajeSync.idEstatus WHEN 1 THEN 'Pendiente de Asignar' WHEN 2 THEN 'Asignado' WHEN 3 THEN 'Aceptado' WHEN 4 THEN 'Rechazado' WHEN 5 THEN 'Salida' WHEN 6 THEN 'Llegada' WHEN 7 THEN 'Pendiente de asignar maniobra' WHEN 8 THEN 'Maniobra asignada' WHEN 9 THEN 'Maniobra aceptada' WHEN 10 THEN 'Maniobra rechazada' WHEN 11 THEN 'Inicia maniobra' WHEN 12 THEN 'Carga-Descarga' WHEN 13 THEN 'Fin maniobra' WHEN 14 THEN 'Entrega' WHEN 15 THEN 'Entrega' WHEN 16 THEN 'Cancelado' WHEN 17 THEN 'Terminado' ELSE 'ESTATUS NO ASIGNADO LOCALMENTE' END) AS estatus, * FROM ViajeSync INNER JOIN Viaje ON ViajeSync.idViaje = Viaje.idViaje ORDER BY ViajeSync.idViaje, ViajeSync.idEstatus ASC ";
    return this.db.executeSql(viajeSyncQuery, []).then(response => {
      let hayViajes = [];
      for (let index = 0; index < response.rows.length; index++) {
        hayViajes.push(response.rows.item(index));
      }
      return Promise.resolve(hayViajes);
    });
  }

  eliminaParadas() {
    let sql = "DELETE FROM Parada ";
    return this.db.executeSql(sql, []);
  }

  eliminaIncidente() {
    let sql = "DELETE FROM Incidente ";
    return this.db.executeSql(sql, []);
  }

  insertaCatalogoParadas(idEvento, descripcion) {
    let viajeQuery = "INSERT INTO Parada (idEvento, descripcion) VALUES (?, ?); ";
    return this.db.executeSql(viajeQuery, [idEvento, descripcion]);
  }

  insertaCatalogoIncidente(idEvento, descripcion) {
    let viajeQuery = "INSERT INTO Incidente (idEvento, descripcion) VALUES (?, ?); ";
    return this.db.executeSql(viajeQuery, [idEvento, descripcion]);
  }

  actualizaFechaCatalogoParada(fecha) {
    let sql = "UPDATE Parada SET ultimaActualizacion = ?";
    return this.db.executeSql(sql, [fecha]);
  }

  actualizaFechaCatalogoIncidente(fecha) {
    let sql = "UPDATE Incidente SET ultimaActualizacion = ?";
    return this.db.executeSql(sql, [fecha]);
  }

  getUltimoUpdateParada() {
    let sql = 'SELECT ultimaActualizacion FROM Parada LIMIT 1 ';
    return this.db.executeSql(sql, [])
      .then(response => {
        if (response.rows.length > 0) {
          return Promise.resolve(response.rows.item(0));
        }
      }).catch(error => {
        return Promise.resolve('ERROR');
      });
  }

  getUltimoUpdateIncidente() {
    let sql = 'SELECT ultimaActualizacion FROM Incidente LIMIT 1 ';
    return this.db.executeSql(sql, [])
      .then(response => {
        if (response.rows.length > 0) {
          return Promise.resolve(response.rows.item(0));
        }
      }).catch(error => {
        return Promise.resolve('ERROR');
      });
  }

  getParadas() {
    let sql = 'SELECT idEvento, descripcion FROM Parada ';
    return this.db.executeSql(sql, [])
      .then(response => {

        if (response.rows.length > 0) {
          let lstParadas = [];
          for (let index = 0; index < response.rows.length; index++) {
            lstParadas.push(response.rows.item(index));
          }
          return Promise.resolve(lstParadas);
        }

      }).catch(error => {
        return Promise.resolve('ERROR');
      });
  }

  getIncidentes() {
    let sql = 'SELECT idEvento, descripcion FROM Incidente ';
    return this.db.executeSql(sql, [])
      .then(response => {
        if (response.rows.length > 0) {
          let lstIncidentes = [];
          for (let index = 0; index < response.rows.length; index++) {
            lstIncidentes.push(response.rows.item(index));
          }
          return Promise.resolve(lstIncidentes);
        }
      }).catch(error => {
        return Promise.resolve('ERROR');
      });
  }

  getDescripcionParada(idEvento) {
    let sql = 'SELECT descripcion FROM Parada WHERE idEvento = ? ';
    return this.db.executeSql(sql, [idEvento])
      .then(response => {

        if (response.rows.length > 0) {
          return Promise.resolve(response.rows.item(0));
        }
        else {
          return Promise.resolve('Descripción no encontrada');
        }

      }).catch(error => {
        return Promise.resolve('ERROR');
      });
  }

  getDescripcionIncidente(idEvento) {
    let sql = 'SELECT descripcion FROM Incidente WHERE idEvento = ? ';
    return this.db.executeSql(sql, [idEvento])
      .then(response => {

        if (response.rows.length > 0) {
          return Promise.resolve(response.rows.item(0));
        }
        else {
          return Promise.resolve('Descripción no encontrada');
        }

      }).catch(error => {
        return Promise.resolve('ERROR');
      });
  }

  getFrecuenciaNotificacion() {
    let sql = 'SELECT tiempo FROM FrecuenciaGPS LIMIT 1 ';
    return this.db.executeSql(sql, [])
      .then(response => {
        if (response.rows.length > 0) {
          return Promise.resolve(response.rows.item(0));
        }
      }).catch(error => {
        return Promise.resolve('ERROR');
      });
  }

  actualizaFrecuenciaNotificacion(tiempo) {
    let sql = "UPDATE FrecuenciaGPS SET tiempo = ?";
    return this.db.executeSql(sql, [tiempo]);
  }

}
