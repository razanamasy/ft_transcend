import { Injectable } from '@nestjs/common';
import e from 'express';
import { Channel } from '../channel.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {


  roomlist = new Map<string, string[]>();


  join(name: string, room : string) {
    const rl = this.roomlist.get(room);

    if (rl == undefined)
    {
      this.roomlist.set(room, [name]);
      return ;
    }
    else 
    {
      rl.push(name);
      return ;
    }
  }

  leave(name : string, room : string)
  {
    let rl = this.roomlist.get(room);
    if (rl == undefined)
    {
      return ;
    }
    else
    {
      rl = rl.filter((e) => {e != name})
      return ;
    }
  }

  getroom(room : string)
  {
    return this.roomlist.get(room);
  }


  /*

  messages: Message[] = [{name: 'admin', text: 'Welcome in the chat'}];
  channels: Channel[] = [];
  prvmessages = new Map<string, Message[]>();
  blocked = new Map<string, string[]>();
  clientToUser = {}

  create(createMessageDto: CreateMessageDto) {
    const message = {name: createMessageDto.name, text: createMessageDto.text};
    this.messages.push(message);
    return message;
  }

  pubcreate(label : string, createMessageDto: CreateMessageDto)
  {
    const message = {name: createMessageDto.name, text: createMessageDto.text} as Message
    const chan = this.labeltochannel(label) as Channel
    if (chan)
    {
      if (chan.mutelist.find(e => e == message.name) == undefined)
        chan.messages.push(message);
    }
    /*
    else 
    {
      let newchan = {owner : createMessageDto.name, label : label, messages : []} as Channel
      newchan.messages.push(message)
      this.channels.push(newchan);
    }
    
    return message;
  }

  labeltochannel(label : string) : Channel
  {
    let retchan
    this.channels.forEach((chan, index) => {
      if (chan.label == label)
      {
        retchan = chan;
      }
    })
    return retchan;

  }

  getmess(login : string, label : string) : Message[]
  {
    let retchan
    this.channels.forEach((chan) => {
      if (chan.label == label)
      {
        retchan = chan
      }
    })

    const isnotblocked = (name : string, login : string) =>
    {
      if (this.blocked[login] == undefined)
        return (true);
      if (this.blocked[login].find(e => e == name) != undefined)
        return (false);
      return (true);
    }
    if (retchan.messages != undefined)
    {
      return retchan.messages.filter(e => isnotblocked(e.name, login))
    }
    return retchan.messages
  }

  /*
  getprv(n1 : string,  n2 : string)
  {
    const key = n1 > n2 ? n1 + n2 : n2 + n1;
    const isblocked = (name : string, blocker : string) =>
    {
      if (this.blocked[blocker] == undefined)
      {
        return (true)
      }
      if (this.blocked[blocker].find(e => e == name) != undefined)
        return (false)
      return (true)
    }
    if (this.prvmessages[key] != undefined)
    {
      return this.prvmessages[key].filter((e) => isblocked(e.name, n1))
    }
    return this.prvmessages[key];
  }
  */

/*
  createpublichannel(owner : string, label : string)
  {
    const channel = {owner : owner, label : label, messages : []};
    this.channels.push(channel)
    return channel;
  }

  createchannel(chan : Channel)
  {
    this.channels.push(chan)
    return chan;
  }

  createprv(message : CreateMessageDto, recv : string)
  {
    const key = message.name > recv ? message.name + recv : recv + message.name
    const mess = {name : message.name, text: message.text}
    let tabM = this.prvmessages[key];
    if (tabM)
    {
      tabM.push(mess);
      this.prvmessages[key] = tabM;
    }
    else
    {
      this.prvmessages[key] = [mess];
    }


    return (mess)
  }

  addblock(blocker : string, blocked : string)
  {
    let curb = this.blocked[blocker]
    if (curb)
    {
      if (curb.find(e => e == blocked) != undefined)
      {
        this.blocked[blocker] = this.blocked[blocker].filter(e => e != blocked)
      }
      else
      {
        curb.push(blocked);
        this.blocked[blocker] = curb;
      }
    }
    else
    {
      this.blocked[blocker] = [blocked];
    }
  }

  getblock(blocker : string)
  {
    return(this.blocked[blocker])
  }

  join(name: string, clientId: string)
  {
    this.clientToUser[clientId] = name;

    return Object.values(this.clientToUser);
  }

  getClientName(id: string)
  {
    return this.clientToUser[id]
  }

  getListofUsers()
  {
    return Object.values(this.clientToUser);
  }

  findAll() {
    return this.messages;
  }

  getprv(n1 : string,  n2 : string)
  {
    const key = n1 > n2 ? n1 + n2 : n2 + n1;
    const isblocked = (name : string, blocker : string) =>
    {
      if (this.blocked[blocker] == undefined)
      {
        return (true)
      }
      if (this.blocked[blocker].find(e => e == name) != undefined)
        return (false)
      return (true)
    }
    if (this.prvmessages[key] != undefined)
    {
      return this.prvmessages[key].filter((e) => isblocked(e.name, n1))
    }
    return this.prvmessages[key];
  }
  getchannels()
  {
    const ret = [] as string[]

    this.channels.map((chan) => {
      ret.push(chan.label)
    })
    return ret;
  }

  getidbyName(value) {
    return Object.keys(this.clientToUser).find(key => this.clientToUser[key] === value);
  }

  isInvited(chan : string, login : string)
  {
    let channel:Channel

    channel = this.labeltochannel(chan) 
    channel.invited.forEach(el => {
      if (el == login)
      return true;
    });
  }

  joinchan(login : string, label : string)
  {
    let chan:Channel
    chan = this.labeltochannel(label)
    if (chan)
      chan.online.push(login)

  }

  leavechan(login : string, label : string)
  {

    let chan:Channel
    chan = this.labeltochannel(label);
    if (chan)
    {

    chan.online = chan.online.filter(e => (e !== login))
    }
  }

  mute(label : string, muted : string)
  {
    let chan:Channel
    chan = this.labeltochannel(label)
    if (chan.mutelist.find(e => e == muted) != undefined)
    {
      chan.mutelist = chan.mutelist.filter(e => e !== muted)
    }
    else
    {
    chan.mutelist.push(muted)
    }
  }

  ban(label : string, banned : string)
  {
    let chan:Channel
    chan = this.labeltochannel(label)

    if (chan.banlist.find(e => e == banned) != undefined)
    {
      chan.banlist = chan.banlist.filter(e => e !== banned)
    }
    else
    {
      chan.banlist.push(banned)
    }
    //this.leavechan(banned, label)
  }

  addadm(label : string, newadm : string)
  {
    let chan:Channel
    chan = this.labeltochannel(label)

    if (chan.administrator.find(e => e== newadm) == undefined)
    {
      chan.administrator.push(newadm);
    }
  }
  /*
  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
  */
}
