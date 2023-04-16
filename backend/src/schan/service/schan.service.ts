import { Injectable, Inject, forwardRef} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm'
import { SChanEntity } from '../models/schan.entity'
import { Repository} from 'typeorm'
import { ChanDTO } from '../models/schan.interface';
import { LargeNumberLike } from 'crypto';
import {NotFoundException } from '@nestjs/common';
import {SMessageEntity} from '../../smessage/models/smessage.entity'
import { MutedUserEntity } from '../models/muted_user.entity'
import { BannedUserEntity } from '../models/banned_user.entity'
import {Message} from '../../smessage/models/smessage.interface'
import { UserService } from '../../user/service/user.service';

import { UserEntity } from '../../user/models/user.entity';
@Injectable()
export class SChanService {

	//Les service du channel, des muted et des banned entity directement ici
	constructor(
		@InjectRepository(SChanEntity)
		private SCRepository: Repository<SChanEntity>,

		@InjectRepository(SMessageEntity)
		private SMessageRepository: Repository<SMessageEntity>,

		@InjectRepository(MutedUserEntity)
		private mutedUserRepository: Repository<MutedUserEntity>,

		@InjectRepository(BannedUserEntity)
		private bannedUserRepository: Repository<BannedUserEntity>,

		@Inject(forwardRef(() => UserService))
		private userService:UserService,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>


	)
	{}
	timermute ;
	timerban ;
	isunmute : boolean;
	isunban : boolean;

	/*
	   async add(sc: ChanDTO): Promise<SChanEntity> {
	   return (this.SCRepository.save(sc));
	   }
	   */

	async findAll(): Promise<SChanEntity[]>
	{
		return (await this.SCRepository.find());
	}

	async findChan(label : string): Promise<SChanEntity>
	{
		return (await this.SCRepository.findOneByOrFail({label: label}));
	}

	/*
	   async updateonline(label: string, joiner: string)
	   {
	   const chan: ChanDTO  = await this.SCRepository.findOneByOrFail({label : label});
	   if (chan.online.find(e => e == joiner) == undefined)
	   chan.online.push(joiner);
	   else
	   chan.online = chan.online.filter(e => e != joiner)

	   return (this.SCRepository.save(chan));
	   }



	   async adm(label : string, admin : string)
	   {
	   const chan: ChanDTO  = await this.SCRepository.findOneByOrFail({label : label});
	   if (chan.admins.find(e => e== admin) == undefined)
	   chan.admins.push(admin);
	/*
	else
	chan.banlist = chan.banlist.filter(e => e != admin)


	return (this.SCRepository.save(chan));
	}
	*/

	async findOne(_label: string)
	{
		const ret = await this.SCRepository.findOne({
			relations: 
				{
				messages: { user: true, },
				users: true,
				mutedList: true,
				bannedList: true,
				admins: true,
				owner: true
			},
			where:
				{
				label: _label,
			},

		});
		return ret;
	}

	async findOneforOwner(_label: string)
	{
		const ret = await this.SCRepository.findOne({
			relations: 
				{
				owner: true
			},
			where:
				{
				label: _label,
			},

		});
		return ret;
	}

	//SERVICE MUTED ENTITY
	async findOneMuted(_label: string, _username: string)
	{
		const ret = await this.mutedUserRepository.findOne({
			relations: 
				{
				muteChan: true,
				muteUser: true,
			},
			where:
				{
				username: _username,
				label: _label
			},

		});
		return ret;
	}
	async deleteOneMuted(_label: string,_username: string)
	{
		return	await this.mutedUserRepository.delete({ username: _username, label: _label });
		//	return (this.userRepository.delete());
	}


	//SERVICE BANNED ENTITY
	async findOneBanned(_label: string,_username: string)
	{
		const ret = await this.bannedUserRepository.findOne({
			relations: 
				{
				banChan: true,
				banUser: true,
			},
			where:
				{
				username: _username,
				label: _label
			},

		});
		return ret;
	}

	async deleteOneBanned(_label: string,_username: string)
	{
		return	await this.bannedUserRepository.delete({ username: _username, label: _label });
		//		return (this.userRepository.delete(id));
	}

