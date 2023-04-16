import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { LocalStrategy } from './auth/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy'
import { Jwt2faStrategy } from './auth/jwt-2fa.strategy'
import { JwtRefreshStrategy } from './auth/jwt-refresh.strategy';
import { TwoFactorAuthenticationService,Api42authService } from './auth/auth.service';
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config';
import { JoiPipeModule, JoiSchema, JoiSchemaOptions, CREATE, UPDATE } from 'nestjs-joi';
import { SCModule } from './schan/schan.module';
import { SMModule } from './smessage/smessage.module';
import { MessageModule } from './message/message.module';
import { UserEntity } from './user/models/user.entity'
import {SChanEntity} from './schan/models/schan.entity'
import { MutedUserEntity } from './schan/models/muted_user.entity';
import { BannedUserEntity } from './schan/models/banned_user.entity';
//import { PongEntity } from './pong/models/pong.entity';
import { PongModule } from './pong/pong.module'
import {MessageGateway} from './message/message.gateway'
import {ConnexionGateway} from './connexion.gateway'
import { forwardRef } from "@nestjs/common";
import {MessageService} from './message/message.service'

@Module({
	imports: [
		HttpModule,
		TypeOrmModule.forRoot({
			type: 'postgres',
			url: process.env.DATABASE_URL,
			autoLoadEntities: true,
			synchronize: true,
			entities : [UserEntity, SChanEntity, MutedUserEntity,  BannedUserEntity] 
		}),
		SMModule,
		SCModule,
		MessageModule,
		UserModule,
		PassportModule,
		PongModule,
		JwtModule.register({
			//	secret: process.env.JWT_SECRET
			//	signOptions: { expiresIn: '900s'  }
		}),

	],
	controllers: [AppController],
	providers: [ConnexionGateway, AppService, AuthService, LocalStrategy, JwtStrategy, Jwt2faStrategy, JwtRefreshStrategy, TwoFactorAuthenticationService, Api42authService ],

	// A REMETTRE
//	providers: [MessageService, MessageGateway, AppService, AuthService, LocalStrategy, JwtStrategy, Jwt2faStrategy, JwtRefreshStrategy, TwoFactorAuthenticationService, Api42authService ],
})
export class AppModule {}
