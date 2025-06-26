import { HttpException, HttpStatus } from '@nestjs/common';

export class RegisterFailedError extends HttpException {
  constructor(msg = 'Register Failed', code = HttpStatus.BAD_REQUEST) {
    super(msg, code);
  }
}

export class LoginFailedError extends HttpException {
  constructor(msg = 'Login Failed', code = HttpStatus.FORBIDDEN) {
    super(msg, code);
  }
}

export class RefreshTokenError extends HttpException {
  constructor(msg = 'Refresh Failed', code = HttpStatus.NOT_ACCEPTABLE) {
    super(msg, code);
  }
}
