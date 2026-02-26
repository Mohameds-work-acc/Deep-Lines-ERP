import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { LoginResponse } from '../models/Response/AuthDTOs/login-response.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.baseUrl;

  private readonly ACCESS_TOKEN_KEY = 'DeepLines_accessToken';
  private readonly REFRESH_TOKEN_KEY = 'DeepLines_refreshToken';
  private readonly ACCESS_EXPIRES_KEY = 'DeepLines_accessTokenExpire';
  private readonly REFRESH_EXPIRES_KEY = 'DeepLines_refreshTokenExpire';
  private readonly USER_ID = 'DeepLines_userId';
  private readonly USER_ROLE = 'DeepLines_userRole';
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
    localStorage.setItem(this.ACCESS_TOKEN_KEY, res.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken.token);
    localStorage.setItem(this.ACCESS_EXPIRES_KEY,  new Date(Date.now() + 60 * 60 * 1000).toISOString());
    localStorage.setItem(this.REFRESH_EXPIRES_KEY, res.refreshToken.expiryDate);
    localStorage.setItem(this.USER_ID, res.user.id.toString());
    localStorage.setItem(this.USER_ROLE, res.user.role);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.USER_ID);
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.USER_ROLE);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ACCESS_EXPIRES_KEY);
    localStorage.removeItem(this.REFRESH_EXPIRES_KEY);
    localStorage.removeItem(this.USER_ID);
    localStorage.removeItem(this.USER_ROLE);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
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
