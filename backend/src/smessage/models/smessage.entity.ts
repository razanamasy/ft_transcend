import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Message } from "./smessage.interface";
import { UserEntity } from "../../user/models/user.entity";
import { SChanEntity } from "../../schan/models/schan.entity";

@Entity()
export class SMessageEntity {
	@PrimaryGeneratedColumn()
	id : number
/*
	@Column("simple-array", {
		array : true,
		nullable: true
	})
	messages: Message[];
*/
	@Column({ nullable: true})
	text: string

	@Column({nullable: true})
	name: string

	@Column({nullable: true})
	label: string

	@ManyToOne(() => UserEntity)
	user: UserEntity;

	@ManyToOne(() => SChanEntity, (schanEntity) => schanEntity.messages)
	channel: SChanEntity;

}
