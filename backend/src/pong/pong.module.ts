import { Controller, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import { UserService } from "../user/service/user.service";
//import { PongService } from "./service/pong.service";
import { PongGateway } from "./pong.gateway";
import { UserModule } from "../user/user.module";
import { UserEntity } from "../user/models/user.entity";
import { PongEntity } from "./models/pong.entity";
import { PongController } from "./controller/pong.controller";
import { PongService } from "./service/pong.service";

import { Jwt2faStrategy } from '../auth/jwt-2fa.strategy'
import { JwtService } from '@nestjs/jwt';

import { SChanEntity } from '../schan/models/schan.entity';
import { SChanService } from '../schan/service/schan.service';
import { SCModule } from '../schan/schan.module';
import { MutedUserEntity } from '../schan/models/muted_user.entity';
import { BannedUserEntity } from '../schan/models/banned_user.entity';
import { SMessageEntity } from "../smessage/models/smessage.entity";

@Module(
    {
        imports: [TypeOrmModule.forFeature([UserEntity, SMessageEntity,PongEntity, SChanEntity, MutedUserEntity, BannedUserEntity]), forwardRef(() =>SCModule), forwardRef(() => UserModule)],
        controllers: [PongController], //Pong controller
        providers: [PongGateway, PongService, UserService, JwtService, Jwt2faStrategy, SChanService], //Pong service, game service et gateway ??? UserService fout la merde ici (du coup dans mon Pong Service c cho si on veux utiliser user service)
        exports: [PongService] //Pong service if needed
    }
)
export class PongModule {}
