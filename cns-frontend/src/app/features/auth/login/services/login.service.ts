import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { LoginRequest, User } from '../../../../core/auth/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private authService: AuthService) { }

  login(username: string, password: string): Observable<User> {
    // Hash password in final version
    // For demo purposes we're using plaintext
    const loginRequest: LoginRequest = {
      username,
      password
    };

    return this.authService.login(loginRequest);
  }
}