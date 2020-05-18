import { queryMachine, updateTable } from '../index';
import { Response } from 'express';
import { isHashed, generate, verify } from 'password-hash';

export async function hashStoredPasswords(res : Response){
    //get all users
    let result = await queryMachine('SELECT * FROM users');

    //verify password is unhashed, then hash, or do nothing
    result.rows.forEach((element) => {
        if(!isHashed(element.password)){
            updateTable('users', 'userid', element.userid, 'password', generate(element.password), 'string');
        }
    });
}

export function verifyPassword(given : string, stored : string) : boolean{
    if(isHashed(stored)){
        if(verify(given, stored)){
            return true;
        }
    }
    else if(given === stored){
        return true;
    }
    return false;
}