import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { CarritoService } from 'src/app/services/carrito.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from "lodash";
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, OnDestroy, OnChanges {
  public loading = false;
  public confirm = false;
  public isAuth: boolean = false;
  public alive: boolean = true;
  public user: any;
  public carrito: any = {};
  public Articulos: any = [];
  public Resumen: any = {};
  public Folio: any = '';
  public Fecha: any = new Date()

  constructor(public auth: AuthService,
    public catalogoService: CatalogoService,
    public carritoService: CarritoService,
    private route: ActivatedRoute,
    private router: Router, private toastr: ToastrService,
    private modalService: NgbModal,
    config: NgbModalConfig) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
    this.user = this.auth.user();
  }

  ngOnChanges(changes: SimpleChanges): void {
    throw new Error("Method not implemented.");
  }

  ngOnInit(): void {
    this.getCarrito();
  }

  ngOnDestroy() {
    this.alive = false;
  }

  getCarrito() {
    this.carritoService.getCarrito()
      .subscribe((carritoRef: any) => {
        if (!carritoRef.detalle) {
          this.carrito = {};
          this.Resumen = {
            subTotalT0: 0,
            subTotalT16: 0,
            iva16: 0,
            Total: 0
          };
          this.Articulos = [];
          this.Folio = _.padStart(0, 20, '0');;
          this.Fecha = new Date();
          this.toastr.warning('Hello: Carrito limpio.', 'Aviso de Angular 9', {
            timeOut: 10000,
            positionClass: 'toast-bottom-right'
          });
          return;
        }
        this.carrito = carritoRef;
        this.Articulos = this.carrito.detalle;
        this.Folio = this.Articulos[0].folio;
        this.Fecha = this.Articulos[0].fecha;
        this.Resumen = this.carrito.resumen;
      });
  }

  cancelarCarrito() {
    this.carritoService.cancelarCarrito();
  }

  registrarCompra() {
    this.loading = true;
    this.carritoService.registrarCompra()
      .pipe(first())
      .subscribe(
        data => {
          this.toastr.success('Hola: Compra registrada satisfactoriamente.', 'Aviso de Angular 9', {
            timeOut: 10000,
            positionClass: 'toast-bottom-right'
          });
          this.cancelarCarrito();
          this.loading = false;
          this.confirm = true;
        },
        error => {
          this.toastr.error('Error registrar compra: ' + _.get(error, 'error'), 'Aviso de Angular 9', {
            timeOut: 10000,
            positionClass: 'toast-bottom-right'
          })
          console.log('error Error registrar compra: ', error)
          this.loading = false;
          this.confirm = true;
        });
  };

  open(content: any) {
    this.modalService.open(content, { centered: true });
  }

};
