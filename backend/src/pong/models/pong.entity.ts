 import { EncryptionTransformer } from "typeorm-encrypted";
import { Exclude } from 'class-transformer';
import { UserEntity } from "../../user/models/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, ManyToOne, JoinTable } from "typeorm";



@Entity()
export class PongEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	public player1: string

	@Column()
	public player2: string

	@Column()
	public score1: number

	@Column()
	public score2 : number

	//1- On going | 2- finished | 3- suspended
	@Column()
	public status: number

	@Column({nullable: true})
	public modeGame: string

	@Column({nullable: true})
	public roomName!: string

	@Column({nullable: true})
	public winner : string

	//M2M relation tableau de deux user
	@ManyToMany(() => UserEntity, (userEntity) => userEntity.gameList)
	public	players: UserEntity[];
}
