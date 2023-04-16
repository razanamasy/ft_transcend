export interface UserI {
	mdp: string;
	name: string;
	twoFactorAuthenticationSecret?: string;
	enable2FA: boolean;
	level: number[];
}

export interface LogUserI {
	name: string;
	enable2FA: boolean;
}

//ADD INFO HERE
export interface PublicUserI {
	name: string;
}

