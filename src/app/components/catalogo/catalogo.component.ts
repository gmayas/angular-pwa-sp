import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { takeWhile, first } from "rxjs/operators";
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as _ from "lodash";
import { CatalogoService } from 'src/app/services/catalogo.service';
import { CarritoService } from 'src/app/services/carrito.service';
import { async } from 'rxjs/internal/scheduler/async';
import { error } from 'protractor';
import { catalogoModel } from '../../models/catalogo.model';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit, OnDestroy, OnChanges {
  //
  catalogoForm: FormGroup;
  loading = false;
  submitted = false;
  //
  public isAuth: boolean = false;
  public alive: boolean = true;
  public user: any;
  public Articulos: any
  //
  constructor(public auth: AuthService,
    public catalogoService: CatalogoService,
    public carritoService: CarritoService,
    private formBuilder: FormBuilder, private route: ActivatedRoute,
    private router: Router, private toastr: ToastrService) {
    this.user = this.auth.user();
    //console.log('this.user.id: ', _.get(this.user.value, 'id'))
    this.getCatalogoDesc();
  }

  ngOnInit() {
    this.catalogoForm = this.formBuilder.group({
      id: [null],
      grupo: [''],
      claveart: [''],
      articulo: [''],
      cantidad: [0]
    });
  }

  ngOnDestroy() {
    this.alive = false;
  }

  ngOnChanges() {
    this.user = this.auth.user();
    this.getCatalogoDesc();
  }
  // convenience getter for easy access to form fields
  get f() { return this.catalogoForm.controls; }

  buscar() {
    this.submitted = true;
    this.loading = true;
    //
    //console.log('this.adminForm.invalid: ', this.adminForm.invalid);
    console.log('this.adminForm.value: ', this.catalogoForm.value);
    // stop here if form is invalid
    if (this.catalogoForm.invalid) {
      return;
    }
    //
    this.getCatalogoArt(this.catalogoForm.value);
    //
  }

  onReset() {
    this.submitted = false;
    this.loading = false;
    this.catalogoService.selectCatalogo = new catalogoModel();
    this.catalogoForm.reset();
    //console.log('this.adminForm.value: ', this.adminForm.value);
  }

  addCarrito(art: any) {
    this.catalogoService.selectCatalogo = Object.assign({}, art);
    let cantidad = parseFloat((document.getElementById("cantidad") as HTMLInputElement).value);
    this.catalogoService.selectCatalogo.cantidad = cantidad
    console.log('add selectCatalogo: ', this.catalogoService.selectCatalogo)
    this.carritoService.addCarrito(this.catalogoService.selectCatalogo);
    this.submitted = false;
    this.loading = false;
    this.onReset();
  }

  deleteCatalogo(vh: any) {
    // pendiente
    this.catalogoService.selectCatalogo = Object.assign({}, vh);
    //console.log('Edit selectCatalogo: ', this.catalogoService.selectCatalogo);
  }


  getCatalogoArt(dataInt: any) {
    try {
      this.catalogoService.getCatalogoArt(dataInt)
        .subscribe((data: any) => {
          //console.log('data: ', data);
          this.Articulos = data.data;
          this.toastr.success('Hello: Successful search.', 'Aviso de Angular 9', {
            timeOut: 10000,
            positionClass: 'toast-bottom-right'
          });
          this.submitted = false;
          this.loading = false;
          this.onReset();
        }, error => {
          this.auth.logout();
          this.router.navigate(['home']);
          this.toastr.success('Hello: Your session has expired, just log in again.', 'Aviso de Angular 9', {
            timeOut: 10000,
            positionClass: 'toast-bottom-right'
          });

        });
    } catch (e) {
      console.log('error: ', e);
    }
  }

  getCatalogoDesc() {
    try {
      this.catalogoService.getCatalogoDesc()
        .subscribe((data: any) => {
          //console.log('data: ', data);
          this.Articulos = data.data;
          this.toastr.success('Hello: Successful search..', 'Aviso de Angular 9', {
            timeOut: 10000,
            positionClass: 'toast-bottom-right'
          });
        }, error => {
          this.auth.logout();
          this.router.navigate(['home']);
          this.toastr.success('Hello: Your session has expired, just log in again.', 'Aviso de Angular 9', {
            timeOut: 10000,
            positionClass: 'toast-bottom-right'
          });
        });
    } catch (e) {
      console.log('error: ', e);
    }
  }
}
