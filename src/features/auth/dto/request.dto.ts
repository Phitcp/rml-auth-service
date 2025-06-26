import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

const userNameMinLength = 6;
const passwordMinLength = 6;

export class RegisterRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(userNameMinLength, {
    message: `User name need longer than ${userNameMinLength}`,
  })
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(userNameMinLength, {
    message: `User name password need to be longer than ${passwordMinLength}`,
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class LoginRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(userNameMinLength, {
    message: `User name need longer than ${userNameMinLength}`,
  })
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(userNameMinLength, {
    message: `User name need longer than ${userNameMinLength}`,
  })
  password: string;
}

export class RotateTokenRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty()
  @IsNotEmpty()
  sessionId: string;
}

export class LogOutRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  sessionId: string;
}

export class GetUserTokenQueryDto {
  @ApiProperty()
  @IsNotEmpty()
  userId: string;
}
