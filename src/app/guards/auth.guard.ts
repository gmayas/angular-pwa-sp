import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  canLoad(): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.auth.isAuthenticated().getValue()) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean  {
    if (!this.auth.isAuthenticated().getValue()) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
