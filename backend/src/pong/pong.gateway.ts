import { Res } from '@nestjs/common';
import {
		MessageBody,
		SubscribeMessage,
		WebSocketGateway,
		WebSocketServer,
		ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnGatewayDisconnect } from '@nestjs/websockets';
import { PongService } from "./service/pong.service"
import { UserService } from "../user/service/user.service"

@WebSocketGateway(8000, {cors: '*', namespace: "/pong"})
export class PongGateway implements OnGatewayDisconnect{
		constructor(
				private readonly pongService: PongService,
				private readonly userService: UserService,
		) {}

		private waitingPlayer: string[] = [];
		private  startingBlocks = new Map();
		private  counterGiveupGame = new Map();
		private  onGoingGames = new Map();

		@WebSocketServer()
		server: Server;


		//CONNEXION
		handleConnection(client: Socket) {
    }

		handleDisconnect(client: Socket): any
		{

				let i = 0;

				//Check if we emptied the room hrazanam
				this.server.in("hrazanamPong").fetchSockets().then((sockets) => {if (sockets[0] == undefined)
						{
										i++;
						}}
				);
				this.userService.deleteSocketBySocketIdPong(client.id);
		}

		@SubscribeMessage('Connexion')
		async HandleConnexion(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket)
		{
				mySocket.join(data.username + "Pong");
				let nbOfSockets = 0;
				this.server.in(data.username + "Pong").fetchSockets().then((sockets) => sockets.forEach(socket => {
						nbOfSockets++;
				}))
				this.userService.addSocketPong(data.username, mySocket.id);
		}

		//On logout here not handle disconnexion because we want to get rid of socket on disconnexion and not keeping it if no logout 
		@SubscribeMessage('Disconnect')
		async HandleDisconnect(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket)
		{

				if (this.waitingPlayer.length)
				{
						this.waitingPlayer.filter(function(item, index, array) {
								if (item === data.username)
								{
										array.splice(index, 1);
								}
						})
				}


				//Have to empty the socketPong A VOIR !!!!!!
				let nbOfSockets = 0;
				this.server.in(data.username + "Pong").fetchSockets().then((sockets) =>  
						{
								sockets.forEach((socket) =>  
										{
												socket.disconnect();
										}
								)
						}
				)

				this.userService.deleteSocketPong(data.username);
		}

		@SubscribeMessage('LogoutAllWindows')
		async LogoutAllWindows(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket,@Res({ passthrough: true }) Resp )
		{
				this.server.in(data.username + "Pong").fetchSockets().then((sockets) =>  
						{
								sockets.forEach((socket) =>  
										{
												this.server.to(socket.id).emit('getLogout'); //socket.on dans la navbar + bouton refuse et accept
										}
								)
						}
				)
		}


		//WAITING ROOM
		@SubscribeMessage('SearchForPlayer')
		async SearchForPlayer(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket)
		{


				let userLeave = false;
				if (this.waitingPlayer.length)
				{
						this.waitingPlayer.filter(function(item, index, array) {
								if (item === data.user)
								{
										array.splice(index, 1);
										userLeave = true;
								}
						})
				}

				if (!userLeave) 
				{
						if (this.waitingPlayer.length)
						{
								let opponent = this.waitingPlayer[0];
								this.waitingPlayer.pop()

								//Create a random mode
								const modenb = Math.floor(Math.random() * 3);
								let mode;
								switch (modenb) {
										case 0:
												mode = "Standard"
												break;
										case 1:
												mode = "Speedy"
												break;
										case 2:
												mode = "Teleport"
												break;
										default:
												mode = "Standard"
								}


								//Creation du jeu avant emit
								const ret = await this.pongService.pongGameCreation(opponent, data.user, mode)
								await this.server.to(opponent + "Pong").emit("FoundAGame1")
								await this.server.to(data.user + "Pong").emit("FoundAGame2")
								if (ret)
									await this.toggleTimeOut({player1: opponent, player2: data.user, roomName: ret.roomName})
						}
						else
						{
								this.waitingPlayer.push(data.user)
						}
				}


		}

		@SubscribeMessage('StopSearchForPlayer')
		async StopSearchForPlayer(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket)
		{
				if (this.waitingPlayer.length)
				{
						this.waitingPlayer.filter(function(item, index, array) {
								if (item === data.user)
								{
										array.splice(index, 1);
								}
						})
				}
		}

		//On login connexion here not handle connexion because we want to stock with connexion and not on login page
		


		@SubscribeMessage('sendInvitation') // socket emit dans le chat + redirection pong en mode waiting
		async sendInvitation(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket) {
				let resp: any;
				const ret = await this.userService.createGameInvitationProcess(data.inviter, data.invited, data.modeGame)
				if (!ret.status)
				{
						return {status: false, msg: "Someone already playing or is in process invitation"}
				}
				else
				{
						this.server.to(data.invited + "Pong").emit('getInvited', data); //socket.on dans la navbar + bouton refuse et accept
						return {status: true, msg: "Invitation succeded"}
				}
		}


