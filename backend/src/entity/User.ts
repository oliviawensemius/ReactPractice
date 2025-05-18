import { Entity, PrimaryGeneratedColumn, Column, TableInheritance } from "typeorm";

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

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;
}