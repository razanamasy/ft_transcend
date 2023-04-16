import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { SMessageEntity } from '../models/smessage.entity'
import { Repository} from 'typeorm'
import { Message } from '../models/smessage.interface';

@Injectable()
export class SMessageService {

	constructor(
		@InjectRepository(SMessageEntity)
		private SMRepository: Repository<SMessageEntity>
	)
	{}

	async add(sm: Message): Promise<SMessageEntity> {
		return (this.SMRepository.save(sm));
	}

	async findAll(): Promise<SMessageEntity[]>
	{
		return (this.SMRepository.find());
	}

	async findChan(chan : string): Promise<SMessageEntity[]>
	{
		return(this.SMRepository.findBy({label: chan}));
	}

	
}