		@SubscribeMessage('acceptInvitation') // socket emit : onClick accept navbar
		async acceptInvitation(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket) {

			const ret = await this.pongService.pongGameCreation(data.inviter, data.invited, data.mode);
			await this.userService.deleteGameInvitationProcess(data.inviter, data.invited);
			await this.server.to(data.inviter + "Pong").emit("isAccepted", {status: true, msg: "succeded"})
			await this.server.to(data.invited + "Pong").emit("haveAccept", {status: true, msg: "succeded"})
			await this.toggleTimeOut({player1: data.inviter, player2: data.invited, roomName: ret.roomName})
		}
		
		@SubscribeMessage('declineInvitation') // socket emit : onClick decline navbar
		async declineInvitation(@MessageBody() data: any) {

				const inviter = await this.userService.findOne(data.inviter);
				await this.userService.deleteGameInvitationProcess(data.inviter, data.invited);
				await this.server.to(data.inviter + "Pong").emit("isAccepted", {status: false, msg: "invitation declined" });
				await this.server.to(data.invited + "Pong").emit("haveAccept", {status: false, msg: "invitation declined" });

/*
				this.userService.findOne(data.inviter).then((inviter) => {

						this.userService.deleteGameInvitationProcess(data.inviter, data.invited).then(() => {
								this.server.to(data.inviter + "Pong").emit("isAccepted", {status: false, msg: "invitation declined" });
								this.server.to(data.invited + "Pong").emit("haveAccept", {status: false, msg: "invitation declined" });
						})
				})*/
		}

		

		@SubscribeMessage('cancelInvitation') // socket emit : onClick decline navbar
		async cancelInvitation(@MessageBody() data: any) {


				const invited = await this.userService.whoIsMyInvited(data.inviter);
				await this.userService.deleteGameInvitationProcess(data.inviter, invited);
				await this.server.to(invited + "Pong").emit("invitationIsCanceled");

		/*		this.userService.whoIsMyInvited(data.inviter).then((invited) => {
						this.userService.deleteGameInvitationProcess(data.inviter, invited).then(() => {
								this.server.to(invited + "Pong").emit("invitationIsCanceled");
						})
				})*/
		}

		//We call it if accept invitation OR find a player // during this time, can't create other game cause it exist
		async toggleTimeOut(data: any)
		{
				setTimeout(async() =>{

						//if onGoing map still no create (the two players didn't click on ready) && there's a game status 2 the BDD
						const findGameMap = this.onGoingGames?.get(data.roomName)
						const findGameBDD = await this.userService?.getOnGoingGame(data.player1)
						if ((!findGameMap || findGameMap == undefined) && (findGameBDD))
						{
										//set the BDD game srtatus to 1
										await this.pongService.savefinishedgame(data.player1, data.player2, 0, 0, "time out");
										this.startingBlocks?.delete(data.roomName)

										//save the status
										const myOpponant = await this.userService.findOneForInvit(data.player1)
										const mySelf = await this.userService.findOneForInvit(data.player2)
										let user1;
										let user2;
										if (!myOpponant.refreshToken)
											user1 = await this.userService.setStatus(data.player1, 0);
										else
											user1 = await this.userService.setStatus(data.player1, 1);
										if (!mySelf.refreshToken)
											user2 = await this.userService.setStatus(data.player2, 0);
										else
											user2 = await this.userService.setStatus(data.player2, 1);

										if (user1.status == 1 && user2.status == 1)
											this.server.emit("changestatus")
										//could seem useless if it hasn't been created but you know sometimes devices are very fast
										this.pongService.finish(data.roomName);
										await this.pongService.removeball(data.roomName);
										this.onGoingGames?.delete(data.roomName)

										//send the end to people after everything's closed
										await this.server.to("PongPage").emit('endOfMatch', {roomName: data.roomName});
										await this.server.to(data.player2 + 'Pong').emit('victory', {player : 'one', score: {one: 0, two: 0}});
										await this.server.to(data.player1 + 'Pong').emit('victory', {player : 'one', score: {one: 0, two: 0}});

						}
				}, 15000); //After 10 seconde (5 second for redirection front) every player come in the page before onGoingGames map has been created
		}

