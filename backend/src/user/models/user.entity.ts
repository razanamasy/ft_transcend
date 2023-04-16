import { EncryptionTransformer } from "typeorm-encrypted";
import { Exclude } from 'class-transformer';
import { SChanEntity } from "../../schan/models/schan.entity";
import { MutedUserEntity } from "../../schan/models/muted_user.entity";
import { BannedUserEntity } from "../../schan/models/banned_user.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { PongEntity } from '../../pong/models/pong.entity'

@Entity()
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column("int", { array: true, nullable: true})
	level: number[];


	//SEARCH FOR PLAYER MODENE PAS RAJOUTER DES TRUC QUI N'ONT AUCUNS RAPPORT SVP
	@Column({
		nullable: true
	})
	isSearching: boolean;

	@Column({
		nullable:true
	})
	status : number;

	//LOGIN/ INTRA
	@Column({
		unique: true
	})
	name: string;

	//NICKNAME
	@Column({
		unique: true
	})
	nickname: string;

	@Column({
	})
	mdp: string;

	@Column({
	    type: String,
	    unique: true,
	    nullable: true,
	})
	twoFactorAuthenticationSecret?: string | null;

	@Column()
	enable2FA: boolean;

	@Column({
	    type: String,
	    unique: true,
	    nullable: true,
	})
	public refreshToken?: string | null;



	//INVITATION INFOS DATAS NE PAS RAJOUTER DES TRUC QUI N'ONT AUCUNS RAPPORT SVP
	@Column({
		nullable: true
	})
	inviter: string;

	@Column({
		nullable: true
	})
	invited: string;

	@Column({
		nullable: true
	})
	modeGameInvitation: string;




	//SOCKET DATAS : (A BIT USELESS)NE PAS RAJOUTER DES TRUC QUI N'ONT AUCUNS RAPPORT SVP
	@Column({
		nullable: true
	})
	socketIdChat: string;

	@Column({
		nullable: true
	})
	socketIdPong: string;


	//RELATIONS WITH OTHER ENTITIES
	//Mamy to Many self ref for friend
    @ManyToMany(() => UserEntity, (userEntity) => userEntity.friends)
	@JoinTable()
    friends: UserEntity[]

	//Many to Many self ref for blocked
    @ManyToMany(() => UserEntity, (userEntity) => userEntity.blocked)
	@JoinTable()
    blocked: UserEntity[]

	//Many to Many user / Channel
	@ManyToMany(() => SChanEntity, (schanEntity) => schanEntity.users)
	channels: SChanEntity[];

	//GAME ARRAY tableau de PongJeu 
	@ManyToMany(() => PongEntity, (pongEntity) => pongEntity.players)
	@JoinTable()
	gameList: PongEntity[];




	//MUTED AND BANNED M TO M WITH CUSTOM TABLE
	//One To Many back to Many to one for muted
	@OneToMany(() => MutedUserEntity, (mutedUserEntity) => mutedUserEntity.muteUser)
	mutedList: MutedUserEntity[];

	@OneToMany(() => BannedUserEntity, (bannedUserEntity) => bannedUserEntity.banUser)
	bannedList: BannedUserEntity[];

}
