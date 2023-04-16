import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';

import { Server } from 'socket.io';
import { Socket } from 'socket.io';

import { OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Injectable, Inject, forwardRef} from '@nestjs/common';


@Injectable()
@WebSocketGateway(8000, {cors: "*", namespace: "/connexion"})
export class ConnexionGateway implements OnGatewayDisconnect, OnGatewayInit{
	constructor(
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
				this.server.in("hrazanamConnexion").fetchSockets().then((sockets) => {if (sockets[0] == undefined)
						{
										i++;
						}}
				);
	}


		@SubscribeMessage('Connexion')
		async HandleConnexion(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket)
		{
				mySocket.join(data.username + "Connexion");
				let nbOfSockets = 0;
				this.server.in(data.username + "Connexion").fetchSockets().then((sockets) => sockets.forEach(socket => {
						nbOfSockets++;
				}))
		}

		@SubscribeMessage('Disconnect')
		async HandleDisconnect(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket)
		{


				let nbOfSockets = 0;
				this.server.in(data.username + "Connexion").fetchSockets().then((sockets) =>  
						{
								sockets.forEach((socket) =>  
										{
												socket.disconnect();
										}
								)
						}
				)

		}


				
	   @SubscribeMessage('changestatus')
	   async changestatus(@MessageBody() data : any, @ConnectedSocket() mySocket : Socket)
	   {

		   this.server.emit('changestatus', {name : data.name, status: data.status});

			return ;
		   //this.server.to('Connexion').emit('changestatus', {name : data.name, status: data.status});
	   }
}
