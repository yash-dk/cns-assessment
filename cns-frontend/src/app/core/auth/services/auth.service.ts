import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User, LoginRequest, LoginResponse, UserCreate, UserResponse } from '../models/auth.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private jwtHelper = new JwtHelperService();
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<User> {
    const body = new URLSearchParams();
    body.set('username', loginRequest.username);
    body.set('password', loginRequest.password);

    const httpOptions = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/api/auth/login`, body.toString(), httpOptions)
      .pipe(
        map(response => {
          const user: User = {
            ...response.user,
            token: response.access_token
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  register(userCreate: UserCreate): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiBaseUrl}/api/auth/register`, userCreate);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    if (!user || !user.token) {
      return false;
    }

    try {
      return !this.jwtHelper.isTokenExpired(user.token);
    } catch {
      return false;
    }
  }
}