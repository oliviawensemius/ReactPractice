// Tutor entity extends User
// Additional fields:
// - skills (array of strings)
// - academicCredentials (JSON array)
// - previousRoles (JSON array)
// - availability (enum: 'fulltime', 'parttime')
// - applications (one-to-many relation to TutorApplication)
// - subjects (many-to-many relation to Course)

// Candidate entity extends User
import {  Column, OneToMany, ChildEntity } from "typeorm";
import { User } from "./User";
import { CandidateApplication } from "./CandidateApplication";
import { AcademicCredential } from "./AcademicCredential";
import { PreviousRole } from "./PreviousRole";

export enum AvailabilityType {
FULLTIME = "fulltime",
PARTTIME = "parttime"
}

@ChildEntity()
export class Candidate extends User {
    @Column({
    type: "enum",
    enum: AvailabilityType,
    default: AvailabilityType.PARTTIME
    })
    availability: AvailabilityType;

    @Column("simple-array", { nullable: true })
    skills: string[];

    @OneToMany(() => CandidateApplication, application => application.candidate)
    applications: CandidateApplication[];

    @OneToMany(() => AcademicCredential, credential => credential.candidate)
    academicCredentials: AcademicCredential[];
    
    @OneToMany(() => PreviousRole, role => role.candidate)
    previousRoles: PreviousRole[];
}