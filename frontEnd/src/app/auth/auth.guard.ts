import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('AuthGuard: Checking authentication for route', state.url);
    return this.authService.isLoggedIn().pipe(
      map(isLoggedIn => {
        if (!isLoggedIn) {
          console.log('AuthGuard: User not authenticated, redirecting to /not-authorized with returnUrl', state.url);
          this.router.navigate(['/not-authorized'], { queryParams: { returnUrl: state.url } });
          return false;
        }
        console.log('AuthGuard: User authenticated, access granted');
        return true;
      })
    );
  }
}
