import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from "rxjs";
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from '../../environments/environment'
import { map, debounceTime } from 'rxjs/operators';
import 'rxjs/add/operator/debounceTime';
import 'rxjs-compat/add/operator/takeUntil';
import * as _ from "lodash";
import { ToastrService } from 'ngx-toastr';
import { catalogoModel } from '../models/catalogo.model'
import { AuthService } from './auth.service';
import { Parser } from '@angular/compiler/src/ml_parser/parser';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carritoChanged$: any = new BehaviorSubject(true);
  private Carrito$: any = new BehaviorSubject({});
  private cache = new Map();
  public carritoMDL: any = { ClaveArticulo: "", Peso: 0, cantidad: 0 };

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService,
    private auth: AuthService) {
    this.getInicialCarrito();
  }

  getInicialCarrito() {
    combineLatest(this.auth.user(), this.carritoChanged$)
      .subscribe((user: any) => {
        if (!user) return this.Carrito$.next({});
        let carritoRef = JSON.parse(localStorage.getItem(`carrito:${user[0].emailuser}`));
        if (_.has(carritoRef, 'detalle')) {
          try {
            this.Carrito$.next(carritoRef);
          } catch (err) {
            console.error('ERROR CarritoService', err);
          }
        } else {
          this.Carrito$.next({});
        }
      });
  }

  addCarrito(selectCatalogo: any, next = false) {
    const user = this.auth.getCurrentUser();
    let folio = new Date().getTime();
    let fecha = new Date();
    let detalle: any = [];
    let carrito: any = {}
    if (!(Number(selectCatalogo.impuesto) == 0 || Number(selectCatalogo.impuesto) == 16)) {
      this.toastr.warning('Hola: No se reconoce el impuesto del articulo.', 'Aviso de Angular 9', {
        timeOut: 10000,
        positionClass: 'toast-bottom-right'
      });
      return;
    }
    let newDetalle: any = [{
      index: 0,
      idItem: new Date().getTime(),
      userid: user.id,
      folio: 0,
      fecha: fecha,
      artid: selectCatalogo.id,
      grupo: selectCatalogo.grupo,
      claveart: selectCatalogo.claveart,
      articulo: selectCatalogo.articulo,
      urlimagen: selectCatalogo.urlimagen,
      impuesto: Number(selectCatalogo.impuesto),
      cantidad: Number(selectCatalogo.cantidad),
      precio: Number(selectCatalogo.precio),
      importe: 0
    }];
    let newResumen: any = {
      subTotalT0: 0,
      subTotalT16: 0,
      iva16: 0,
      Total: 0
    };
    let IVA: any;
    let carritoRef = JSON.parse(localStorage.getItem(`carrito:${user.emailuser}`));
    if (!carritoRef) {
      _.forEach(newDetalle, (value: any, i: any, array: any) => {
        array[i].index = _.padStart(i + 1, 9, '0');
        array[i].folio = _.padStart(user.id, 9, '0') + folio;
        array[i].importe = array[i].cantidad * array[i].precio;
        if (array[i].impuesto == 0) { newResumen.subTotalT0 += array[i].importe, 2 }
        if (array[i].impuesto == 16) {
          IVA = Number(array[i].impuesto) / 100;
          newResumen.subTotalT16 += (array[i].importe / (1 + IVA));
          newResumen.iva16 = ((newResumen.subTotalT16 * Number(array[i].impuesto)) / 100);
        }
      });
      newResumen.subTotalT0 = _.round(newResumen.subTotalT0, 2);
      newResumen.subTotalT16 = _.round(newResumen.subTotalT16, 2);
      newResumen.iva16 = _.round(newResumen.iva16, 2);
      newResumen.Total = newResumen.subTotalT0 + newResumen.subTotalT16 + newResumen.iva16;
      carrito = {
        resumen: newResumen,
        detalle: newDetalle,
        updated: new Date().getTime(),
        created: new Date().getTime()
      };
      localStorage.setItem(`carrito:${user.emailuser}`, JSON.stringify(carrito));
      if (!next) {
        this.carritoChanged$.next(true);
      }
      return;
    }
    carrito = carritoRef || {};
    detalle = carrito.detalle || [];
    detalle.push(newDetalle[0]);
    _.forEach(detalle, (value: any, i: any, array: any) => {
      array[i].index = _.padStart(i + 1, 9, '0');
      array[i].folio = _.padStart(user.id, 9, '0') + folio;
      array[i].importe = array[i].cantidad * array[i].precio;
      if (array[i].impuesto == 0) { newResumen.subTotalT0 += array[i].importe }
      if (array[i].impuesto == 16) {
        IVA = Number(array[i].impuesto) / 100;
        newResumen.subTotalT16 += (array[i].importe / (1 + IVA));
        newResumen.iva16 = ((newResumen.subTotalT16 * Number(array[i].impuesto)) / 100);
      }
    });
    newResumen.subTotalT0 = _.round(newResumen.subTotalT0, 2);
    newResumen.subTotalT16 = _.round(newResumen.subTotalT16, 2);
    newResumen.iva16 = _.round(newResumen.iva16, 2);
    newResumen.Total = newResumen.subTotalT0 + newResumen.subTotalT16 + newResumen.iva16;
    carrito.detalle = detalle;
    carrito.resumen = newResumen;
    carrito.updated = new Date().getTime();
    localStorage.setItem(`carrito:${user.emailuser}`, JSON.stringify(carrito));
    if (!next) this.carritoChanged$.next(true);
  };

  getCarrito() {
    return this.Carrito$;
  }

  cancelarCarrito() {
    const user = this.auth.getCurrentUser();
    localStorage.removeItem(`carrito:${user.emailuser}`);
    this.carritoChanged$.next(true);
  }

  registrarCompra() {
    try {
      const user = this.auth.getCurrentUser();
      let api_url: any = environment.api_url + '/spproject/regCompra', params: any = {}, headers: any;
      headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'token': localStorage.getItem('jwtToken')
      });
      //
      let carritoRef = JSON.parse(localStorage.getItem(`carrito:${user.emailuser}`));
      return this.http.post(api_url, carritoRef, { headers })
        .pipe(map((data: any) => {
          return data;
        }));
    } catch (e) {
      console.log('error profile: ', e)
    }
  }
};
