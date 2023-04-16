import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity} from './models/user.entity';
import { TwoFactorAuthenticationService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/jwt.strategy'
import { Jwt2faStrategy } from '../auth/jwt-2fa.strategy'
import { JwtService } from '@nestjs/jwt';
import { SChanEntity } from '../schan/models/schan.entity';
import { SChanService } from '../schan/service/schan.service';
import { SCModule } from '../schan/schan.module';
import { MutedUserEntity } from '../schan/models/muted_user.entity';
import { BannedUserEntity } from '../schan/models/banned_user.entity';
import { PongEntity } from '../pong/models/pong.entity';
import { PongModule } from '../pong/pong.module'
import { SMessageEntity } from '../smessage/models/smessage.entity';


@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, SMessageEntity,SChanEntity,MutedUserEntity, BannedUserEntity]), forwardRef(() => SCModule)],
	controllers: [UserController],
	providers: [UserService, TwoFactorAuthenticationService, SChanService, JwtService, Jwt2faStrategy],
	exports: [UserService]

})
export class UserModule {}
