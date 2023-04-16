import { Injectable, Inject, forwardRef} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository} from 'typeorm'
import {NotFoundException } from '@nestjs/common';
import { UserService } from '../../user/service/user.service';
import { PongEntity } from '../models/pong.entity';

import { UserEntity } from '../../user/models/user.entity';
import { PongGateway } from '../pong.gateway';

interface i_ball
{
	radius: number,
	x: number;
	y: number;
	speed_x: number;
	speed_y: number;
	status: number;
	tel: number
};

interface  i_score
{
	one: number
	two: number
};

export interface	achievement
{
	name: string;
	description: string;
};

@Injectable()
export class PongService {

	//Les service du channel, des muted et des banned entity directement ici
	constructor(
		@InjectRepository(PongEntity)
		private pongRepository: Repository<PongEntity>,

		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@Inject(forwardRef(() => UserService))
		private userService : UserService,
	)
	{
	}
	balls = new Map<string, i_ball>();
	scores = new Map<string, i_score>();
	teleport : number = 1;

	//ball:i_ball = {status:0, radius:5, x:400, y:300, speed_x:Math.random() * 3 + 0.1, speed_y:Math.random() * 3 + 0.1}
	//score:i_score= {one:0, two:0}

	/*
	function ballMove() {
		// Rebounds on top and bottom
		if (canvas.game.ball.y > canvas.height || canvas.game.ball.y < 0)
		{
			canvas.game.ball.speed_y *= -1;
		}
		if (canvas.game.ball.x > canvas.width - PLAYER_WIDTH) {
			collide(canvas.game.computer);
		} else if (canvas.game.ball.x < PLAYER_WIDTH) {
			collide(canvas.game.player);
		}
	
		canvas.game.ball.x += canvas.game.ball.speed_x;
		canvas.game.ball.y += canvas.game.ball.speed_y;
	}
	*/

	random_speed()
	{
		const norm = Math.random() * 1 + 1;
		let angle;
		if (Math.random() * 1  > 0.5)
		{
			angle = (Math.random() * Math.PI / 2) + (7 * Math.PI / 4);
		}
		else
		{
			angle = (Math.random() * Math.PI / 2) + (3 * Math.PI / 4);
		}
		return ({x: norm * Math.cos(angle), y: norm * Math.sin(angle)});
	}

	async isball(ballName: string)
	{
		return (this.balls.get(ballName))
	}

	async loadball(ballname : string)
	{
		if (this.balls.get(ballname) != undefined)
			return ({msg : 'already set'});
		const speed = this.random_speed();
		const newball : i_ball =  {tel : 1, status:0, radius:5, x:400, y:300, speed_x:speed.x, speed_y:speed.y}
		const newscore : i_score = {one:0, two:0};
		this.balls.set(ballname, newball);
		this.scores.set(ballname, newscore)
		return ({msg : 'the ball is ready'})
	}

		finish(ballname : string)
		{
			const ball = this.balls.get(ballname)
			if (ball == undefined)
				return;
			ball.x = 400;
			ball.y = 300;
			ball.speed_x = 0;
			ball.speed_y = 0;
			ball.status = 1;
		}

		finished(ballname: string)
		{
			const ball = this.balls.get(ballname);
			if (ball == undefined)
			{
				return (true)
			}
			if (ball.status == 1)
				return (true);
			return (false);
		}
	removeball(ballname: string)
	{
		if (this.balls.get(ballname) == undefined)
			return ({msg : 'ball did not exist'});
		this.balls.delete(ballname);
		this.scores.delete(ballname);
	}

	getScore(ballname : string) {
		const res = this.scores.get(ballname);
		if (res != null)
			return({one : res.one, two : res.two})
	}

	changeDirection(pos: number, ball : i_ball) {
		var impact = ball.y - pos - 5 / 2;
		var ratio = 100 / (5 / 2);
	
		// Get a value between 0 and 10
		ball.speed_y = Math.round(impact * ratio / 10);
	}

		reset(ball : i_ball, pos : number, player : string)
		{
			const speed = this.random_speed();
			ball.x = 400;
			ball.y = 300;
			ball.speed_x = speed.x;
			ball.speed_y = speed.y;
		}





