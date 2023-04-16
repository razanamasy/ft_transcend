import axios from 'axios';

export interface MessageDTO
{
		name: string;
		text: string;
		label: string;	
}

export interface ChanDTO
{
		owner: string
		label: string
		status: number
		muted: string[]
		password: string
		admins: string[]
		invited: string[]
		banlist: string[]
		online:string[]
}

export class chanApi {



}
