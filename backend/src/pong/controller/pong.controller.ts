import {Controller, Query, UseGuards, Request, Res} from '@nestjs/common'
import { Jwt2faAuthGuard } from '../../auth/jwt-2fa-auth.guard';
import { Post, Body, Get, Delete, Param, Put } from '@nestjs/common'
import { PongService } from '../service/pong.service'
import { PongEntity } from '../models/pong.entity';
import { achievement } from '../service/pong.service';
@Controller('pong')
export class PongController {
/*add service here*/
	constructor (
		private pongService : PongService
	) {}

	
	@UseGuards(Jwt2faAuthGuard)
	@Get('endedGame/:username')
	async getEndedGameByPlayer(@Param("username") username: string) {
		const completeList = await this.pongService.getEndedGame(username)
		if (!completeList)
				return {msg: 'empty'};
		const secureList = completeList.map(obj => ({"player1":obj.players[0].name, "player2":obj.players[1].name, "score1": obj.score1, "score2": obj.score2, "nickname1":obj.players[0].nickname,"nickname2":obj.players[1].nickname, "winner": obj.winner })); 
		return secureList;
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get('onGoingGameByPlayer/:username')
	async getOnGoingGameByPlayer(@Param("username") username: string) : Promise<any> {
		const completeList =	await this.pongService.findOnGoingGameByUser(username)
		if (!completeList)
			return {msg: "no games"};
		const secureList = completeList.map(obj => ({"player1":obj.players[0].name, "player2":obj.players[1].name, "score1": obj.score1, "score2": obj.score2, "nickname1":obj.players[0].nickname,"nickname2":obj.players[1].nickname, "winner": obj.winner, "roomName": obj.roomName, "modeGame": obj.modeGame })); 
		return secureList 
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get('onGoingGames')
	async getOnGoingGames() : Promise<any> {
		const completeList = await this.pongService.findOnGoingGames()
		if (!completeList)
			return ({msg: 'no games'});
		const secureList = completeList.map(obj => ({"player1":obj.players[0].name, "player2":obj.players[1].name, "score1": obj.score1, "score2": obj.score2, "nickname1":obj.players[0].nickname,"nickname2":obj.players[1].nickname, "winner": obj.winner, "roomName": obj.roomName })); 
		return secureList 
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get('onGoingGamesByRoom/:roomName')
	async getOnGoingGamesByRoom(@Param("roomName") roomName: string) : Promise<any[]> {
		const completeList =  await this.pongService.findOnGoingGamesByRoomName(roomName)
		if (!completeList)
			return ([{msg: 'no games'}]);
		const secureList = completeList.map(obj => ({"player1":obj.players[0].name, "player2":obj.players[1].name, "score1": obj.score1, "score2": obj.score2, "nickname1":obj.players[0].nickname,"nickname2":obj.players[1].nickname, "winner": obj.winner, "roomName": obj.roomName, "modeGame": obj.modeGame })); 
		return secureList 
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get('allGames')
	async getAllGames() {
		const completeList = await this.pongService.findAll()
		if (!completeList)
			return ([{msg: 'no games'}]);
		const secureList = completeList.map(obj => ({"player1":obj.players[0].name, "player2":obj.players[1].name, "score1": obj.score1, "score2": obj.score2, "nickname1":obj.players[0].nickname,"nickname2":obj.players[1].nickname, "winner": obj.winner })); 
		return secureList;
	}

	@UseGuards(Jwt2faAuthGuard)
	@Post('getStats')
	async getStats(@Body() body)
	{
		const my_stat = await  this.pongService.getStats(body.name)
		if (!my_stat)
			return ({msg: "no stats"})
		return (await this.pongService.getStats(body.name));
	}

	@UseGuards(Jwt2faAuthGuard)
	@Post('getAchievements')
	async getAchievments(@Body() body)
	{
		return (await this.pongService.getAchievments(body.name));
	}

}