		ballmove(pos: number, player : string, ballname : string, mode : string, pos1: number, pos2: number)
		{
			let ball = this.balls.get(ballname);
			let score = this.scores.get(ballname);
			const backtime = new Date();


			if (ball == undefined || score == undefined)
				return({msg: 'ball not found'});

			if (mode == 'Teleport')
			{
				let sectme = backtime.getSeconds() % 5 
				if (sectme % 5 == 0) 
				{
					if (ball.tel == 1)
					{
						ball.x = Math.random() * 100 + 350;
						ball.y = Math.random() * 75 + 262;

						ball.tel = 0;
						return ({x : ball.x, y : ball.y, goal:'zero'})
					}
				}
				else
				{
					ball.tel = 1;
				}
			}


			//faire une collision selon la position des deux raquettes
			if (ball.y > 600 || ball.y < 0)
			{
				ball.speed_y *=-1;
			}

			//A FAIRE
			//et qu'elle est au dessus ou en dessous de la raquette droite (data.pos2)
			// on reprend le code du marquage pour player2 
						//
						//
			//Si la balle est à --> droite 
			if (ball.x > 800 - 5)
			{
				//qu'elle est en dessous ou au dessus de la raquette
				if (ball.y < pos2 || ball.y > pos2 + 100 )
				{
				//incrementation du score, check du score : on marque ou on perd
				//c'est le player one qui à mit un point
					this.reset(ball, pos2, 'player2');
					score.one += 1;
					if (score.one == 7)
						return ({x:ball.x, y:ball.y, goal:'won1'});
					else
						return ({x:ball.x, y:ball.y, goal:'one'});
				}
				else //sinon c'est une collision
				{
					ball.speed_x *=-1;
					ball.x = 794;
					if (mode == 'Speedy')
					{
						if (Math.abs(ball.speed_x) < 20)
						{
							ball.speed_x *= 1.3;
						}
					}
					else
					{
						if (Math.abs(ball.speed_x) < 4)
						{
							ball.speed_x *= 1.1;
						}
					}
					return ({x:ball.x, y:ball.y, goal:'colision2'});
				}
			}//Si la balle est à est à gauche  <-- 
			else if (ball.x < 5 )
			{
				//qu'elle est au dessous ou en dessus de la raquette
				if (ball.y < pos1 || ball.y > pos1 + 100 )
				{
					//voir ce que fait reset
					this.reset(ball, pos1, 'player1');
					//incrementation du score 2 
					score.two += 1; 
					//soit on marque soit on gagne
					if (score.two == 7)
						return ({x: ball.x, y:ball.y, goal : 'won2'})
					else
						return ({x:ball.x, y:ball.y, goal:'two'});
					
				}	//sinon c'est une collision à gauche <--  
				else
				{
					//la balle change de sens en x
					ball.speed_x *=-1;
					ball.x = 6;
					if (Math.abs(ball.speed_x) < 20)
					{
						ball.speed_x *= 1.2;
					}
					
					return ({x:ball.x, y:ball.y, goal:'colision1'});
				}
			}
			else
			{

				ball.x += ball.speed_x;
				ball.y += ball.speed_y;
			}
			
			return ({x:ball.x, y:ball.y, goal:'zero'});
			//Si la balle est à gauche <--
			//et qu'elle est au dessus ou en dessous de la raquette gauche (data.pos1)
			// on reprend le code du marquage pour player1 


			//il faudrait que le serveur emit le score et le win aux deux
						//
						//


			//Si la balle est à est à --> droite ET qu'on est player2
		/*	if (ball.x > 800 - 5 && player == 'player2')
			{
				//qu'elle est en dessous ou au dessus de la raquette
				if (ball.y < pos || ball.y > pos + 100 )
				{
				//incrementation du score, check du score : on marque ou on perd
				//c'est le player one qui à mit un point
					this.reset(ball, pos, 'player2');
					score.one += 1;
					if (score.one == 7)
						return ({x:ball.x, y:ball.y, goal:'won1'});
					else
						return ({x:ball.x, y:ball.y, goal:'one'});
				}
				else //sinon c'est une collision
				{
					ball.speed_x *=-1;
					ball.x = 794;
					if (mode == 'Speedy')
					{
						if (Math.abs(ball.speed_x) < 20)
						{
							ball.speed_x *= 1.3;
						}
					}
					else
					{
						if (Math.abs(ball.speed_x) < 4)
						{
							ball.speed_x *= 1.1;
						}
					}
					return ({x:ball.x, y:ball.y, goal:'colision2'});
				}
			}//Si la balle est à est à gauche  <-- ET qu'on est player 1
			else if (ball.x < 5 && player == 'player1')
			{
				//qu'elle est au dessous ou en dessus de la raquette
				if (ball.y < pos || ball.y > pos + 100 )
				{
					//voir ce que fait reset
					this.reset(ball, pos, 'player1');
					//incrementation du score 2 
					score.two += 1; 
					//soit on marque soit on gagne
					if (score.two == 7)
						return ({x: ball.x, y:ball.y, goal : 'won2'})
					else
						return ({x:ball.x, y:ball.y, goal:'two'});
					
				}	//sinon c'est une collision à gauche <--  
				else
				{
					//la balle change de sens en x
					ball.speed_x *=-1;
					ball.x = 6;
					if (Math.abs(ball.speed_x) < 20)
					{
						ball.speed_x *= 1.2;
					}
					
					return ({x:ball.x, y:ball.y, goal:'colision1'});
				}
			}
			else
			{

				ball.x += ball.speed_x;
				ball.y += ball.speed_y;
			}
			
			return ({x:ball.x, y:ball.y, goal:'zero'});*/
		}




