import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from "express";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/service/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt')
{
	//Everything happens in super() 
	constructor(my_UserService: UserService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([(request:Request) => {
				const data = request?.cookies["2FA_waiting"];
				if(!data) {
					return null;
				}
				return data.token_val;
			}
			]),
			ignoreExpiration: false, //The expiration we set in the module import
			secretOrKey: process.env.JWT_SECRET,
		})
	}

	//actually it doesn't really validate
	async validate(payload: any)
	{
		return (
			{
				name: payload.name,
				id: payload.id,
			});
	}
}
