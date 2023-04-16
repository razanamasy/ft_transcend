import { SMessageEntity } from "../../smessage/models/smessage.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, OneToOne, ManyToOne, JoinTable } from "typeorm";
import { UserEntity } from "../../user/models/user.entity";
import { MutedUserEntity } from "./muted_user.entity"; 
import { BannedUserEntity } from "./banned_user.entity"; 



@Entity()
export class SChanEntity {
	@PrimaryGeneratedColumn()
	id : number

//	@Column({ nullable: true})
//	owner: string

	@Column({nullable: true})
	label: string

	@Column({nullable: true})
	status: number

	@Column({nullable: true})
	password : string

//	@Column("character varying", {array : true, nullable: true})
//	admins : string[]

    @Column("character varying", {array : true, nullable: true})
    invited : string[]

//	@Column("character varying", {array : true, nullable: true})
//	muted : string[]

//	@Column("character varying", {default: [], array : true, nullable: true})
//	banlist : string[]

	@Column("character varying", {array : true, nullable: true})
	online : string[]

	//Many T M channem from user useless
	@ManyToMany(() => UserEntity,(userEntity) => userEntity.channels)
	@JoinTable()
	users: UserEntity[];
	
	//M TO M Channel to user (as admin)
	@ManyToMany(() => UserEntity)
	@JoinTable()
	admins: UserEntity[];

	//One Channel for many messages
	@OneToMany(() => SMessageEntity, (smessageEntity) => smessageEntity.channel,{
        cascade: true,
    } )
	messages: SMessageEntity[];

	//Many Channel for one user (as owner)
	@ManyToOne(() => UserEntity)
	owner: UserEntity;

	//MUTED AND BANNED M TO M WITH CUSTOM TABLE
	//One To Many back to Many to one for muted
	@OneToMany(() => MutedUserEntity, (mutedUserEntity) => mutedUserEntity.muteChan)
	mutedList: MutedUserEntity[];

	@OneToMany(() => BannedUserEntity, (bannedUserEntity) => bannedUserEntity.banChan)
	bannedList: BannedUserEntity[];

}
