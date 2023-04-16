import { Controller, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import { SCController } from "./controller/schan.controller";
import { SChanEntity } from "./models/schan.entity";
import { SChanService } from "./service/schan.service";
import { UserService } from "../user/service/user.service";
import { UserModule } from "../user/user.module";
import { UserEntity } from "../user/models/user.entity";
import { MutedUserEntity } from "./models/muted_user.entity";
import { BannedUserEntity } from "./models/banned_user.entity";
import { PongEntity } from '../pong/models/pong.entity';
import { SMessageEntity } from "../smessage/models/smessage.entity";

@Module(
    {
        imports: [TypeOrmModule.forFeature([SChanEntity, SMessageEntity,UserEntity, BannedUserEntity, MutedUserEntity, PongEntity]), forwardRef(() => UserModule)],
        controllers: [SCController],
        providers: [SChanService, UserService],
        exports: [SChanService]
    }
)
export class SCModule {}
