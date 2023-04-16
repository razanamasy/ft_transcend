import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { ModuleRef } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy'
import { JwtService } from '@nestjs/jwt';

@Module({
				imports: [UserModule, PassportModule, JwtModule.register({
						secret: process.env.JWT_SECRET,
						signOptions: { expiresIn: '1d'  }
				})],
  providers: [AuthService, LocalStrategy, JwtStrategy,  JwtService],
	exports: [AuthService]
})

export class AuthModule {}
