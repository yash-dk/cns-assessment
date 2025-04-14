export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  name: string;
  registration_key: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  username: string;
}