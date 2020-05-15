export default class Reimbursement{
    reimbursementId : number;
    author : number;
    amount : number;
    dateSubmitted : number;
    dateResolved : number;
    description : string;
    resolver : number;
    status : number;
    type : number;

    constructor(reimbursementId : number, author : number, amount : number, dateSubmitted : number, dateResolved : number, description : string, resolver : number, status : number, type : number){
        this.reimbursementId = reimbursementId;
        this.author = author;
        this.amount = amount;
        this.dateSubmitted = dateSubmitted;
        this.dateResolved = dateResolved;
        this.description = description;
        this.resolver = resolver;
        this.status = status;
        this.type = type;
    }
}