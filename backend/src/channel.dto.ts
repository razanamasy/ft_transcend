import { Message } from './message/entities/message.entity';

export class Channel
{
    owner : string
    label : string
    messages : Message[]
    administrator : string[]
    status : number
    password : string
    invited : string[]
    online : string[]
    banlist : string[]
    mutelist : string[]
}