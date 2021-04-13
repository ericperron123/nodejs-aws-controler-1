
import { CmdRouter } from "./commands/CmdRouter";
import { StringUtils } from "../epl/utils/stringUtils/StringUtils";
import { EplEvent, EPLStyleEventEmitter } from "../epl/EPLStyleEventEmitter";
import { Logger } from "../epl-nodejs/Logger";
import { Task } from "./types/NTask";
import { CommandResult } from "./types/Command";



export class ConsoleManager extends EPLStyleEventEmitter {

    public padding: number = 0;
    private prompting: boolean = false;

    public async init(): Promise<void> {


        // Get process.stdin as the standard input object.
        var standard_input = process.stdin;

        // Set input character encoding.
        standard_input.setEncoding('utf-8');

        standard_input.on('data', async (cmd: string) => {
            this._handle_data(cmd);
        });


        this.output("Application is ready!\n\r");


    }

    private _getValues(str:string):any{

        let values:any = {};
        let dash_flag:boolean = false;
        let var_name_flag:boolean = false;
        let var_value_flag:boolean = false;
        let var_value_quote_flag:boolean = false;
        
        let var_name:string = "";
        let var_value:string = "";

        let _onVarValueComplete:Function = ()=>{
             // stop reading variable value
             values[var_name.toLowerCase()] = var_value;
             var_name = "";
             var_value = "";
             var_value_flag = false;
        };

        StringUtils.forEach(str,(char, index)=>{
            
            // reading the variable name
            if (var_name_flag)
                if (char == " ") {
                    if (var_name_flag) {

                        // stop reading variable name
                        var_name_flag = false;

                        // start reading variable value
                        var_value_flag = true;

                        return;
                    }
                } else {
                    var_name += char; 
                    return;
                }

            // reading the variable value
            if (var_value_flag)
                if (char == "\""){
                    // toggle the quotes flag

                    if(var_value_quote_flag){
                        // stop reading variable value
                        _onVarValueComplete();
                        return;
                    }

                    var_value_quote_flag = !var_value_quote_flag;
                    return;
                } else if (index == str.length -1) {
                    
                    // stop reading variable value
                    var_value += char; 
                    _onVarValueComplete();
                    return;
                }
                else if (char == " ") {
                    if (var_value_quote_flag){
                        var_value+= char;
                        return;
                    }
                    else{
                        // stop reading variable value
                        _onVarValueComplete();
                        return;
                    }
                } else {
                    var_value += char; 
                    return;
                }
            
            // checking for the start of a variable 
            if(char == "-")
                if(dash_flag){
                    var_name_flag = true; // start reading the variable name
                    dash_flag = false; // stop reading the dashes. 
                    return;
                } else if(!var_name_flag && !var_value_flag) {
                    dash_flag = true; // start reading the dashes. 
                    return;
                }
        });
        
        return values;
    }


    private async _handle_data(cmd:string):Promise<void>{
        
        // I don't believe there is a scenario in which extra spaces are needed. 
        cmd = StringUtils.removeExtraSpaces(cmd, true, true, true);
        let values:any = {};
        
        // if the console manager is expecting an answer from the user, send the data as is. 
        if (this.prompting) 
        {
            // the event handler handling changes the value of the "prompting" property. 
            // hence, we need to have this if/else logic
            this.emit("data", cmd);

            // application is waiting for an answer, so don't handle it as a command.
            return;
        }
        
        // verify if there are values which start with "--"
        let vIndex:number = cmd.indexOf("--");
        if(vIndex != -1)
        {
            let valuesStr:string = cmd.substring(vIndex, cmd.length);
            values = this._getValues(valuesStr)
            cmd = cmd.substring(0, vIndex);
        }
        
        process.stdout.write("\n");

        cmd = StringUtils.removeExtraSpaces(cmd, true, true, true);
        cmd = cmd.toLowerCase();
        cmd = StringUtils.removeFrenchChars(cmd);

        Logger.debug("Console cmd: " + cmd);

        if (this.prompting) {
            // the event handler handling changes the value of the "prompting" property. 
            // hence, we need to have this if/else logic
            this.emit("data", cmd);

            // application is waiting for an answer, so don't handle it as a command.
            return;
        }
        else 
            this.emit("data", cmd);
       
        if (cmd == "cls"){
            this.cls();
            return;
        }

        let response: CommandResult<any> | Task = await CmdRouter.cmd(cmd, values);

        if (response == null) {
            this.output("The task returned null!\n\r");
            Logger.debug("The task returned null!\n\r");
            return;
        }
            
        if (response instanceof CommandResult)
            this._handle_CommandResult(response as CommandResult<any>);
        if (response instanceof Task)
            this._handle_Task(response as Task);
    }

