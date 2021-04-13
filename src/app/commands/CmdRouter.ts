import { StringUtils } from "../../epl/utils/stringUtils/StringUtils";
import { CommandResult } from "../types/Command";
import { Task } from "../types/NTask";
import { DevSessionStartTask } from "./aws/DevSessionStartTask";
import { DevSessionStopTask } from "./aws/DevSessionStopTask";
import { InstallCmd } from "./aws/InstallTask";
import { UninstallCmd } from "./aws/UninstallTask";
import { EpTest } from "./Eptest";


export class CmdRouter {

    public static async cmd(cmd: string, values?: any): Promise<Task|CommandResult<any>> {

        let result: Task;
        let originalCmd: string = cmd;

        cmd = StringUtils.replace(cmd, " ", "");

        let tmp: string;
        
        if(cmd == "install")
            return new InstallCmd().run();
        
        if(cmd == "startsession" || cmd == "startdevsession")
            return new DevSessionStartTask().run();

        if(cmd == "stopsession" || cmd == "stopdevsession")
            return new DevSessionStopTask().run();

        if(cmd == "uninstall")
           return new UninstallCmd().run();
        
        if(cmd == "eptest")
           return new EpTest().run();        

        // --------------------------------------------------------
        // FUN STUFF
        // --------------------------------------------------------
        tmp = StringUtils.replace(cmd, ["ping", "helloworld", "hello", "what'sup", "yo"], "test");

        if (tmp == "test")
            return new CommandResult("hello!");

        if (StringUtils.indexOfMany(cmd, ["gotohell", "fuck"]) != -1)
            return new CommandResult("Comon on now... Watch you're language!");

        if (result == null) {
            let t:Task = new Task();
            
            return new CommandResult(new Error("[" + originalCmd + "] Command was not found."));

        }
            
        return result;

    }

}