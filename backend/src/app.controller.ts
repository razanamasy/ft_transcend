import { Controller, Get, Request, Post, UseGuards, Res, Body, UnauthorizedException, Query, Param, StreamableFile,  } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService, TwoFactorAuthenticationService, Api42authService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UserService } from './user/service/user.service';
import { Jwt2faAuthGuard } from './auth/jwt-2fa-auth.guard';
import { LogUserI } from './user/models/user.interface';
import JwtRefreshGuard from './auth/jwt-refresh.guard';
import {ConnexionGateway} from './connexion.gateway'
import { ReadStream, createReadStream } from 'fs';
import { join } from 'path';


@Controller()
export class AppController {
	constructor(private readonly authService: AuthService, private Api42Service: Api42authService,  private authService2FA: TwoFactorAuthenticationService, private userService: UserService, 
				private readonly connexionGateway: ConnexionGateway 
			   ) {}


			   @UseGuards(JwtRefreshGuard)
			   @Get('refresh')
			   async refresh(@Request() req, @Res({ passthrough: true }) res) {


					if (!req.user.name)
							return ({msg: 'error'})

				   const my_user = await this.userService.findOne(req.user.name);


				   if (!req.user.isSuccedLog)
					   {
						   let token: { access_token : string};
						   if (!my_user.enable2FA)
							   {
								   token = await this.authService.login(req.user);
							   }
							   else
								   {
									   token  = await this.authService2FA.loginWith2fa(req.user);
								   }

								   const token_val = token.access_token;
								   const  data = {
									   token_val,
									   refreshToken: false,
								   };
								   res.cookie('succed_log', data, {httpOnly:true, maxAge: '86400000'});
					   }



					   //Infos for Persist login LE LAG VIENT D'ICI
					   const inInviteProcess = await this.userService.isInInviteProcess(req.user.name);
					   let isInvited;
					   let isInviter;
					   let modeGameInvitation;
					   if (inInviteProcess)
						   {

							   if (my_user.inviter)
								   {
									   isInvited = true;
									   isInviter = false;
									   modeGameInvitation = my_user.modeGameInvitation;
								   }
								   else
									   {
										   isInvited = false;
										   isInviter = true;
										   modeGameInvitation = "";
									   }
						   }
						   else
							   {
								   isInvited = false;
								   isInviter = false;
								   modeGameInvitation = "";
							   }

							   return ({nickname: my_user.nickname, name: my_user.name, modeGameInvitation: modeGameInvitation, inInviteProcess: inInviteProcess, isInvited: isInvited, isInviter: isInviter, myInviter: my_user.inviter, myInvited: my_user.invited, enable2FA: my_user.enable2FA });
			   }

			   @UseGuards(JwtAuthGuard) // Un guard qui check que JWT à fonctionné avec le cookie 2FA_waiting
			   @Get('waiting2FA')
			   async getRefresh2fa(@Request() req, @Res({ passthrough: true }) res) {
				   res.clearCookie('succed_log');
			   }

			   @UseGuards(JwtRefreshGuard) //no need to protect that:
			   @Get('logout')
			   async logout(@Request() req,  @Res({ passthrough: true }) res)
			   {

				   res.clearCookie('succed_log');
				   res.clearCookie('succed_refresh_log');
				   await this.userService.setStatus(req.user.name, 0);
				   await this.connexionGateway.server.emit('changestatus', {name : req.user.name, status: 0});

				   await this.userService.unsetRefreshToken(req.user.name);
				   return ({msg: "successfully logout"});
			   }

			   @Get('eraseCookie')
			   async eraseCookie(@Request() req,  @Res({ passthrough: true }) res)
			   {

				   res.clearCookie('succed_log');
				   res.clearCookie('succed_refresh_log');

				   return ({msg: "success"});
			   }


			   @UseGuards(JwtAuthGuard) // Un guard qui check que JWT à fonctionné avec le cookie 2FA_waiting
			   @Get('2FAProtection')
			   FAProtection(@Request() req) { 
						return ({msg: "cool"});
			   }


