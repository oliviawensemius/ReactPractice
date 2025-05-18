import { Entity, PrimaryGeneratedColumn, Column, TableInheritance, CreateDateColumn } from "typeorm";

export enum UserRole {
  CANDIDATE = "candidate",
  LECTURER = "lecturer",
  ADMIN = "admin"
}

@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.CANDIDATE
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;
}