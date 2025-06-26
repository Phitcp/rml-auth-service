import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Query,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '@auth/service/auth.service';
import {
  GetUserTokenQueryDto,
  LoginRequestDto,
  RegisterRequestDto,
  RotateTokenRequestDto,
} from '@auth/dto/request.dto';
import {
  LoginResponseDto,
  RegisterResponseDto,
  RotateTokenResponseDto,
} from '@auth/dto/response.dto';
import { AppContext, Context } from '@shared/decorator/context.decorator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RefreshTokenService } from '@auth/service/refresh-token.service';
import { JwtGuard } from '@shared/guard/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @ApiOperation({ summary: 'Register app user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create user successfully',
    type: RegisterResponseDto,
  })
  @ApiBody({
    description: 'User register info',
    type: RegisterRequestDto,
    required: true,
  })
  @Post('/register')
  async register(
    @Body() registerDto: RegisterRequestDto,
    @Context() context: AppContext,
  ) {
    return await this.authService.registerUser(context, registerDto);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User login successfully',
    type: LoginResponseDto,
  })
  @ApiBody({
    type: LoginResponseDto,
    required: true,
  })
  @Post('/login')
  async login(
    @Body() loginDto: LoginRequestDto,
    @Context() context: AppContext,
  ) {
    return await this.authService.login(context, loginDto);
  }

  @ApiOperation({ summary: 'Rotate refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Rotate token for user successfully',
    type: RotateTokenResponseDto,
  })
  @ApiBody({
    type: RotateTokenRequestDto,
    required: true,
  })
  @Post('/rotate-token')
  async rotateToken(
    @Body() rotateToken: RotateTokenRequestDto,
    @Context() context: AppContext,
  ) {
    return await this.refreshTokenService.rotateToken(context, rotateToken);
  }

  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get user token list' })
  @Get('/token')
  async getUserToken(
    @Query() query: GetUserTokenQueryDto,
    @Context() context: AppContext,
  ) {
    return await this.refreshTokenService.getTokenForUser(context, query);
  }
}
