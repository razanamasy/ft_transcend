import { Injectable, NotFoundException, Inject, forwardRef} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { UserEntity } from '../models/user.entity'
import { UserI, PublicUserI } from '../models/user.interface'
import { SChanService } from '../../schan/service/schan.service';
import { SChanEntity } from '../../schan/models/schan.entity';
import { PongEntity } from '../../pong/models/pong.entity';

@Injectable()
export class UserService {

	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,


		@InjectRepository(SChanEntity)
		private chanRepository: Repository<SChanEntity>,
		@Inject(forwardRef(() => SChanService))
		private chanservice : SChanService,
	)
	{}

	//AUTHENTICATION
	async setStatus(name: string, myStatus: number): Promise <{name: string, status: number}>
	{
		const myUser = await this.findOneForInvit(name);

		myUser.status = myStatus;
		return (await this.userRepository.save(myUser));
	}

	async getstatus(name : string)
	{
		const myUser = await this.findOneForInvit(name);
		return ({status : myUser.status});
	}

	async isRefreshMatch(refreshToken: string, name: string)
	{
		const my_user = await this.findOneForInvit(name);
		if (my_user.refreshToken)
		{
			return (await bcrypt.compareSync(refreshToken, my_user.refreshToken));
		}
		else
		{
			return false
		}
	}

	async setRefreshToken(refreshToken: string, name: string)
	{
		const my_user = await this.findOneForInvit(name);
		my_user.refreshToken = await bcrypt.hashSync(refreshToken, 13);
		return (await this.userRepository.save(my_user));
	}

	async unsetRefreshToken(name: string)
	{
		const my_user = await this.findOne(name);
		my_user.refreshToken = null;

		return (await this.userRepository.save(my_user));
	}

	async turnOnTwoFactorAuthentication(name: string) {
		const my_user: UserI  = await this.findOne(name);
		my_user.enable2FA = true;

		return (await this.userRepository.save(my_user));
	}

	async turnOffTwoFactorAuthentication(name: string) {
		const my_user: UserI  = await this.findOne(name);
		my_user.enable2FA = false;

		return (await this.userRepository.save(my_user));
	}

	async setTwoFactorAuthenticationSecret(secret: string, name: string) {
		const my_user: UserI  = await this.findOne(name);
		my_user.twoFactorAuthenticationSecret = secret;

		return (await this.userRepository.save(my_user));
	}

	async add(user: any) {
		const checkUser = await this.findOneStrict(user.name);
		if (checkUser)
			return false;
		user.mdp = bcrypt.hashSync(user.mdp, 13);
		if (!user.nickname)
			user.nickname = "test";
		await this.userRepository.save(user);
		const my_user = await this.findOne(user.name);
		my_user.level = [0];
		return (await this.userRepository.save(user));
	}

	async findOneByNickName(_nickname: string)
	{
		const ret = await this.userRepository.findOne(
			{
				relations: 
				{
					friends: true,
				},
				where: 
				{
					nickname: _nickname
				}
			}
		);
		if (!ret)
			return null;
		return ret;
	}

	//ALL FIND/DELETE/ADD/MODIFY
	async findOneStrict(_name: string)
	{
		const ret = await this.userRepository.findOne(
			{
				where: 
				{
					name: _name,
				}
			}
		);
		if (!ret)
			return null;
		return ret;
	}
	
	
		//use in user invitation 
	async findOneForInvit(_name: string)
	{
		const ret = await this.userRepository.findOne(
			{
				relations: 
				{
					friends: true,
				},
				where: 
				{
					name: _name
				}
			}
		);
		if (!ret)
			return null;
		return ret;
	}

		//use in scchan load message and is blocked
	async findOneForLoadMessage(_name: string)
	{
		const ret = await this.userRepository.findOne(
			{
				relations: 
				{
					blocked : true,
				},
				where: 
				{
					name: _name
				}
			}
		);
		if (!ret)
			return null;
		return ret;
	}

	async findOne(_name: string)
	{
		const ret = await this.userRepository.findOne(
			{
				relations: 
				{
					friends: true,
					channels: true,
					blocked : true,
					gameList : true,
				},
				where: 
				{
					name: _name
				}
			}
		);
		if (!ret)
			return undefined
		return ret;
	}


	async findOneBySocketChat(_socketId: string)
	{
		const ret = await this.userRepository.findOne(
			{
				relations:
				{
					friends: true,
					channels: true,
				},
				where:
				{
					socketIdChat: _socketId
				}
			}
		);
		if (!ret)
			return null;
		return ret;
	}

	async findOneBySocketPong(_socketId: string)
	{
		const ret = await this.userRepository.findOne(
			{
				relations: 
				{
					friends: true,
					channels: true,
				},
				where: 
				{
					socketIdPong: _socketId
				}
			}
		);
		if (!ret)
			return undefined;
		return ret;
	}

	async deleteOne(id: number)
	{
		return (this.userRepository.delete(id));
	}

	async updateMdp(name: string, mdp: string)
	{
		const my_user: UserI  = await this.findOne(name);
		my_user.mdp = bcrypt.hashSync(mdp, 13);
		return (await this.userRepository.save(my_user));
	}

	async updateName(name: string, newName: string)
	{
		const my_user = await this.findOneForInvit(name);
		const exist = await this.findOneByNickName(newName);
		if (exist)
				return (false);
		my_user.nickname = newName;
		return (await this.userRepository.save(my_user));
	}

	//FRIENDS
	async deleteFriend(userName: string, userFriendName: string)
	{
		const user = await this.findOne(userName);
		const friendList = user.friends;
		var result = friendList.filter((obj, index, arr) => {
			if (obj.name === userFriendName)
			{
				arr.splice(index, 1);
				return index
			}
		})
		this.userRepository.save(user)
	}

	async deleteUser(userName: string, label: string)
	{
		const user = await this.findOne(userName);
		const chanList = user.channels;
		var result = chanList.filter((obj, index, arr) => {
			if (obj.label === label)
			{
				arr.splice(index, 1);
				return index
			}
		})
		this.userRepository.save(user)
	}

	async addFriend(userName: string, userFriendName: string)
	{
		const user = await this.findOne(userName);
		const friend = await this.findOne(userFriendName);
		user.friends.push(friend)
		//= [user, friend];
		this.userRepository.save(user)
	}

	async findAll(): Promise<UserEntity[]>
		{
			return (this.userRepository.find());
		}

	async findFriends(userName: string): Promise<UserEntity[]>
		{
			const user = await this.findOne(userName);
			return user.friends;
		}

	async isFriend(userName: string, friendName: string): Promise<boolean> {

		const user = await this.findOne(userName);
		const friendList = user.friends;
		var result = friendList.filter(obj => {
			return obj.name === friendName
		})
		if (result.length)
		return true
		else
		return false
	}



	//INVITATION PROCESS
	async createGameInvitationProcess(inviter: string, invited: string, modeGame: string) : Promise<{status: boolean}> 
		{
			const myInviter = await this.findOneForInvit(inviter);
			const myInvited = await this.findOneForInvit(invited);

			if (await this.isInInviteProcess(inviter) || await this.isInInviteProcess(invited))
			{
				return ({status: false});
			}
			if (await this.isPlaying(inviter) || await this.isPlaying(invited))
			{
				return ({status: false});
			}


			myInviter.invited = invited;
			myInvited.inviter = inviter;
			myInvited.modeGameInvitation = modeGame;
			await this.userRepository.save(myInviter);
			await this.userRepository.save(myInvited);
			return ({status: true});
		}

		async whoIsMyInvited(inviter: string) : Promise<string | null>
		{
			let myInvited: any;
			const myInviter = await this.findOneForInvit(inviter);
			myInvited = myInviter.invited

			if (myInvited == null)
				return null	
			else
			{
				const ret = await this.findOneForInvit(myInvited);
				return ret.name;
			}
		}

	async deleteGameInvitationProcess(inviter: string, invited: string) : Promise<string>
		{
			const myInviter = await this.findOneForInvit(inviter);
			const myInvited = await this.findOneForInvit(invited);




				myInviter.invited = null;
				myInviter.inviter = null;
				myInviter.modeGameInvitation = null;

				myInvited.inviter = null;
				myInvited.invited = null;
				myInvited.modeGameInvitation = null;

			await this.userRepository.save(myInviter);
			await this.userRepository.save(myInvited);
			return (myInvited.socketIdPong);
		}


	async isInInviteProcess(username: string)
	{
		const user = await this.findOneForInvit(username);

		if ((user.invited) || (user.inviter))
		{
			return (true);
		}
		return (false);
	}

	async isInviter(username: string)
	{
		const user = await this.findOneForInvit(username);

		if ((user.invited))
		{
			return (true);
		}
		return (false);
	}

	async isInvited(username: string)
	{
		const user = await this.findOneForInvit(username);

		if ((user.inviter))
		{
			return (true);
		}
		return (false);
	}

	//GAME AND STAT
	
	async setSearchMode(username: string, mode: boolean)
	{
		const user = await this.findOne(username);
		//A VOIR SI VRAIMENT UTILE
	}

	async getEndedGame(username: string)
	{
		const user = await this.findOne(username);
		const gameList = user.gameList;
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

	async getOnGoingGame(username: string)
	{
		const user = await this.findOne(username);
		const gameList = user.gameList;
		var result = gameList.filter(obj => {
			return obj.status === 1
		})
		if (result.length)
			return result
		else
			return null
	}

	async isPlaying(username: string): Promise<boolean> {

		const user = await this.findOne(username);
		const gameList = user.gameList;
		var result = gameList.filter(obj => {
			return obj.status === 1
		})
		if (result.length)
		{
			return true
		}
		else
		{
			return false
		}
	}


	async updatelevel(name1: string, name2: string, win: number)
	{
		const player1 = await this.findOne(name1);
		const player2 = await this.findOne(name2);




		const lv1 = player1.level[player1.level.length - 1];
		const lv2 = player2.level[player2.level.length - 1];

		const diflevel = Math.abs(lv1 - lv2);
		const pfactor = 1 / (1 + Math.pow(10, -(diflevel / 400)));
		const gain = 20 * (1 - pfactor);

		if (win == 1)
		{
			player1.level.push(Math.round(lv1 + gain));
			player2.level.push(Math.round(lv2 - gain));
		}

		if (win == 2)
		{
			player1.level.push(Math.round(lv1 - gain));
			player2.level.push(Math.round(lv2 + gain));
		}

		this.userRepository.save(player1);
		this.userRepository.save(player2);
	}

	//User.Pong Socket SERVICE
	async addSocketPong(username:string, socketId: string)
	{
		const myUser = await this.findOne(username);
		myUser.socketIdPong = socketId;
		this.userRepository.save(myUser);
	}

	async deleteSocketPong(username:string)
	{
		const myUser = await this.findOne(username);
		myUser.socketIdPong = null; 
		this.userRepository.save(myUser);
	}

	async deleteSocketBySocketIdPong(socketId: string)
	{
		const myUser = await this.findOneBySocketPong(socketId);
		if (myUser != undefined)
		{
			myUser.socketIdPong = null; 
			this.userRepository.save(myUser);
		}
	}

	//User/Chat socket Service
	async addSocketChat(username:string, socketId: string)
	{
		const myUser = await this.findOne(username);
		myUser.socketIdChat = socketId;
		this.userRepository.save(myUser);
	}

	async deleteSocketChat(username:string)
	{
		const myUser = await this.findOne(username);
		myUser.socketIdChat = null; 
		this.userRepository.save(myUser);
	}

	async deleteSocketBySocketIdChat(socketId: string)
	{
		const myUser = await this.findOneBySocketChat(socketId);
		if (myUser)
		{
			myUser.socketIdChat = null; 
			this.userRepository.save(myUser);
		}
	}

	//CHAT
	async isBlocked(user : string, blockedornot : string) : Promise<boolean>
		{

			let ret = false;

			const userToCheck = await this.findOne(user);


			userToCheck.blocked.map((listblock) =>{
				if (listblock.name == blockedornot)
					ret = true;
			})

			return (ret);
		}

	async addblock(user: string, blocked: string)
	{
		const usr = await this.findOne(user);
		const blk = await this.findOne(blocked);


		usr.blocked.push(blk);


		this.userRepository.save(usr)
	}

	async unblock(user: string, unblocked: string)
	{
		const usr = await this.findOne(user);
		const blocklist = usr.blocked;
		blocklist.filter((obj, index, arr) => {
			if (obj.name === unblocked)
			{
				arr.splice(index, 1);
				return index
			}
		})
		this.userRepository.save(usr)
	}

	async chanfromuser(name : string) 
	{
		const usr = await this.findOne(name);
		return (usr.channels);
	}

	async searchan( name : string, label : string)
	{
		const usr = await this.findOne(name);

		const chan = await this.chanservice.findOne(label);

		if (chan == undefined)
			return("undefined")

		if (chan.status == 1 || chan.status == 3)
		{
			const invited = chan.invited.some((str) => str == name)
			if (!invited)
			{
				return ("not invited");
			}
		}

		const ret = chan.bannedList.some((banl) => banl.username == name)

		if (ret == true)
		{
			return ("banned");
		}

		const alreadyonit = usr.channels.some((ch) => ch.label == label)
		if (alreadyonit == true)
		{
			return (chan.label);
		}

		const push_user = async () =>
		{
			await usr.channels.push(chan);
		}

		const push_chan = async () =>
		{
			await chan.users.push(usr);
		}

		push_user().then(() => {
			this.userRepository.save(usr).then( () => {
				push_chan().then( () => {
					this.chanRepository.save(chan);
				})
			})
		})
		return ("added");
	}
}
