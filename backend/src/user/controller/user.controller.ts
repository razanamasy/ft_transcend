import {Controller, Query, UseGuards, Request, Res, UseInterceptors, Req } from '@nestjs/common'
import { UserService } from '../service/user.service'
import { Post, Body, Get, Delete, Param, Put } from '@nestjs/common'
import { UserI, PublicUserI } from '../models/user.interface'
import { UserEntity } from '../models/user.entity'
import { Jwt2faAuthGuard } from '../../auth/jwt-2fa-auth.guard';
import { TwoFactorAuthenticationService } from '../../auth/auth.service';
import { UnauthorizedException, UploadedFile } from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { diskStorage } from 'multer';

@Controller('user')
export class UserController {
	constructor (private userService : UserService, private serviceTwoFA: TwoFactorAuthenticationService) {}



	//NO NEED GUARDS
	@Post()
	public async add(@Body() user: UserI)  {
		const myUser = this.userService.add(user);
		if (!myUser)
				return false;
		else
				return myUser
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get('generate')
	async register(@Request() req) {
		const { otpauthUrl } = await this.serviceTwoFA.generateTwoFactorAuthenticationSecret(req.user);

		return await this.serviceTwoFA.generateQrCodeDataURL(otpauthUrl);
	}

	@UseGuards(Jwt2faAuthGuard)
	@Post('2fa/turn-on')
	async turnOnTwoFactorAuthentication(@Request() request, @Body() body, @Res({ passthrough: true }) res) {

		//recherche du user
		const my_user = await this.userService.findOne(request.user.name); 
		const isCodeValid =
			await this.serviceTwoFA.isTwoFactorAuthenticationCodeValid(
				body.twoFactorAuthenticationCode,
				my_user.twoFactorAuthenticationSecret,
		)
		if (!isCodeValid) {
			return ({msg: 'Bad code'});
		}
		await this.userService.turnOnTwoFactorAuthentication(request.user.name);

		res.clearCookie('succed_log');
		const token  = await this.serviceTwoFA.loginWith2fa(request.user);
		const token_val = token.access_token;
		const  data = {
			token_val,
			refreshToken: false,
		};
		res.cookie('succed_log', data, {httpOnly:true, maxAge: '900000'});
		return ({msg: "Enable 2FA success"});
	}


	@UseGuards(Jwt2faAuthGuard)
	@Get('2fa/turn-off')
	async turnOffTwoFactorAuthentication(@Request() request) {

		await this.userService.turnOffTwoFactorAuthentication(request.user.name);
		return ({msg: "Disable 2FA succed"});
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get('protected')
	getHello(@Request() req): string { 
		return (req.user);
	}

	@UseGuards(Jwt2faAuthGuard)
	@Delete("/:id")
	public async deleteOne(@Param("id") id: number) {
		return this.userService.deleteOne(id);
	}

	@UseGuards(Jwt2faAuthGuard)
	@Put("updateMdp")
	public async modifyMdp(@Body() body) {
		if (await this.userService.getOnGoingGame(body.info.name))
		{
			await this.userService.updateMdp(body.info.name, body.info.newMdp);
			return ({msg : "update succeded"});
		}
		else
		{
			return ({msg : "error"});
		}
	}

	@UseGuards(Jwt2faAuthGuard)
	@Put("updateName")
	public async modifyName(@Body() body) {
			let	c: number = +body.info.newName[0];
			if (!isNaN(c))
			{
				return ({msg : "error1"});
			}
			const update = await this.userService.updateName(body.info.name, body.info.newName);
			if (update)
				return ({msg : "update succeded"});
			else
				return ({msg : "error"});
	}

	@UseGuards(Jwt2faAuthGuard)
	@Post("updatestatus")
	public async updatestatus(@Body() body) {
		await this.userService.setStatus(body.info.name, body.info.status);
		return ({msg : "update status succeded"});
	}

	@UseGuards(Jwt2faAuthGuard)
	@Post("getstatus")
	public async getstatus(@Body() body) {
	return	(await this.userService.getstatus(body.info.name));
	}


	@UseGuards(Jwt2faAuthGuard)
	@Put("updatelevel")
	public async updatelevel(@Body() body) {

		await this.userService.updatelevel(body.info.name1, body.info.name2, body.info.win);
		return ({msg : "level update succeded"});
	}













	@UseGuards(Jwt2faAuthGuard)
	@Get()
	public async findAll() : Promise<PublicUserI[]> {
		const completeList = await this.userService.findAll();
		const secureList = completeList.map(obj => ({"name":obj.name})); 
		return secureList;
	}

	@UseGuards(Jwt2faAuthGuard)
	@Put("addFriend")
	public async addFriend(@Body() body) {
		await this.userService.addFriend(body.info.userName, body.info.friendName);
		return ({msg : "addFriend succeded"});
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get("isFriend/:userName/:friendName")
	public async isFriend (@Param("userName") userName: string, @Param("friendName") friendName: string ): Promise<boolean> {
		const res = await this.userService.isFriend(userName, friendName);
		return (res);
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get("deleteFriend/:userName/:friendName")
	public async deleteFriend (@Param("userName") userName: string, @Param("friendName") friendName: string ) {
		const res = await this.userService.deleteFriend(userName, friendName);
		return ({msg : "deleteFriend succeded"});
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get("friends/:name")
	public async findFriend(@Param("name") name: string) : Promise<any> {

		const completeList = await this.userService.findFriends(name);
		//IF YOU NEED MORE FRIENDZ INFO ON USER ADD IN PUBLIC USER and HERE :)
		const secureList = completeList.map(obj => ({"name":obj.name, "nickname":obj.nickname})); 
		return secureList;
		//	return await this.userService.findFriends(name);
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get("friendss/:name")
	public async findFriendS(@Param("name") name: string) {

		const completeList = await this.userService.findFriends(name);
		//IF YOU NEED MORE FRIENDZ INFO ON USER ADD IN PUBLIC USER and HERE :)
		const secureList = completeList.map(obj => ({"name":obj.name, "nickname": obj.nickname, "status":obj.status})); 
		return secureList;
		//	return await this.userService.findFriends(name);
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get("/:name")
	public async findOne(@Param("name") name: string): Promise<any>{
		const user = await this.userService.findOne(name);
		if (!user)
			return ({msg: "not found"});
		const {mdp, id, twoFactorAuthenticationSecret, refreshToken, friends, enable2FA, gameList, ...rest} = user; 
		return rest;
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get("findUserByNickName/:name")
	public async findOneByNickName(@Param("name") name: string): Promise<any>{
		const user = await this.userService.findOneByNickName(name); 
		if (!user)
			return {msg: "no user"};
		const {mdp, id, twoFactorAuthenticationSecret, refreshToken, friends, enable2FA, gameList, ...rest} = user; 
		return rest;
	}

	@UseGuards(Jwt2faAuthGuard) 
	@Post('chanfromuser')
	public async chanfromuser(@Body() body) {
		const completeList = await this.userService.chanfromuser(body.data.name);

		const truechan = completeList.filter((chan) => chan.status != 4);

		const  ret = truechan.map(obj => ({"label":obj.label, "status":obj.status})); 
		return (ret);
	}

	@UseGuards(Jwt2faAuthGuard) 
	@Post('searchan')
	public async searchan(@Body() body) {
		const completeList = await this.userService.searchan(body.data.name, body.data.label);

		//this.server.to(body.name + 'Chat').emit('refreshchan');

		return (completeList);
	}

	@UseGuards(Jwt2faAuthGuard) 
	@Post('isblocked')
	public async isblocked(@Body() body) {
		const ret = await this.userService.isBlocked(body.data.user, body.data.blockedornot);

		return (ret);
	}

	@UseGuards(Jwt2faAuthGuard) 
	@Post('addblock')
	public async addblock(@Body() body) {
		const ret = await this.userService.addblock(body.data.user, body.data.blocked);

		return (ret);
	}

	@UseGuards(Jwt2faAuthGuard) 
	@Post('unblock')
	public async unblock(@Body() body) {
		const ret = await this.userService.unblock(body.data.user, body.data.unblocked);

		return (ret);
	}


	//USER/GAME
	@UseGuards(Jwt2faAuthGuard) 
	@Get('onGoingGame/:username')
	async onGoingGame(@Param("username") username: string) {
		const ret = await this.userService.getOnGoingGame(username);
		return ret;
	}

	@UseGuards(Jwt2faAuthGuard) 
	@Get('endedGame/:username')
	async endedGame(@Param("username") username: string) {
		const ret = await this.userService.getEndedGame(username);
		return ret;
	}


	@UseGuards(Jwt2faAuthGuard) 
	@Get('isInviteProcess/:username')
	async isInviter(@Param("username") username: string) {
		const isInviter = await this.userService.isInviter(username);
		const isInvited = await this.userService.isInvited(username);
		return {isInviter: isInviter, isInvited: isInvited};
	}

	@UseGuards(Jwt2faAuthGuard)
	@Post('setAvatar')
	@UseInterceptors(
		FileInterceptor
		(
			'avatar',
			{
				storage: diskStorage(
				{
					destination: (req, file, cb) => {
					  cb(null, '/root/backend/avatars');
					},
					filename: (req, file, cb) => {
					  cb(null, file.originalname);
					},
				}),
				fileFilter: (req, file, cb) =>
				{
					if (file.mimetype != 'image/png')
					{
						req.fileValidationError = 'not good';
						cb(null, false);
					}
					else if (file.size > 1000000)
					{
						req.fileValidationError = 'not good';
						cb(null, false);
					}
					else
						cb(null, true);
				},
			}
		)
	)
	async uploadFile(@Req() req, @UploadedFile() file: Express.Multer.File)
	{
		if (req.fileValidationError)
			return "invalid file";
		else
			return "ok";
	}
}