			   @UseGuards(JwtAuthGuard) // Un guard qui check que JWT à fonctionné avec le cookie 2FA_waiting
			   @Post('login/2FA')
			   async login2FA(@Request() req, @Body() body, @Res({ passthrough: true }) res) {
				   res.clearCookie('2FA_waiting');	


				   const my_user = await this.userService.findOne(req.user.name); 
				   const isCodeValid = await this.authService2FA.isTwoFactorAuthenticationCodeValid(
					   body.twoFactorAuthenticationCode,
					   my_user.twoFactorAuthenticationSecret,
				   );

				   if (!isCodeValid) {
					   return ({status: null});
				   }

				   //Cookie avec le payload adéquat
				   const token = await this.authService2FA.loginWith2fa(req.user);
				   const token_val = token.access_token;
				   const  data = {
					   token_val,
					   refreshToken: false,
				   };
				   const refresh_token = await this.authService2FA.generateRefreshToken2FA(req.user);
				   const refresh_token_val = refresh_token.access_token;
				   await this.userService.setRefreshToken(refresh_token_val, req.user.name);

				   //SEND TO EVERYONE WE ARE CONNEXTED AND CHANGE IN DATABASE
				   await this.userService.setStatus(req.user.name, 1);
				   await this.connexionGateway.server.emit('changestatus', {name : req.user.name, status: 1});

				   res.cookie('succed_refresh_log', {refresh_token_val, refreshToken: true}, {httpOnly:true, maxAge: '86400000'})//comme the Refreshtoken 1d
				   res.cookie('succed_log', data, {httpOnly:true, maxAge: '86400000'});
				   //LA OU CECI EST RECU EN FRONT ON EMIT UN LOGIN
				   return ({msg: "2FA authentication succeded"});
			   }



			   //Exchange the Code with token, then fetch user42 data 
			   @Get('login42')
			   async loginOauth(@Request() req, @Query('code') code, @Res({ passthrough: true }) res)
			   {
				   let ApiToken: string;
				   let UserLogin: string;

				   if (code)
					   {
						   try {
							   ApiToken = await this.Api42Service.getApiToken(code);}
							   catch (e)
							   {
							   }

							   if (ApiToken)
								   {
									   UserLogin = await this.Api42Service.getDataUser(ApiToken);
								   }

								   if (UserLogin)
									   {
										   let UserExist;
										   try {
											   UserExist = await this.userService.findOne(UserLogin);
										   }
										   catch(e) {
										   }
										   if (!UserExist)
											   {
													const UsrWithMyIntraAsNickName = await this.userService.findOneByNickName(UserLogin);
													let myNickName;
													if (UsrWithMyIntraAsNickName)
															myNickName = "1" + 	UserLogin;
													else
															myNickName = UserLogin;
												   const new_user = {

														nickname: myNickName,
													  mdp: UserLogin, //Default mdp we have to put in an env
													  name: UserLogin,
													  enable2FA: false,

													  level: [1200],
												   }
												   await this.userService.add(new_user);
												   //socket.emit('changestatus', {name: UserLogin, status:1}); emitting from back ?
												   const tokenAuth = await this.authService.login(new_user);
												   const token_val = tokenAuth.access_token;
												   const  data = {
													   token_val,
													   refreshToken: false,
												   };
												   const refresh_token = await this.authService.generateRefreshToken(new_user.name);
												   const refresh_token_val = refresh_token.access_token;
												   await this.userService.setRefreshToken(refresh_token_val, new_user.name);

												   //SEND TO EVERYONE WE ARE CONNEXTED AND CHANGE IN DATABASE
												   await this.userService.setStatus(new_user.name, 1);
												   await this.connexionGateway.server.emit('changestatus', {name : new_user.name, status: 1});

												   res.cookie('succed_log', data, {httpOnly:true, maxAge: '86400000'})
												   res.cookie('succed_refresh_log', {refresh_token_val, refreshToken: true}, {httpOnly:true, maxAge: '86400000'})//comme the Refreshtoken 1d
												   res.redirect("http://" + process.env.HOSTNAME42 + ":3000/Settings");
												   //FAIRE UN RETURN AU FRONT OU ON FERA UN EMIT CA MARCHERA PO
												   //				return ({name: UserLogin, enable2FA: false});
											   }
											   else
												   {
													   const tokenAuth = await this.authService.login(UserExist);
													   const token_val = tokenAuth.access_token;
													   const  data = {
														   token_val,
														   refreshToken: false,
													   };
													   const my_user = await this.userService.findOne(UserLogin)
													   if (!my_user.enable2FA)
														   {
															   //SEND TO EVERYONE WE ARE CONNEXTED AND CHANGE IN DATABASE
															   await this.userService.setStatus(UserExist.name, 1);
															   await this.connexionGateway.server.emit('changestatus', {name : UserExist.name, status: 1});

															   const refresh_token = await this.authService.generateRefreshToken(UserExist.name);
															   const refresh_token_val = refresh_token.access_token;
															   await this.userService.setRefreshToken(refresh_token_val, UserExist.name);
															   res.cookie('succed_log', data, {httpOnly:true, maxAge: '86400000'})
															   res.cookie('succed_refresh_log', {refresh_token_val, refreshToken: true}, {httpOnly:true, maxAge: '86400000'})//comme the Refreshtoken 1d
															   res.redirect("http://" + process.env.HOSTNAME42 + ":3000/Dashboard");

														   }

														   else
															   {
																   res.cookie('2FA_waiting', data, {httpOnly:true, maxAge: '900000'})
																   res.redirect("http://" + process.env.HOSTNAME42 + ":3000/Login2FA");
																 //  return ({name: UserLogin, enable2FA: true});
															   }

												   }
									   }
					   }
			   }



