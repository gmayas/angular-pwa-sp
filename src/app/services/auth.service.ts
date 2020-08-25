import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from '../../environments/environment'
import { BehaviorSubject, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import 'rxjs/add/operator/debounceTime';
import 'rxjs-compat/add/operator/takeUntil';
import * as _ from "lodash";
import { ToastrService } from 'ngx-toastr';
//

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser$: BehaviorSubject<any> = new BehaviorSubject(null);
  private authState$: BehaviorSubject<any> = new BehaviorSubject(false);
  private signingOut$: BehaviorSubject<any> = new BehaviorSubject(false);

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) {
    this.currentUser$.next(this.getCurrentUser());
    this.authState$.next(this.isLoggedIn());
    this.signingOut$.next(this.isSigningOut());
  }

  // Regresa el estado de si esta loggeado o no, pero como observer
  public isAuthenticated(): any {
    return this.authState$;
  }

  // Regresa cualquier cambio en el objeto de usuario, como observer
  public user(): any {
    return this.currentUser$;
  }

  // Regresa el usuario actual obtenido del local storage
  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    const jwtToken = localStorage.getItem('jwtToken');
    if (!user || !jwtToken) {
      return false;
    }
    return JSON.parse(user);
  }

  // Regresa si esta o no logeado actualmente a modo de estatico
  isLoggedIn() {
    return !!this.getCurrentUser();
  }

  login(emailuser: any, passworduser: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    //console.log('environment.api_url: ', environment.api_url)
    //console.log('user: ', emailuser, passworduser);

    return this.http.post(environment.api_url + '/authuser/signin', { emailuser, passworduser })
      .pipe(map((user: any) => {
        //console.log('user Login: ', user);
        if (!user.success) { this.logout(); return Promise.reject(user); }
        localStorage.setItem('jwtToken', user.token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser$.next(user);
        this.authState$.next(user.success);
        this.signingOut$.next(!user.success);
        return user;
      }, (error: any) => {
        this.logout();
        //console.log('error profile: ', error)
      }));
  }

  register(dataIn: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    //console.log('dataIn: ', dataIn);
    const dataUser = {
      emailuser: _.get(dataIn, 'emailuser'),
      nameuser: _.get(dataIn, 'nameuser'),
      passworduser: _.get(dataIn, 'password'),
      typeiduser: _.get(dataIn, 'typeiduser')
    }
    //console.log('environment.api_url: ', environment.api_url)
    //console.log('dataUser: ', dataUser);
    return this.http.post(environment.api_url + '/authuser/signup', dataUser)
      .pipe(map((user: any) => {
        //console.log('user Register: ', user);
        if (!user.success) { this.logout(); return Promise.reject(user) };
        localStorage.setItem('jwtToken', user.token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser$.next(user);
        this.authState$.next(user.success);
        this.signingOut$.next(!user.success);
        return user;
      }, (error: any) => {
        this.logout();
        //console.log('error profile: ', error)
      }));
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    localStorage.removeItem('jwtToken');
    this.currentUser$.next(null);
    this.authState$.next(false);
    this.signingOut$.next(true);
    //this.router.navigate(['home']);
  }

  isSigningOut() {
    return this.signingOut$;
  }

  profile() {
    try {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'token': localStorage.getItem('jwtToken')
        })
      };
      //console.log('httpOptions: ', httpOptions)
      return this.http.get(environment.api_url + '/authuser/profile', httpOptions)
        .pipe(first())
        .subscribe((user: any) => {
          //console.log('user: ', user)
          this.toastr.success('Hello: Welcome ' + _.get(user.data[0], 'nameuser'), 'Aviso de Angular 9', {
            timeOut: 10000,
            positionClass: 'toast-bottom-right'
          });
          //this.router.navigate(['admin']);
          return user;
        }, error => {
          this.logout();
          //this.router.navigate(['home']);
          this.toastr.success('Hello: Welcome, register or log in.', 'Aviso de Angular 9', {
            timeOut: 10000,
            positionClass: 'toast-bottom-right'
          });
          //console.log('error profile: ', error)
        });
    } catch (e) {
      console.log('error profile: ', e)
    }
  }
}
