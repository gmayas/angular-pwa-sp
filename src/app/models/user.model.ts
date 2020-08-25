export class userModel{

    constructor(id = 0, emailuser ='', nameuser = '', passworduser = '', typeiduser = 0){
        this.id =id;
        this.emailuser = emailuser;
        this.nameuser = nameuser;
        this.passworduser = passworduser;
        this.typeiduser = typeiduser;
    }

    id: number ; 
    emailuser: string; 
    nameuser: string; 
    passworduser: string;
    typeiduser: number;
};