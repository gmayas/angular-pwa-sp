import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { CarritoService } from 'src/app/services/carrito.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from "lodash";

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, OnDestroy, OnChanges {

  public isAuth: boolean = false;
  public alive: boolean = true;
  public user: any;
  public carrito: any = {};
  public articulos: any = [];

  constructor(public auth: AuthService,
    public catalogoService: CatalogoService,
    public carritoService: CarritoService,
    private route: ActivatedRoute,
    private router: Router, private toastr: ToastrService) {
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

  getCarrito(){
    this.carritoService.getCarrito()
      .subscribe( (carritoRef: { detalle: any; }) => {
        if (!carritoRef.detalle) { this.carrito = {};   this.articulos = []; return}
        this.carrito = carritoRef;
        console.log('this.carrito: ', this.carrito);
        let detalle = carritoRef.detalle;
        this.articulos = [];
        _.forEach(detalle, (value: any, index: any) => {
            this.articulos.push(detalle[index].producto);
        });
        console.log('this.articulos: ', this.articulos);
      });
  }
}
