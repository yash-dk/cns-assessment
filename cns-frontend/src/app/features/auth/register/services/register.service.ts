import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { UserCreate, UserResponse } from '../../../../core/auth/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  constructor(private authService: AuthService) {}

  register(username: string, email: string, password: string, name: string, registrationKey: string): Observable<UserResponse> {
    const userCreate: UserCreate = {
      username,
      email,
      password,
      name,
      registration_key: registrationKey
    };
    
    return this.authService.register(userCreate);
  }
}