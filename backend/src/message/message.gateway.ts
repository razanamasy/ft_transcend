import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Server } from 'socket.io';
import io, { Socket } from 'socket.io';
import { Message } from './entities/message.entity';
import { Channel } from '../channel.dto';
import { UserService } from "../user/service/user.service"
import { OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Injectable, NotFoundException, Inject, forwardRef} from '@nestjs/common';


@Injectable()
@WebSocketGateway(8000, {cors: "*", namespace: "/chat"})
export class MessageGateway implements OnGatewayDisconnect, OnGatewayInit{
	constructor(
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,

		private readonly messageService: MessageService

	) {}


	@WebSocketServer()
	server: Server;
		handleConnection(client: Socket) {
    }

				afterInit(server: Server)
				{
				}

	handleDisconnect(client: Socket): any
	{

				let i = 0;

				//Check if we emptied the room hrazanam
				this.server.in("hrazanamChat").fetchSockets().then((sockets) => {if (sockets[0] == undefined)
						{
										i++;
						}}
				);
		this.userService.deleteSocketBySocketIdChat(client.id);
	}


		@SubscribeMessage('Connexion')
		async HandleConnexion(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket)
		{
				mySocket.join(data.username + "Chat");
				let nbOfSockets = 0;
				this.server.in(data.username + "Chat").fetchSockets().then((sockets) => sockets.forEach(socket => {
						nbOfSockets++;
				}))
				this.userService.addSocketChat(data.username, mySocket.id);
		}

		@SubscribeMessage('Disconnect')
		async HandleDisconnect(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket)
		{


				let nbOfSockets = 0;
				this.server.in(data.username + "Chat").fetchSockets().then((sockets) =>  
						{
								sockets.forEach((socket) =>  
										{
												socket.disconnect();
										}
								)
						}
				)

				this.userService.deleteSocketChat(data.username);
		}


				/*
	@SubscribeMessage('createMessage')
	async create(@MessageBody() createMessageDto: CreateMessageDto) {
		const message = await this.messageService.create(createMessageDto);
		this.server.emit('message', message);
		return message;
	}
	*/

	/*
	   @SubscribeMessage('publichannelmessage')
	   publichannelmessage(@MessageBody('label') label : string, @MessageBody('message') crmessage : CreateMessageDto)
	   {
	   const message  = this.messageService.pubcreate(label, crmessage);
	   this.server.emit('pubmessage', label, message)
	   return message;
	   }
	   */

