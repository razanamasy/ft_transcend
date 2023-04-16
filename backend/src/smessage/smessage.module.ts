import { Controller, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import { SMController } from "./controller/smessage.controller";
import { SMessageEntity } from "./models/smessage.entity";
import { SMessageService } from "./service/smessage.service";
import { UserEntity } from "../user/models/user.entity";
import { SCModule } from "../schan/schan.module";

@Module(
    {
        imports: [TypeOrmModule.forFeature([SMessageEntity, UserEntity]), forwardRef(() => SCModule)],
        controllers: [SMController],
        providers: [SMessageService]
    }
)
export class SMModule {}