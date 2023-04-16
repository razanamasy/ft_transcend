import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/service/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
	constructor(private authService: AuthService, private userService: UserService) {
		super(
			{ 
				usernameField: 'name',
				passwordField: 'mdp'
			}
		);

	}

	async validate(name: string, mdp: string): Promise<any> {

		//find by nick name puis envoyer l'intraname à validate
		const userNickname = await this.userService.findOneByNickName(name); 
		if (!userNickname)
		{
				const user = {name : null}
				return user;
		}
		const _user = await this.authService.validateUser(userNickname.name, mdp);
		if (!_user)	
		{
				const user = {name : null}
				return user;
		}
		else
		{
						const user = {name:_user.name, nickname: _user.nickname, id:_user.id, twoFactorAuthenticationSecret:_user.twoFactorAuthenticationSecret, enable2FA:_user.enable2FA, refreshToken:_user.refreshToken}
						if (!user) {
							const user = {name : null}
							return user;
						}
						return (user);
		}
	}
}
