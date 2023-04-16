import { Module, Global } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { UserService }  from "../user/service/user.service"
import { UserEntity }  from "../user/models/user.entity"
import { UserModule }  from "../user/user.module"
import { TypeOrmModule } from "@nestjs/typeorm";
import { forwardRef } from "@nestjs/common";
import { PongEntity } from '../pong/models/pong.entity';
import { PongModule } from '../pong/pong.module'
import { SChanEntity } from '../schan/models/schan.entity';
import { SCModule } from '../schan/schan.module';

@Global()
@Module({

  imports: [TypeOrmModule.forFeature([UserEntity, PongEntity, SChanEntity]),  SCModule, PongModule, UserModule],
  providers: [MessageService, MessageGateway, UserService]
})
export class MessageModule {}
