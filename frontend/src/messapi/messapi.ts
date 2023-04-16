import axios from 'axios';

export interface MessageI
{
	id?: number;
	messages : Message[];
}

export interface Message
{
	name: string;
	text: string;
}

export interface MessageDTO
{
	name: string;
	text: string;
	label: string;	
}

export class messApi {

}
