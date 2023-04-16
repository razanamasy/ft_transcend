import {Controller } from '@nestjs/common'
import { SMessageService } from '../service/smessage.service'
import { Post, Body, Get } from '@nestjs/common'
import { Message} from '../models/smessage.interface'
import { SMessageEntity } from '../models/smessage.entity'
import { Param } from '@nestjs/common'

@Controller('sm')
export class SMController {
	constructor (private smservice : SMessageService) {}

	@Post()
	async add(@Body() sm: Message) : Promise<SMessageEntity> {
		return this.smservice.add(sm);
	}
	
	@Get()
	async findAll() : Promise<SMessageEntity[]> {
		return this.smservice.findAll()
	}

	@Get(':chan')
	async findChan(@Param('chan') chan: string) : Promise<SMessageEntity[]> {
		return this.smservice.findChan(chan);
	}
}
