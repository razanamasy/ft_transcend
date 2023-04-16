export class ChanDTO
{
	owner: string
	label: string
	status: number
	password: string
	invited: string[]
	muted: string[]
	banlist: string[]
	online: string[]
	admins: string[]
}

interface Message
{
	text : string
	name: string
}