		async findOne(room: string)
		{
			const ret = await this.pongRepository.findOne({
				relations: 
				{
					players: true,
				},
				where:
				{
					roomName: room,
				},
	
			});

			return ret;
		}





	async findOnGoingGameByUser(username: string): Promise<PongEntity[]>
	{
		const gameList = await this.findOnGoingGames();
		if (!gameList)
			return null;

		var result = gameList.filter(obj => {
			return (obj.player1 === username ||  obj.player2 === username)
		})
		if (result.length)
			return result
		else
			return null;
	}

	async findOnGoingGames(): Promise<PongEntity[]>
	{
		const gameList = await this.findAll();
		var result = gameList.filter(obj => {
			return obj.status === 1
		})
		if (result.length)
			return result
		else
			return null;
	}


	async findOnGoingGamesByRoomName(roomName: string): Promise<PongEntity[]>
	{
		const gameList = await this.findAll();
		var result = gameList.filter(obj => {
			if ((obj.status === 1) && (obj.roomName === roomName))
			{
				return obj
			}
		})
		if (result.length)
		{
			return result
		}
		else
			return null;
	}

	async getEndedGame(username: string)
	{
		const gameList = await this.findPongByPlayer(username);
		var result = gameList.filter(obj => {
			return obj.status === 2
		})
		if (result.length)
		{
			return result
		}
		else
			return null
	}

	async findOnGoingGamesplayer(player : string): Promise<PongEntity | undefined>
	{
		const gameList = await this.findAll();
		var result = gameList.filter(obj => {
			return (obj.status === 1 && (obj.player1 == player || obj.player2 ==  player))
		})
		if (result.length)
			return result[0]
	}

	async findAll(): Promise<PongEntity[]>
	{
			const ret = await this.pongRepository.find(
			{
			   relations: 
				{
					players: true,
				},
			}
		);
		if (!ret)
			null
		return ret;
	}

	async findPongByPlayer(playerName: string) : Promise<PongEntity[]>
	{
		const ret = await this.pongRepository.find(
			{
			   relations: 
				{
					players: true,
				},
				where: [
				{
					player1: playerName,
				},
				{
					player2: playerName,
				}, 
				]
			}
		);
		if (!ret)
			null
		return ret;
	}

	async findPongByPlayerWinMode(playerName: string, mode: string) : Promise<PongEntity[]>
	{
		const ret = await this.pongRepository.find(
			{
			   relations: 
				{
					players: true,
				},
				where: 
				{
					winner: playerName,
					modeGame: mode,
				}
		

			}
		);
		if (!ret)
			return null;
		return ret;
	}


	async findCurPongByPlayers(player1: string, player2:string)
	{
		const room = player1 > player2 ? player1 + player2 : player2 + player1;
		const ret = await this.pongRepository.findOne(
			{
			   relations: 
				{
					players: true,
				},
				where: 
				{
					roomName: room,
					status: 1,
				}
			}
		);
		if (!ret)
			return null;
		return ret;
	}

	async savefinishedgame(player1 : string, player2 : string, score1 : number, score2 : number, winner : string)
	{
		let w;
		if (winner == player1)
			w = 1;
		else
			w = 2;
	
		const pong = await this.findCurPongByPlayers(player1, player2);

		const updatelvl = async () =>
		{
			await this.userService.updatelevel(player1, player2, w);
		}
		if (pong)
		{
			pong.status = 2;
			pong.score1 = score1;
			pong.score2 = score2;
			pong.winner = winner;
			updatelvl().then( () => {
				this.pongRepository.save(pong);
			})
		}

		return({msg:'finish'})
	}