	async addmsginchan(name : string, text : string, label : string)
	{
		//A remplacer par une vrai creation
		const chan = await this.findOne(label);

		let muteornot;

		if (chan.status != 4)
		{
		 muteornot = await this.isMuted(label, name);
		}
		else
		{
			muteornot = false;
		}


		if (!muteornot)
			{
				const message = new SMessageEntity();
				message.text =  text;
				message.label = label;
				message.name = name;
				const usr = await this.userService.findOne(name);
				message.user = usr;
				chan.messages.push(message);
				await this.SCRepository.save(chan);
			}
	}

	async loadmessages(label : string, user : string)
	{
		const chan = await this.findOne(label);

		if (chan == undefined)
			return ([])

		const usr = await this.userService.findOneForLoadMessage(user);

		if (!usr.blocked)
			return (chan.messages);


		let ret0 = chan.messages.map(
			(msgentiy) => {
				if (
					usr.blocked.find(
						(e) => e.name == msgentiy.name
					) == undefined)
				return (msgentiy)
		})

		ret0 = ret0.filter((e) => e != undefined)

		chan.messages.forEach(
			(e) => {
				e.name = e.user.nickname;
			}
		)
		return (ret0);

	}

	async findMyUsers(label : string)
	{
		const chan = await this.findOne(label);

		if (chan)
			return (chan.users)
		else
			return ([])
	}

	//ADD A CHAN WITH USER LIST
	async addchan(owner : string, pass : string, name : string, ispublic : string, invitelist : string[])
	{
		const chan = await this.findOne(name);

		if (chan != undefined)
		{
			return ({msg : 'existing'});
		}

		const newchan = new SChanEntity();
		if (pass)
			{
				if (ispublic == 'public')
					newchan.status = 2;
				else
					newchan.status = 3;
			}
			else
				{
					if (ispublic == 'public')
						newchan.status = 0;
					else
						newchan.status = 1;
				}

				if (ispublic == "privatemessage")
				{
					newchan.status = 4;
				}

				if (pass)
				{
					newchan.password = await bcrypt.hashSync(pass, 13);
				}
				else
				{
					newchan.password = "";
				}

				newchan.label = name;


				const myown = await this.userService.findOne(owner);
				newchan.users = [myown];
				newchan.admins = [myown];
				newchan.owner = myown;

                if (ispublic != 'public')
                {
                    newchan.invited = invitelist;
                }

				const push_user = async() => {
					invitelist.map(async (usrinv) => {
						const usr = await this.userService.findOne(usrinv);
						if (usr != undefined)
							newchan.users.push(usr);
					})
				}

				const push_chan = async() => {
					invitelist.map(async (usrinv) => {
						const usr = await this.userService.findOne(usrinv);
						if (usr != undefined)
							usr.channels.push(newchan)

						await this.userRepository.save(usr);
					})
				}

				push_user().then(() => {
					this.SCRepository.save(newchan).then( () => {
						push_chan();
					})

				});

				return ({msg: 'done'});


	}

	async addUser(label : string, username : string)
	{
		let myChannel;

		this.findOne(label).then((channel) => {
			if (channel == undefined || channel.status == 4)
			return ;
			this.userService.findOne(username).then((user) => {
				channel.users.push(user);
				this.SCRepository.save(channel);
				myChannel = channel;
			})
		})
	}

	async deleteUser(label : string, username : string)
	{
		let myChannel;

        const dellallmessage = async (mess : any) =>
        {
            mess.map((mes) => {
                this.SMessageRepository.remove(mes)
            })
        } 

		
		const delchan = (chan : SChanEntity ) =>
		{

			dellallmessage(chan.messages).then(() => {
				this.SCRepository.remove(chan);}
			)
		}
		

		this.findOne(label).then((channel) => {
			if (channel == undefined || channel.status == 4)
			return ;
			const userList = channel.users;
			var result = userList.filter((obj, index, arr) => {
				if (obj.name === username )
					{
						arr.splice(index, 1);
						myChannel = channel;
						//		return index
					}
			})
			
			if (userList.length == 0)
			{
				delchan(channel);
				return ;
			}
            else
            {
			
			this.SCRepository.save(channel).then( () => {
				//this.userService.deleteUser(label, username);
			})
            }
		})
	}

