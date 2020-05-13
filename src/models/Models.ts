export interface User{
    userId : number;
    username : string;
    password : string;
    firstName : string;
    lastName : string;
    email : string;
    role : Role;
}

export interface Role{
    roleId : number;
    role : string;
}

export interface Reimbursement{
    reimbursementId : number;
    author : number;
    amount : number;
    dateSubmitted : number;
    dateResolved : number;
    description : string;
    resolver : number;
    status : number;
    type : number;
}

export interface ReimbursementStatus{
    statusId : number;
    status : string;
}

export interface ReimbursementType{
    typeId : number;
    type : string;
}

export class Expired{
    message : string = 'The incoming token has expired';
}