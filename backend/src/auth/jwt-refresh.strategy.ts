import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from "express";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/service/user.service'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token'){
	constructor(private my_UserService: UserService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request:Request) => {
				const data_refresh = request?.cookies["succed_refresh_log"];
				if(!data_refresh) {
					return null;
				}
				return data_refresh.refresh_token_val;
			}
			]),
			ignoreExpiration: false, 
			secretOrKey: process.env.JWT_OTHER_SECRET, //put the fuck in an .env
			passReqToCallback: true, // to access to requestion in validate
		})
	}

	//IT FUCKING VALIDATE HERE
	async validate(request: Request, payload: any) //the payload withing the JWT extracted from cookie
	{
		const data = request?.cookies["succed_refresh_log"];
		const data_simple = request?.cookies["succed_log"];
		const username = payload.name;

		let user;
		if (username.name)
			user = await this.my_UserService.findOne(username.name);
		else
			user = await this.my_UserService.findOne(username);

			if (user == undefined)
				return {user: {name: null}};

		if (data.refreshToken && this.my_UserService.isRefreshMatch(data.refresh_token_val, user.name))
			{
				const {mdp, twoFactorAuthenticationSecret, enable2FA, inviter, invited, modeGameInvitation, socketIdChat, socketIdPong, friends, blocked, channels, gameList, mutedList, bannedList, level, achievement,...rest} = user; 
				if (data_simple)
						rest.isSuccedLog = true;
				else
						rest.isSuccedLog = false;
				return rest;
			}
	}
}