	   /*@SubscribeMessage('changestatus')
	   async changestatus(@MessageBody() data : any, @ConnectedSocket() mySocket : Socket)
	   {

		   this.server.emit('changestatus', {name : data.name, status: data.status});

			return ;
		   //this.server.to('Chat').emit('changestatus', {name : data.name, status: data.status});
	   }*/
	   /*

	@SubscribeMessage('newchannelmessage')
	newchannelmessage(@MessageBody('label') label : string)
	{
		//const message  = this.messageService.pubcreate(label, crmessage);
		this.server.emit('pubmessage', label)
		return ;
	}
	*/
	/*
	@SubscribeMessage('getmessage')
	getpublicmessage(@MessageBody('login') login : string, @MessageBody('label') label : string)
	{
		return this.messageService.getmess(login, label);
	}
	/*
	   @SubscribeMessage('newpublichannel')
	   async createpublicchannel(@MessageBody() owner : string, @MessageBody('label') label : string)
	   {
	   const res = await this.messageService.createpublichannel(owner, label)
	   }
	   
	@SubscribeMessage('newchannel')
	async createchannel(@MessageBody() chan : Channel)
	{
		this.server.emit('chanpoped');
		const res = await this.messageService.createchannel(chan)
	}
	

	@SubscribeMessage('prvmsg')
	privmsg(@MessageBody('recvn') recvn: string, @MessageBody('message') crmessage : CreateMessageDto)
	{
		const message = this.messageService.createprv(crmessage, recvn);
		this.server.emit('prvmsg', message, recvn);

		return message;
	}

	@SubscribeMessage('loadprv')
	loadprv(@MessageBody('n1') n1: string, @MessageBody('n2') n2: string)
	{
		return(this.messageService.getprv(n1, n2));
	}

	@SubscribeMessage('getchannels')
	getchannels()
	{
		return this.messageService.getchannels();
	}

	@SubscribeMessage('findAllMessage')
	findAll() {
		return this.messageService.findAll();
	}
	*/
/*
	@SubscribeMessage('join')
	joinRoom(@MessageBody('name') name : string, @ConnectedSocket() client: Socket)
	{
		this.server.emit('joinedsite');
		return this.messageService.join(name, client.id);
	}
	

	@SubscribeMessage('joinchan')
	joinchan(@MessageBody('login') login : string, @MessageBody('label') label : string)
	{
		this.messageService.joinchan(login, label);
		this.server.emit('refreshonline');
	}


	@SubscribeMessage('leavechan')
	leavechan(@MessageBody('login') login : string, @MessageBody('label') label : string)
	{
		this.messageService.leavechan(login, label);
		this.server.emit('refreshonline')
	}
	*/
/*
	@SubscribeMessage('refreshusers')
	refreshusers(@MessageBody('label') label : string)
	{
		//this.messageService.leavechan(login, label);
		this.server.emit('refreshusers', label)
	}

	@SubscribeMessage('users')
	getusers()
	{
		return this.messageService.getListofUsers();
	}

	@SubscribeMessage('findchannel')
	findchannel(@MessageBody('chan') chan: string)
	{
		return this.messageService.labeltochannel(chan);
	}

	@SubscribeMessage('isInvited')
	isInvited(@MessageBody('chan') chan: string, @MessageBody('login') login : string)
	{
		return this.messageService.isInvited(chan, login);
	}

	@SubscribeMessage('muted')
	muted(@MessageBody('label') label : string, @MessageBody('muted') muted : string)
	{
		return this.messageService.mute(label, muted);
	}

	@SubscribeMessage('banned')
	banned(@MessageBody('label') label : string, @MessageBody('banned') banned : string)
	{
		this.server.emit('kick', label, banned);
		this.server.emit('refreshonline');
		return this.messageService.ban(label, banned);
	}

	@SubscribeMessage('newadm')
	newadm(@MessageBody('label') label : string, @MessageBody('newadm') newadm : string)
	{
		this.server.emit('refreshadm')
		return this.messageService.addadm(label, newadm);
	}


	@SubscribeMessage('typing')
	async typing(@MessageBody('isTyping') isTyping: boolean, @ConnectedSocket() client:Socket)
	{
		const name = await this.messageService.getClientName(client.id)

		client.broadcast.emit('typing', {name, isTyping});
	}

	@SubscribeMessage('addblock')
	addblock(@MessageBody('blocker') blocker : string, @MessageBody('blocked') blocked : string)
	{
		return this.messageService.addblock(blocker, blocked);
	}

	@SubscribeMessage('getblock')
	getblock(@MessageBody('blocker') blocker : string)
	{
	
		return this.messageService.getblock(blocker)
	}
	*/

	@SubscribeMessage('joinchatroom')
	joinchatroom(
		@ConnectedSocket() socket: Socket,
		@MessageBody('proom') proom: string,
		@MessageBody('label') room : string
	)
	{
		if (proom == room)
			{
				return ;
			}
		
		if (proom != undefined && proom != "allpub")
		{
			socket.leave(proom);
		}
		socket.leave(room);

		this.server.to(room).emit('refreshusers', room);
		socket.join(room);
	}

