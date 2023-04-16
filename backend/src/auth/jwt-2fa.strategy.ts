import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from "express";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/service/user.service'

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa'){
	constructor(private my_UserService: UserService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request:Request) => {
				const data = request?.cookies["succed_log"];
				if(!data) {
					return null;
				}
				return data.token_val;
			}
			]),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET, 
			passReqToCallback: true, // to access to requestion in validate
		})
	}

	async validate(request: Request, payload: any) //the payload withing the JWT extracted from cookie
	{
		const data = request?.cookies["succed_log"];
		const user = await this.my_UserService.findOne(payload.name);

		if (!user.enable2FA) {
			const {mdp, twoFactorAuthenticationSecret, enable2FA, inviter, invited, modeGameInvitation, socketIdChat, socketIdPong, friends, blocked, channels, gameList, mutedList, bannedList,level, ...rest} = user;
			return rest;
		}
		if (payload.isTwoFactorAuthenticated) {
			const {mdp, twoFactorAuthenticationSecret, enable2FA, inviter, invited, modeGameInvitation, socketIdChat, socketIdPong, friends, blocked, channels, gameList, mutedList, bannedList,level, ...rest} = user; 
			return rest;
		}
	}
}