	async getStats(name : string)
	{
		const user = await this.userService.findOne(name);
		const listgame = await this.findPongByPlayer(name);
		if (!listgame)
			return null;

		const nbgame = listgame.length;
		const iterator= listgame.values();

		let nbwin = 0;

		for (const value of iterator)
		{
			 if (value.winner == name)
			 {
				nbwin +=1 ;
			 }
		}

		return({level : user.level, nbgame : nbgame, nbwin: nbwin})
	}

	async getAchievments(name: string)
	{
		if (name == undefined)
		{
			return(["error"]);
		}

		const user = await this.userService.findOne(name);
		let res : achievement[] = [];
		const level = user.level;
		
		if (level.length == 0)
		{
			return (["error"]);
		}
		if (level.length >= 4)
		{
			const last3 = [...level].splice(-3);
			let sort3 = [...last3];
			sort3.sort();
			if (sort3.every((val, index) => val === last3[index]))
			{
				res.push({ name: 'Rampage', description: '4 levels down, 17 more to go'});
			}
		}

		if (level.length >= 5)
		{
			const last10 = [...level].splice(-4); //10
			let sort10 = [...last10];
			sort10.sort();
			if (sort10.every((val, index) => val === last10[index]))
			{
				res.push({ name: 'Unstoppable', description: 'You reached level 5, Eris is pleased'});
			}

			last10.reverse();
			if (sort10.every((val, index) => val === last10[index]))
			{
				res.push({ name: 'Good loser', description: "Don't feel bad, you're good at something. In that case, it's loosing 3 times in a row"});
			}
		}
		

		if (user.friends.length >= 2) //10
		{
			res.push({ name: 'Sociable Ponger', description: 'you have two or more friends, try to keep them'});
		}

		if (level[level.length -1] >= 1250)
		{
			res.push({ name: 'Pong Master', description: 'You reached a score of 1250'});
		}

		if (level[level.length -1] >= 1300)
		{
			res.push({ name: 'Pong Grandmaster', description: 'You reached a score of 1300'});
		}

		if (level[level.length -1] <= 1100)
		{
			res.push({ name: 'Newbie', description: 'Still a noop... for now.'});
		}

		const winstandard = await this.findPongByPlayerWinMode(name, 'Standard');
		if (winstandard.length >= 3) // 10
		{
			res.push({ name: 'King', description: 'You won 3 standard games and claimed your crown'});
		}

		const winspeedy = await this.findPongByPlayerWinMode(name, 'Speedy');
		if (winspeedy.length >= 3) // 10
		{
			res.push({ name: 'Faster than a bullet', description: 'Win 3 speedy games'});
		}

		const winteleport = await this.findPongByPlayerWinMode(name, 'Teleport');
		if (winteleport.length >= 3) //10
		{
			res.push({ name: 'Thinking with teleport', description: 'Win 3 teleport games'});
		}

		return(res);

	}


	async pongGameCreation(inviter: string, invited: string, mode: string) : Promise<{socketInviter: string, succed: boolean, roomName: string, msg: string}>
	{

			const userPlayer1 = await this.userService.findOne(inviter);
			const userPlayer2 = await this.userService.findOne(invited);

			//We can't send invitation if isPlaying or isInInviteProcess, so gameCreation can't exist in thoses cases

			const newGame = new PongEntity();
			newGame.player1 = inviter;
			newGame.player2 = invited;
			newGame.status = 1;
			newGame.roomName = inviter > invited ? inviter + invited : invited + inviter;
			newGame.modeGame = mode;

//			newGame.players.push(userPlayer1);
//			newGame.players.push(userPlayer2);

			newGame.score1 = 0;
			newGame.score2 = 0;

			newGame.players = [userPlayer1, userPlayer2];

			await this.pongRepository.save(newGame);

			userPlayer1.gameList.push(newGame);
			await this.userRepository.save(userPlayer1);

			userPlayer2.gameList.push(newGame);
			await this.userRepository.save(userPlayer2);

			return ({socketInviter: userPlayer1.socketIdPong, succed: true, roomName: newGame.roomName, msg: "succeded"});
	}
}