	@SubscribeMessage('Joinchatroom')
	Joinchatroom(
		@ConnectedSocket() socket: Socket,
		@MessageBody('proom') proom: string,
		@MessageBody('label') room : string,
		@MessageBody('name') name : string,
	)
	{
		if (proom == room)
			{
				return ;
			}
		
		if (proom != undefined && proom != "allpub")
		{
			this.messageService.leave(name, proom);
			//socket.leave(proom);
		}

		//socket.leave(room);
		const users = this.messageService.getroom(room);
		
		users?.map((usr) => {
			this.server.to(usr + 'Chat').emit('refreshusers', room);
		})

		

		//this.server.to(room).emit('refreshusers', room);
		//socket.join(room);
		this.messageService.join(name, room);
	}

	@SubscribeMessage('leavechatroom')
	leavechatroom(@ConnectedSocket() client : Socket, @MessageBody('label') room : string)
	{
		client.leave(room);
	}
	/*

	@SubscribeMessage('Leavechatroom')
	Leavechatroom(@ConnectedSocket() client : Socket, @MessageBody('label') room : string, @MessageBody('name') name : string)
	{
		this.messageService.leave(name, room)
	}
	*/

	@SubscribeMessage('quitingchan')
	quitingchan(@MessageBody('room') room : string)
	{
		this.server.in(room).emit('quitingchan');
		return ;
	}

	@SubscribeMessage('chatToserver')
	chatToserver(@MessageBody('room') room : string)
	{
		//const message  = this.messageService.pubcreate(label, crmessage);
		/*
		const users = this.messageService.getroom(room);
		users?.map((usr) => {
			this.server.to(usr + 'Chat').emit('pubmessage', room)
		})
		*/
		this.server.in(room).emit('pubmessage', room)
		return ;
	}

	/*
	@SubscribeMessage('refreshuseroom')
	refreshuseroom(@MessageBody('room') room : string)
	{
		this.server.to(room).emit('refreshusers', room)
		return ;
	}
	*/


	@SubscribeMessage('refreshchan')
	refreshchan(@MessageBody('room') room : string)
	{
		this.server.to(room).emit('refreshchan');
		return ;
	}

    @SubscribeMessage('refreshblock')
	refreshblock(@MessageBody('room') room : string, @MessageBody('label') label : string)
	{
		this.server.to(room + 'Chat').emit('refreshblock');
        this.server.to(room + 'Chat').emit('pubmessage', label);
		return ;
	}
/*
	@SubscribeMessage('Refreshchan')
	refreshchan(@MessageBody('room') room : string)
	{
		const users = this.messageService.getroom(room);
		users?.map((usr) => {
			this.server.to(usr + 'Chat').emit('refreshchan');
		})
		//this.server.to(room).emit('refreshchan');
		return ;
	}
	*/

	@SubscribeMessage('kicked')
	kicked(@MessageBody('label') label : string, @MessageBody('name') name : string)
	{
		this.server.to(name + 'Chat').emit('kicked', label);
		return ;
	}


	@SubscribeMessage('refreshusers')
	refreshusers(@MessageBody('label') label : string)
	{
		//this.messageService.leavechan(login, label);
		this.server.emit('refreshusers', label)
	}

	@SubscribeMessage('delayedrefreshusers')
	delayedrefreshusers(@MessageBody('label') label : string)
	{
		setTimeout(() => {
			this.server.emit('refreshusers', label);
		}, 30500);

	}

	@SubscribeMessage('refreshusersblock')
	refreshuserblock(@MessageBody('name') name : string, @MessageBody('label') label : string)
	{
		this.server.emit('refreshusers', label);
		this.server.to(name + 'Chat').emit('pubmessage', label);
	}
	/*

	@SubscribeMessage('leaveallchatroom')
	leaveallchatroom()
	{

	}
	*/


	/*
	   @SubscribeMessage('findOneMessage')
	   findOne(@MessageBody() id: number) {
	   return this.messageService.findOne(id);
	   }

	   @SubscribeMessage('updateMessage')
	   update(@MessageBody() updateMessageDto: UpdateMessageDto) {
	   return this.messageService.update(updateMessageDto.id, updateMessageDto);
	   }

	   @SubscribeMessage('removeMessage')
	   remove(@MessageBody() id: number) {
	   return this.messageService.remove(id);
	   }
	   */
}