			   @UseGuards(LocalAuthGuard)  //Local strategy check mdp utilise validate user de auth service
			   @Post('login')
			   async login(@Request() req, @Res({ passthrough: true }) res)  {
				   if (req.user.name == null)
					   return ({msg: "fail"});

				   const token = await this.authService.login(req.user); 
				   const token_val = token.access_token;
				   const  data = {
					   token_val,
					   refreshToken: false,
				   };

				   const my_user = await this.userService.findOneForInvit(req.user.name)
				   if (!my_user.enable2FA)
					{
						   //SEND TO EVERYONE WE ARE CONNEXTED AND CHANGE IN DATABASE
						   await this.userService.setStatus(req.user.name, 1);
						   await this.connexionGateway.server.emit('changestatus', {name : req.user.name, status: 1});

						   const refresh_token = await this.authService.generateRefreshToken(req.user);
						   const refresh_token_val = refresh_token.access_token;
						   await this.userService.setRefreshToken(refresh_token_val, req.user.name);
						   const user = await this.userService.setStatus(req.user.name, 1);
							if (user.status == 1)
							{
						   		res.cookie('succed_log', data, {httpOnly:true, maxAge: '86400000'})//comme the token 900s
						   		res.cookie('succed_refresh_log', {refresh_token_val, refreshToken: true}, {httpOnly:true, maxAge: '86400000'})//comme the Refreshtoken 1d
							}
					}
					else
					{
						res.cookie('2FA_waiting', data, {httpOnly:true, maxAge: '900000'})
					}
					return ({name : req.user.name, nickname: req.user.nickname, enable2FA: my_user.enable2FA}); 
			   }


			   @UseGuards(Jwt2faAuthGuard) 
			   @Post('checkMdp')
			   async CheckMdp(@Request() req, @Body() body): Promise<any>  {
				   const usr = await this.userService.findOne(req.user.name);
				   const isMatch = await (bcrypt.compareSync(body.match, usr.mdp));
				   return ({isMatch: isMatch});
			   }

			   @UseGuards(Jwt2faAuthGuard) 
			   @Get('protected')
			   getHello(@Request() req) { 
				   return ({ name: req.user.name});
			   }

	@Get('avatar/:filename')
	async getAvatar(@Param("filename") filename: string)
	{
		const fs = require('fs').promises;
		let	avatar_path = join('/root/backend/avatars', 'default_avatar.png');

		try {
			const data = await fs.readFile(join('/root/backend/avatars', filename));
			return new StreamableFile(createReadStream(join('/root/backend/avatars', filename)));
		}
		catch(e)
		{
			return new StreamableFile(createReadStream(avatar_path));
		}
	}
}