    private _handle_CommandResult(response:CommandResult<any>):void{
        let cmd:CommandResult<any> = response as CommandResult<any>;
        if(cmd.error) 
        {
            this.error( "ERROR! "+ cmd.error.message + "\n\r");
            Logger.error("Task error! " + cmd.error.message);
        } else {
            Logger.debug("Console cmd response: " + cmd.message);
            this.output( cmd.message + "\n\r");
        }

    }



    private _handle_Task(response:Task):void{
        let task:Task = response as Task;
               
        task.on("error",(event:EplEvent)=>{
            if(event.data.message)
                this.error(event.data.message)
        },this);

        task.on("update",(event:EplEvent)=>{
            if(event.data.message)
                this.output(event.data.message)
        },this);

        response.on("complete",(event:EplEvent)=>{
            this.output("TASK COMPLETE! " + event.data.message);
            response.offAll(this); // stop listing to this object
        },this);

    }



    public beep():void{
        process.stdout.write('\x07')
    }
    
    public ding():void{
        this.beep();
    }



    public async prompt(question:string): Promise<string> {

        this.prompting = true;
        process.stdout.write(question+"\r\n");
        process.stdout.write(">  ");

        return new Promise((resolve, reject) => {

            let handler_onData: Function = (event:EplEvent, scope:any) => {
                this.off('data', handler_onData, this);
                this.prompting = false;
                
                process.stdout.write("bot>  ");
                resolve(event.data);
                
            }

            this.on('data', handler_onData, this);


        });

    }


    public cls(): void {
        process.stdout.write("\u001b[2J\u001b[0;0H");
        process.stdout.write("bot>  ");
    }

    public output(str: string): void {
        process.stdout.write(this._addPadding(str));
        process.stdout.write("\nbot>  ");
    }

    public debug(str: string): void {
        this.output(str);
    }

    public warn(str: string): void {
        this.output(str);
    }

    public log(str: string): void {
        this.output(str);
    }

    public info(str: string): void {
        this.output(str);
    }

    public error(str: string): void {
        console.log(ConsoleColor.FgRed, this._addPadding(str));
        console.log(ConsoleColor.Reset, "");
        process.stdout.write("bot>  ");
    }

    public group(str: string): void {
        this.padding += 3;
        this.output(str);
    }

    public groupEnd(): void {
        this.padding -= 3;
        if (this.padding < 0)
            this.padding = 0;
    }



    private _addPadding(str: string): string {
        let spaces: string = StringUtils.spacePadding("", this.padding, true);

        str = spaces + str;
        str = StringUtils.replace(str, "\n", "\n" + spaces);

        return str;
    }

}

export enum ConsoleColor{
    Reset = "\x1b[0m",
    Bright = "\x1b[1m",
    Dim = "\x1b[2m",
    Underscore = "\x1b[4m",
    Blink = "\x1b[5m",
    Reverse = "\x1b[7m",
    Hidden = "\x1b[8m",
    
    FgBlack = "\x1b[30m",
    FgRed = "\x1b[31m",
    FgGreen = "\x1b[32m",
    FgYellow = "\x1b[33m",
    FgBlue = "\x1b[34m",
    FgMagenta = "\x1b[35m",
    FgCyan = "\x1b[36m",
    FgWhite = "\x1b[37m",
    
    BgBlack = "\x1b[40m",
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgWhite = "\x1b[47m",
}