	//ADMIN	
	async addAdmin(label : string, username : string)
	{
		let myChannel;

		this.findOne(label).then((channel) => {
			if (channel == undefined || channel.status == 4)
			return ;
			this.userService.findOne(username).then((user) => {
				channel.admins.push(user);
				this.SCRepository.save(channel);
				myChannel = channel;
			})
		})

	}


	async removeAdmin(label : string, username : string)
	{

		this.findOne(label).then((channel) => {
			if (channel == undefined || channel.status == 4)
			return ;
			const adminList = channel.admins; 
			var result = adminList.filter((obj, index, arr) => {
				if (obj.name === username )
					{
						arr.splice(index, 1);
						//		return index
					}
			})
			this.SCRepository.save(channel);
		})
	}

	async isprotected(label : string) : Promise<boolean | undefined>
	{
		const channel = await this.findOne(label);

		if (channel == undefined || channel.status == 4)
			return ;

		if (channel.status == 1 || channel.status == 3)
			return (true);
		return (false);
	}

	async checkPassword(password : string, label : string) : Promise<boolean | undefined>
	{
		const channel = await this.findOne(label);
		if (channel == undefined || channel.status == 4)
			return ;
		return (await bcrypt.compareSync(password, channel.password));
	}

	async isAdmin(label : string, username : string) : Promise<boolean | undefined>
	{

		let findAdmin = false;

		const channel = await this.findOne(label);

		if (channel == undefined || channel.status == 4)
			return ;

		const adminList = channel.admins; 
		var res = adminList.filter((obj) => {
			if (obj.name === username )
				{
					findAdmin = true;
					return true;
				}
		})


		return (findAdmin);
	}

	async isBlocked(user : string, blockedornot : string) : Promise<boolean | undefined>
	{


		let ret = false;

		const userToCheck = await this.userService.findOneForLoadMessage(user);

		if (!userToCheck)
			return ;

		userToCheck.blocked.map((listblock) =>{
			if (listblock.name == blockedornot)
				ret = true;
		})

		return (ret);
	}

	async isOwner(label : string, username : string) : Promise<boolean | undefined>
	{

		let ret;

		const user = await this.userService.findOne(username)
		const chan = await this.findOneforOwner(label)

		if (user == undefined || chan == undefined || chan.status == 4)
			return ;


		if (chan.owner.name == user.name)
			{
				ret = true
			}
			else
				{
					ret = false
				}

				/*
				   this.userService.findOne(username).then( (user) => {
				   this.findOne(label).then( (chan) => {
				   if (chan.owner == user)
				   {
				   findOwner = true;
				   }
				   })
				   })
				   return (findOwner);
				   */
				return(ret);
	}

	unMuteUserTimeout = (label : string, muted : string, term : boolean) =>
	{
		if (term)
		{
			clearTimeout(this.timermute);
		}
		else
		{
			this.timermute = setTimeout(() => { this.unMuteUser(label, muted)}, 30000);
		}
	}

	unBanUserTimeout = (label : string, name : string, term : boolean) =>
	{
		if (term)
		{
			clearTimeout(this.timerban)
		}
		else
		{
			this.timerban = setTimeout(() => {this.unBanUser(label, name)}, 30000);
		}
	}

	//MUTED
	async muteUser(label : string, muted : string)
	{
		/*
		   const userToMuted = await this.userService.findOne(muted);
		   const fromChannel = await this.findOne(label);
		   */
		   	this.unMuteUserTimeout(label, muted, false);
			this.isunmute = true;


		let fromC;

		this.userService.findOne(muted).then((userToMuted) => {
			if (userToMuted == undefined)
				return ;
			this.findOne(label).then((fromChannel) => {
				if (fromChannel == undefined || fromChannel.status == 4)
					return ;
				const newMuted = new MutedUserEntity();
				newMuted.muteChan = fromChannel;
				newMuted.muteUser = userToMuted;
				newMuted.username = userToMuted.name;
				newMuted.label = fromChannel.label;
				//		newMuted.timestamp = 100;
				this.mutedUserRepository.save(newMuted).then(() => {
					fromChannel.mutedList.push(newMuted);
					this.SCRepository.save(fromChannel);
					fromC = fromChannel;

				});
			})
		});
	}


