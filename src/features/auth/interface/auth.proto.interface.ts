/* eslint-disable */
import { Observable } from "rxjs";

export const protobufPackage = "auth";

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface RegisterResponse {
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  email: string;
  sessionId: string;
  role: string;
}

export interface RotateTokenRequest {
  userId: string;
  refreshToken: string;
  sessionId: string;
}

export interface RotateTokenResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface GetUserTokenQuery {
  userId: string;
}

export interface GetUserTokensResponse {
  tokens: string[];
}

export const AUTH_PACKAGE_NAME = "auth";

export interface AuthServiceClient {
  register(request: RegisterRequest): Observable<RegisterResponse>;

  login(request: LoginRequest): Observable<LoginResponse>;

  rotateToken(request: RotateTokenRequest): Observable<RotateTokenResponse>;

  getUserTokens(request: GetUserTokenQuery): Observable<GetUserTokensResponse>;
}


export const AUTH_SERVICE_NAME = "AuthService";
