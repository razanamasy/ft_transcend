export interface UserI {
		mdp: string;
		name: string;

}

export interface UserCreationI {
		mdp: string;
		name: string;
		enable2FA: boolean;
		level: number[];
		status: number;
}

export interface dataUserI {
		name: string;
		enable2FA: boolean;
}

export interface Code2FA {
		twoFactorAuthenticationCode: string;
}