	async unMuteUser(label : string, name : string)
	{
		//	const channel = await this.findOne(label);
		//Delete the mute user from the mute array in the channel

		this.findOne(label).then((channel) => {

			if (channel == undefined || channel.status == 4)
				return ;
			if (this.isunmute)
			{
				this.unMuteUserTimeout(label, name, true);
				this.isunmute = false;
			}
			const mutedList = channel.mutedList;
			//if (!mutedList.some((usr) => {usr.name === name && usr.label === label}))
			//	return ; 
			var result = mutedList.filter((obj, index, arr) => {
				if (obj.username === name && obj.label === label)
					{
						arr.splice(index, 1);
						return index
					}
			})
			this.SCRepository.save(channel);
		})


		//Delete the mute tuple in muted entity 
		await this.deleteOneMuted(label, name); 
	}

	async isMuted(label : string, user : string) : Promise<boolean | undefined>
	{
		let ret;
		const userToCheck = await this.userService.findOne(user);
		const fromChannel = await this.findOne(label);

		if (userToCheck == undefined || fromChannel == undefined || fromChannel.status == 4)
			return ;

		const res = await this.findOneMuted(fromChannel.label, userToCheck.name);


		if (!res)
			ret = false;
		else
			ret = true;

		return (ret);
	}

	//BANN 
	async banUser(label : string, banned : string)
	{

		this.unBanUserTimeout(label, banned, false);
		this.isunban = true;

		this.userService.findOne(banned).then((userToBanned) => {
			if (userToBanned == undefined)
				return ;
			this.findOne(label).then((fromChannel) => {
				if (fromChannel == undefined || fromChannel.status == 4)
					return ;
				const newBanned = new BannedUserEntity();
				newBanned.banChan = fromChannel;
				newBanned.banUser = userToBanned;
				newBanned.username = userToBanned.name;
				newBanned.label = fromChannel.label;
				//		newMuted.timestamp = 100;
				this.bannedUserRepository.save(newBanned).then(() => {
					fromChannel.bannedList.push(newBanned);
					this.SCRepository.save(fromChannel).then( () => {
						this.deleteUser(label, banned);
					})
				});
			})
		});


	}

	async unBanUser(label : string, name : string)
	{
		//	const channel = await this.findOne(label);

		this.findOne(label).then((channel) => {
			if (channel == undefined || channel.status == 4)
				return ;
			const bannedList = channel.bannedList; 
			var result = bannedList.filter((obj, index, arr) => {
				if (obj.username === name && obj.label === label)
					{
						arr.splice(index, 1);
						return index
					}
			})
			this.SCRepository.save(channel);
		})

		//Delete the mute user from the mute array in the channel

		//Delete the mute tuple in muted entity 
		await this.deleteOneBanned(label, name); 
	}

	async isBanned(label : string, user : string) : Promise<boolean | undefined>
	{
		let ret;
		const userToCheck = await this.userService.findOne(user);
		const fromChannel = await this.findOne(label);

		if (userToCheck == undefined || fromChannel == undefined || fromChannel.status == 4)
			return ;

		const res = await this.findOneBanned(fromChannel.label, userToCheck.name);

		if (!res)
			ret = false;
		else
			ret = true;

		return (ret);
	}

	async updatepassword(label : string, newpassword : string)
	{

		const chan = await this.findOne(label);
		if (chan == undefined || chan.status == 4)
			return ;
		if (newpassword == "")
			{
				if (chan.status == 2)
					chan.status = 0;
				else
					chan.status = 2;
				chan.password = "";
				return (this.SCRepository.save(chan));
			}
			else
				{
					chan.password = bcrypt.hashSync(newpassword, 13);
					if (chan.status == 0)
						chan.status = 2;
					else
						chan.status = 3;
					return(this.SCRepository.save(chan))
				}
	}
}
