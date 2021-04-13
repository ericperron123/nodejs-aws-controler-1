/*

    a command is expected to run in a short time 


*/


import { Utils } from "../../epl/utils/Utils";

export class CommandMessage<T> {

    public message: string = "";
    public data: T;
    public timeCreated: Date;

    public constructor(message?: string, data?: any) {

        if(message)
            this.message = message;

        if (data != undefined)
            this.data = data;

        this.timeCreated = new Date();
        
    }
}

export class CommandResult<T> extends CommandMessage<T> {

    public warning: CommandMessage<T>;
    public error: Error;

    public constructor(message?: string | Error, data?: T) {

        let msg: string;
        let error: Error;

        if (message != null)
            if (typeof (message) == "string")
                msg = message;
            else
                error = message;

        super(msg, data);

        this.error = error;

    }
}


