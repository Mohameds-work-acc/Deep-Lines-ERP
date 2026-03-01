import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../models/Response/AuthDTOs/login-response.dto';

import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.baseUrl;

  private jwtHelper = new JwtHelperService();

  private readonly ACCESS_TOKEN_KEY = 'DeepLines_accessToken';
  private readonly REFRESH_TOKEN_KEY = 'DeepLines_refreshToken';
  private readonly ACCESS_EXPIRES_KEY = 'DeepLines_accessTokenExpire';
  private readonly REFRESH_EXPIRES_KEY = 'DeepLines_refreshTokenExpire';

  constructor(private http: HttpClient) {}

  Login(loginDTO: any): Observable<LoginResponse> {
    console.log(loginDTO);
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/Auth/login`, loginDTO)
      .pipe(
        tap((res) => {
          console.log(res);
          this.storeTokens(res);
        })
      );
  }


  refreshToken(): Observable<LoginResponse> {
    const body = {
      Token: this.getAccessToken(),
      UserId: parseInt(this.getUserId()!, 10),
    };

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/Auth/refresh`, body)
      .pipe(
        tap((res) => {
          this.storeTokens(res);
        })
      );
  }

  storeTokens(res: LoginResponse): void {
    if (!res) {
      return;
    }

    const decodedToken = this.jwtHelper.decodeToken(res.token);
    const expiresIn = decodedToken.exp * 1000 - Date.now();



    localStorage.setItem(this.ACCESS_TOKEN_KEY, res.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken.token);
    localStorage.setItem(this.ACCESS_EXPIRES_KEY,  new Date(Date.now() + expiresIn).toISOString());
    localStorage.setItem(this.REFRESH_EXPIRES_KEY, res.refreshToken.expiryDate);


  }

  getUserId(): string | null {

    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.sub : null;

  }

  getUserRole(): string | null {
    const decodedToken = this.getDecodedToken();
    // The full claim URI for role
    return decodedToken ? decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] : null;
  }
  getUserEmail(): string | null {

    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.email : null;

  }
  getUserFullName(): string | null {

    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.name : null;
  }

  getUserJobTitle(): string | null {

    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken['jopTitle'] : null;
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ACCESS_EXPIRES_KEY);
    localStorage.removeItem(this.REFRESH_EXPIRES_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private getDecodedToken() {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    return token ? this.jwtHelper.decodeToken(token) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }
    const expire = localStorage.getItem(this.ACCESS_EXPIRES_KEY);
    if (!expire) {
      return true;
    }
    const expireTime = new Date(expire).getTime();
    return Date.now() < expireTime;
  }

  logout(): void {
    this.clearTokens();
  }
}
