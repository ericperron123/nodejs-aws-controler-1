import { Logger, LoggerLevel } from "../epl-nodejs/Logger";
import { AppConfig } from "./AppConfig";
import { ConsoleManager } from "./ConsoleManager";

export class App{

    public static console:ConsoleManager = new ConsoleManager();
    public static config:AppConfig = new AppConfig();

    public static async init():Promise<any>{
        
        // initiate the console
        this.console.init();
        
        // load the config file
        
        await this.config.load("..\\..\\config.txt");

        // initiate the logger
        Logger.SETTINGS.folderPath = this.config.data.logPath;
        Logger.SETTINGS.console = false;
        Logger.SETTINGS.level = LoggerLevel.DEBUG;


        let msg:string = "\n\n";
        msg += "********************************************\n";
        msg += "**                                        **\n";
        msg += "**           AWS CONTROLER                **\n";
        msg += "**                                        **\n";
        msg += "********************************************\n";
        msg += "* \n";
        msg += "*  install       - Create vpc, subnet, etc to place the database into.\n";
        msg += "*  uninstall     - Remove the vpc, subnet, etc.\n";
        msg += "*  start session - Create/restore the database.\n";
        msg += "*  stop session  - Take a snap shot of the database and delete it.\n* \n* \n\n";
        
        this.console.log(msg);


    }

}