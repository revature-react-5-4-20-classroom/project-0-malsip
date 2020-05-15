export default class Users{
    userId : number;
    username : string;
    password : string;
    firstName : string;
    lastName : string;
    email : string;
    role : string;

    constructor(userId : number, username : string, password : string, firstName : string, lastName : string, email : string, role : string){
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
    }
}