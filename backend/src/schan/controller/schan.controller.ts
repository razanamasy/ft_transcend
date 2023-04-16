import {Controller, UseGuards } from '@nestjs/common'
import { Jwt2faAuthGuard } from '../../auth/jwt-2fa-auth.guard';
import { SChanService } from '../service/schan.service'
import { Post, Body, Get, Put } from '@nestjs/common'
import { SChanEntity } from '../models/schan.entity'
import { Param } from '@nestjs/common'
import { ChanDTO } from '../models/schan.interface'
import { SMessageEntity } from '../../smessage/models/smessage.entity'
import { Message } from '../../message/entities/message.entity'

@Controller('sc')
export class SCController {
	constructor (private scservice : SChanService) {}


	@UseGuards(Jwt2faAuthGuard) 
	@Post('addmsginchan')
	async addinchan(@Body() body)
	{
		await this.scservice.addmsginchan(body.data.name, body.data.text, body.data.label);
		return ({msg: "succed add channel"});
	}
	
	@Get()
	async findAll() : Promise<SChanEntity[]> {
		return this.scservice.findAll()
	}

	@Get(':label')
	async findChan(@Param('label') label: string) : Promise<SChanEntity> {
		return this.scservice.findChan(label);
	}

	@UseGuards(Jwt2faAuthGuard) 
	@Post('loadmessage')
	async loadmessages(@Body() body) : Promise<{name: string, text: string}[]> {

		const messages = await this.scservice.loadmessages(body.data.label, body.data.user);
		const ret = messages.map((o) => ({"name" : o.name, "text" : o.text}))
		return (ret);
	}


	@UseGuards(Jwt2faAuthGuard)
	@Post('addchan')
	async addchan(@Body() body)
	{
		return (await this.scservice.addchan(body.data.owner, body.data.pass, body.data.name, body.data.ispublic, body.data.invitelist))
	}

	@UseGuards(Jwt2faAuthGuard) 
	@Post('findUsers')
	async findUsers(@Body() body)
	{
		const completeList = await this.scservice.findMyUsers(body.data.label);
		const secureList = await Promise.all(completeList.map(async obj => ({"name":obj.name, "nick": obj.nickname, "isbanned": await this.scservice.isBanned(body.data.label, obj.name), "ismuted": await this.scservice.isMuted(body.data.label, obj.name), "isAdmin": await this.scservice.isAdmin(body.data.label, obj.name), "isOwner": await this.scservice.isOwner(body.data.label, obj.name) })))
		return secureList;
	}

	//PPAS UTILISE AU FRONT A FAIRE MARCHER AVEC AXIOSPRIVATE SI BESOIN (WARNING: Format de donnée post)
/*	@Post('addpriv')
 	async addpriv(@Body() body)
 	{
		let ret;
		ret =  await this.scservice.findOne(body.name);

		if (ret)
		{
			return ({msg : 'Private conversation exist'});
		}

	 	await this.scservice.addchan("","", body.name, "privmessage", []);
	 	return ({msg: "succed add channel"});
 	}*/

	 @UseGuards(Jwt2faAuthGuard) 
	@Post("muteUser")
	public async muteuser(@Body() body)
	{
		return (this.scservice.muteUser(body.data.label, body.data.muted))
	}

	@UseGuards(Jwt2faAuthGuard) 
	 @Post('unmuteUser')
	 async unmuteuser(@Body() body)
	 {
		 await this.scservice.unMuteUser(body.data.label, body.data.muted);
		 return ({msg : 'succed on unban'})
	 }


	 @UseGuards(Jwt2faAuthGuard) 
	@Post("banUser")
	public async banuser(@Body() body)
	{
		return (this.scservice.banUser(body.data.label, body.data.banned))
	}

	@UseGuards(Jwt2faAuthGuard) 
	 @Post('unbanUser')
	 async unbanuser(@Body() body)
	 {
		 await this.scservice.unBanUser(body.data.label, body.data.banned);
		 return ({msg : 'succed on unban'})
	 }

	 @UseGuards(Jwt2faAuthGuard) 
	@Post("addAdmin")
	public async addAdmin(@Body() body)
	{
		return (this.scservice.addAdmin(body.data.label, body.data.username))
	}

	@UseGuards(Jwt2faAuthGuard) 
	 @Post('removeAdmin')
	 async removeAdmin(@Body() body)
	 {
		 await this.scservice.removeAdmin(body.data.label, body.data.username);
		 return ({msg : 'succed on add admin'})
	 }

	//PPAS UTILISE AU FRONT A FAIRE MARCHER AVEC AXIOSPRIVATE SI BESOIN (WARNING: Format de donnée post)
	/*@Post("addUser")
	public async addUser(@Body() body)
	{
		return (this.scservice.addAdmin(body.label, body.username))
	}*/


	@UseGuards(Jwt2faAuthGuard) 
	 @Post('deleteUser')
	 async deleteUser(@Body() body)
	 {
		 await this.scservice.deleteUser(body.data.label, body.data.username);
		 return ({msg : 'succed on add admin'})
	 }


	 //PPAS UTILISE AU FRONT A FAIRE MARCHER AVEC AXIOSPRIVATE SI BESOIN (WARNING: Format de donnée post)
	/* @Post('isprotected')
	 async isprotected(@Body() body)
	 {
		 const ret = await this.scservice.isprotected(body.label);
		 return (ret)
	 }*/

	 @UseGuards(Jwt2faAuthGuard) 
	 @Post('checkPassword')
	 async checkPassword(@Body() body)
	 {
		 const ret = await this.scservice.checkPassword(body.data.password, body.data.label);
		 return (ret)
	 }
	
	 //PPAS UTILISE AU FRONT A FAIRE MARCHER AVEC AXIOSPRIVATE SI BESOIN (WARNING: Format de donnée post)
	/* @Post('isAdmin')
	 async isAdmin(@Body() body)
	 {
		 const ret = await this.scservice.isAdmin(body.label, body.username);
		 return (ret)
	 }*/

	 @UseGuards(Jwt2faAuthGuard) 
	 @Post('isOwner')
	 async isOwner(@Body() body)
	 {
		 const ret = await this.scservice.isOwner(body.data.label, body.data.username);
		 return (ret)
	 }

	@UseGuards(Jwt2faAuthGuard)
	 @Post('updatepassword')
	 async updatepassword(@Body() body)
	 {
		 await this.scservice.updatepassword(body.data.label, body.data.newpassword);
	 }
}