		//Ce qui cliquent : les joueur qui arrivent sur pong page au debut de match en attente (donc il y a un on goingGame) et qui on leur status à 1
		@SubscribeMessage('playerReady')
		async playerReady(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket)
		{

				//si pas de starting block ET ongoingGame map à pas été créé --> Le premier user, la première fois
				//Le cas jeu on cours et plus de starting block (en plein match) impossible car si on est en plein match on peux pas cliquer sur ready
				//Mais quand même on va protéger haha avec le status du joueur pour les coquin qui cliquent qpres
				//Rqjouter un emit a moi même pour enelever le modal (plus tard)
				const user_status = await this.userService.getstatus(data.username)
				if ((this.startingBlocks.get(data.readyName) == undefined) && !this.onGoingGames.get(data.readyName) && user_status.status != 2 )
				{
					//WARNING SEND SOCKET TO SHUT DOWN THE WAITMSG

					await this.server.to(data.username + "Pong").emit("hideWait");
					this.startingBlocks.set(data.readyName, [data.username]);
					return ({msg: 'first'});
				}
				else
				{
					if ((this.startingBlocks.get(data.readyName).length) && (this.startingBlocks.get(data.readyName)[0] == data.username))
					{
							return ({msg: 'myself'});
					}
					else
					{
						const ballMsg = await this.pongService.loadball(data.readyName);
						if (ballMsg.msg == 'the ball is ready')
						{
							const user1 = await  this.userService.setStatus(data.player1, 2);
							const user2 = await this.userService.setStatus(data.player2, 2);
							this.startingBlocks.delete(data.readyName);
							this.onGoingGames.set(data.readyName, {pos1: 0, pos2: 0, roomname: data.readyName});
								if (user1.status == 2  && user2.status == 2)
								{
									this.server.to(data.username + "Pong").emit("hideWait");
								 	this.server.to(data.player1 + "Pong").emit("ledzgo")
								 	this.server.to(data.player2 + "Pong").emit("ledzgo")
									this.server.emit("changestatus")
								}

						}

					}
				}
		}



		@SubscribeMessage('loadball')
		async loadball(@MessageBody() data : any) : Promise<any>
		{
				const myBall = await this.pongService.loadball(data.ballname)
				if (myBall)
					return (myBall);
		}

		@SubscribeMessage('gameMonitor')
		async gameMonitor(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket) {

			//Gestion de la room en attente le monitor 

			//Pour le joueur 1 qui se déco
			const ret1 = await this.server.in(data.player1 + 'Pong').fetchSockets();
			const ret2 = await this.server.in(data.player2 + 'Pong').fetchSockets();
			const findGameMap = this.onGoingGames?.get(data.roomName)
			if ((!ret1[0] || !ret2[0]) && (findGameMap && (findGameMap != undefined)))
			{
				if (!ret1[0])
					this.pongService.savefinishedgame(data.player1, data.player2, 0, 0, data.player2)
				else
					this.pongService.savefinishedgame(data.player1, data.player2, 0, 0, data.player1)
				const status1 = await this.userService.getstatus(data.player1)
				const status2 = await this.userService.getstatus(data.player2)
				let user1;
				let user2;
				if (status1.status == 0)
					user1 = await this.userService.setStatus(data.player1, 0)
				else
					user1 = await this.userService.setStatus(data.player1, 1)

				if (status2.status == 0)
					user2 = await this.userService.setStatus(data.player2, 0)
				else
					user2 = await this.userService.setStatus(data.player2, 1)

				if (user1.status == 1 && user2.status == 1)
						this.server.emit("changestatus")

				this.pongService.finish(data.roomName)
				this.pongService.removeball(data.roomName);
				this.onGoingGames.delete(data.roomName)
				await this.server.to(data.roomName).emit('endOfMatch', {roomName: data.roomName});
				await this.server.to(data.player2 + 'Pong').emit('victory', {player : 'one', score: {one: 0, two: 0}});
				await this.server.to(data.player1 + 'Pong').emit('victory', {player : 'one', score: {one: 0, two: 0}});
			}

		}


