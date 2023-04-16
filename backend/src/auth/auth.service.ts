import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/service/user.service';
import { UserI, PublicUserI } from '../user/models/user.interface';
import { JwtService } from '@nestjs/jwt';
//import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import axios from "axios";
import { firstValueFrom } from 'rxjs';

import { Authenticator } from '@otplib/core';

// Base32 Plugin
// for thirty-two
import { keyDecoder, keyEncoder } from '@otplib/plugin-thirty-two';
import { createDigest, createRandomBytes } from '@otplib/plugin-crypto';

@Injectable()
export class  Api42authService{
	constructor (private  httpService: HttpService) {}

	async getApiToken(code: string) {
		let ApiToken;
		const payload = {
			grant_type: "authorization_code",
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			code: code,
			redirect_uri: "http://" + process.env.HOSTNAME42 + ":3000/api/login42",
		}

		const axiosConfig: AxiosRequestConfig = {
			method: 'post',
			url: 'https://api.intra.42.fr/oauth/token',
			headers: {
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(payload),
		}

		ApiToken = await axios(axiosConfig);
		return (ApiToken.data.access_token);
	}

	async getDataUser(ApiToken: string) {


		const axiosConfig: AxiosRequestConfig = {
			method: 'GET',
			url: 'https://api.intra.42.fr/v2/me',
			headers: {
				'Authorization': 'Bearer ' + ApiToken,
				'Content-Type': 'application/json',
			},
		}

		let UserData;
		try
		{
			UserData =  await axios(axiosConfig);
		}
		catch(e)
		{
		}
		return (UserData.data.login);
	}
}

@Injectable()
export class AuthService {

	constructor(private usersService: UserService, private JwtService: JwtService) {}

	async validateUser(username: string, pass: string): Promise<any> {
		const user = await this.usersService.findOneStrict(username);
		if (!user)
			return (null);
		if (bcrypt.compareSync(pass, user.mdp)) {
			const { mdp, ...rest} = user;
			return rest;
		}
		return null;
	}

	async generateRefreshToken(username: string){
		const payload =
			{
			name: username,
			isTwoFactorAuthenticated: false,
		}
		return ({
			access_token: this.JwtService.sign(payload, {secret: process.env.JWT_OTHER_SECRET, expiresIn: '1d'})
		});
	}

	async login(user: any){ // Will create the JWT ad token within when decoded
		const payload =
			{
			name: user.name,
			id: user.id,
			isTwoFactorAuthenticated: false,
		};
		return ({
			access_token: this.JwtService.sign(payload, {secret: process.env.JWT_SECRET, expiresIn: '1d'})
		});
	}
}

@Injectable()
export class TwoFactorAuthenticationService {
	constructor (
		private readonly usersService: UserService,
		private JwtService: JwtService  ) {

		}
				private authenticator = new Authenticator({
					createDigest,
					createRandomBytes,
					keyDecoder,
					keyEncoder
				});

		public async generateTwoFactorAuthenticationSecret(user: UserI) {

			const secret = this.authenticator.generateSecret();

			const otpauthUrl = this.authenticator.keyuri(user.name, 'AUTH_TRANFANDANF', secret);//génère un secret et l'url du qrCode

			await this.usersService.setTwoFactorAuthenticationSecret(secret, user.name);//Ici on set le secret généré

			return {
				secret,
				otpauthUrl
			}
		}

		async generateQrCodeDataURL(otpAuthUrl: string) {
			return toDataURL(otpAuthUrl);
		}

		async isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, Secret: string) {

			const is_valid =  this.authenticator.check(twoFactorAuthenticationCode, Secret);
			return (is_valid);
		}

		async generateRefreshToken2FA(user: any){
			const payload =
				{
				name: user.name,
				isTwoFactorAuthenticated: true,
			}
			return ({
				access_token: this.JwtService.sign(payload, {secret: process.env.JWT_OTHER_SECRET, expiresIn: '1d'})
			});
		}

		async loginWith2fa(userWithoutPsw: Partial<UserI>) {
			const payload =
				{
				name: userWithoutPsw.name,
				isTwoFactorAuthenticationEnabled: !!userWithoutPsw.enable2FA, //??
				isTwoFactorAuthenticated: true,
			};

			return {
				name: payload.name,
				access_token: this.JwtService.sign(payload, {secret: process.env.JWT_SECRET, expiresIn: '1d'})
			};
		}

}
