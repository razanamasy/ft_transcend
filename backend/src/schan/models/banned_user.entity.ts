import { EncryptionTransformer } from "typeorm-encrypted";
import { Exclude } from 'class-transformer';
import { SChanEntity } from "../../schan/models/schan.entity";
import { UserEntity } from "../../user/models/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, ManyToOne, JoinTable } from "typeorm";

@Entity()
export class BannedUserEntity {
	@PrimaryGeneratedColumn()
	id: number;

    @Column()
    public username!: string

    @Column()
    public label!: string
	
	//Custom Propreties
	@Column({nullable: true})
    public timestamp!: number



	//Double call to both chan and user to make the custom M2M relation
    @ManyToOne(() => SChanEntity, (schanEntity) => schanEntity.bannedList)
    public	banChan!: SChanEntity;

    @ManyToOne(() => UserEntity, (userEntity) => userEntity.bannedList)
    public banUser!: UserEntity;
}