		@SubscribeMessage('racketPosition')
		async HandleRacket(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket) {


			//Protect action if on going game doesn't exist before ledzgo and after delete
			if (this.onGoingGames?.get(data.roomName))
			{
				if (data.player == "player1")
					this.onGoingGames.set(data.roomName, {pos1: data.position, pos2: this.onGoingGames.get(data.roomName).pos2, roomname: data.roomName});
				else
					this.onGoingGames.set(data.roomName, {pos1: this.onGoingGames.get(data.roomName).pos1, pos2: data.position, roomname: data.roomName});


				const ballname = data.myname > data.opponant ? data.myname + data.opponant : data.opponant + data.myname 
				const roomname = this.onGoingGames.get(data.roomName).roomname;
				const ball = this.pongService.ballmove(data.position, data.player, ballname, data.mode, this.onGoingGames.get(data.roomName).pos1, this.onGoingGames.get(data.roomName).pos2);

				const score = this.pongService.getScore(ballname);

				if (this.pongService.isball(ballname) == undefined)
				{
					
						return({msg:'finish', score : score})
						
				}

				if (roomname == undefined || score == undefined)
				{
						return ;
				}

				this.server.to(data.opponant + 'Pong').emit('racketPosition', {position : data.position});
				this.server.to(data.myname + 'Pong').emit('ballPosition', {ball : ball});
				this.server.to(data.opponant + 'Pong').emit('ballPosition', {ball : ball});
				this.server.to(roomname).emit('racketSpect', {player : data.player, position : data.position, ball : ball});

				if (ball.goal == 'one') //si c'est le player 1 qui à marqué 
				{
						await this.server.to(roomname).emit('goal', {player : 'one', score : score, ball : ball});

						await this.server.to(data.opponant + 'Pong').emit('goal', {player : 'one', score : score, ball : ball});
						await this.server.to(data.myname + 'Pong').emit('goal', {player: 'one', score : score, ball : ball});
						return ;
				}

				if (ball.goal == 'two')//si c'est le player 2 qui à marqué
				{
						await this.server.to(roomname).emit('goal', {player : 'two', score : score, ball : ball});

						await this.server.to(data.opponant + 'Pong').emit('goal', {player : 'two', score : score, ball : ball});
						await this.server.to(data.myname + 'Pong').emit('goal', {player: 'two', score : score, ball: ball});
						return ;
				}

				if (ball.goal == 'won1')//si c'est le player 1 qui à gagné
				{

						//Set the status to both at 1 or 0
						const player1 = await this.userService.findOneForInvit(data.myName)
						const player2 = await this.userService.findOneForInvit(data.opponant)
						let user1;
						let user2;
						if (!player1.refreshToken)
							user1 = await this.userService.setStatus(data.myname, 0);
						else
							user1 = await this.userService.setStatus(data.myname, 1);
						if (!player2.refreshToken)
							user2 = await this.userService.setStatus(data.opponant, 0);
						else
							user2 = await this.userService.setStatus(data.opponant, 1);

						if (user1.status == 1 && user2.status == 1)
						{
								await this.server.emit("changestatus")
						}

						//Remove ball delete onGoingGame emit to people save the game Always the emit at the end
						let winner;
						if (data.player == 'player1')
							winner = data.myname;
						else
							winner = data.opponant;
						await this.pongService.savefinishedgame(data.myname, data.opponant, score.one, score.two, winner);
						this.pongService.finish(ballname);
						this.pongService.removeball(ballname);
						this.onGoingGames.delete(data.roomName)

						await this.server.to(data.roomName).emit('endOfMatch', {roomName: data.roomName, score: score});
						await this.server.to(data.myname + 'Pong').emit('victory', {player : 'one', score : score});
						await this.server.to(data.opponant + 'Pong').emit('victory', {player : 'one', score : score});
						return ({msg: 'finish', player : 'one', score : score });
				}

				if (ball.goal == 'won2')//si c'est le player 1 qui à gagné
				{
						//Set the status to 1 or 0
						const player1 = await this.userService.findOneForInvit(data.myname)
						const player2 = await this.userService.findOneForInvit(data.opponant)
						let user1;
						let user2;
						if (!player1.refreshToken)
							user1 = await this.userService.setStatus(data.myname, 0);
						else
							user1 = await this.userService.setStatus(data.myname, 1);
						if (!player2.refreshToken)
							user2 = await this.userService.setStatus(data.opponant, 0);
						else
							user2 = await this.userService.setStatus(data.opponant, 1);

						if (user1.status == 1 && user2.status == 1)
						{
								await this.server.emit("changestatus")
						}

						let winner;
						if (data.player == 'player2')
							winner = data.myname;
						else
							winner = data.opponant;
						await this.pongService.savefinishedgame(data.myname, data.opponant, score.one, score.two, winner);
						this.pongService.finish(ballname)
						this.pongService.removeball(ballname);
						this.onGoingGames.delete(data.roomName)

						await this.server.to(data.roomName).emit('endOfMatch', {roomName: data.roomName, score: score});
						await this.server.to(data.myname + 'Pong').emit('victory', {player : 'two', score : score});
						await this.server.to(data.opponant + 'Pong').emit('victory', {player : 'two', score : score});
						return ({msg: 'finish', player : 'two', score : score})
				}
			}

		}	


		//Pour la room du jeu qu'on regarde
		//Rappel pour sa propre room --> directement dans connexion et deconnexion
		@SubscribeMessage('joinMyPongRoom')
		HandleJoinRoom(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket) {
				mySocket.join(data.myPongRoom);
		}

		@SubscribeMessage('leavePongRoom')
		HandleLeaveRoom(@MessageBody() data: any, @ConnectedSocket() mySocket: Socket) {
				mySocket.leave(data.myPongRoom);
		}

}
