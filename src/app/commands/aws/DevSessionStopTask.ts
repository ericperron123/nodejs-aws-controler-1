/* 
    // The objective of this task is to limit expenses by adding/removing Cloud resources 
    // that incure cost when they are not used. 
    
    1) Create database using the parameters found in the config file. 
    2) Monitor the status of the created database until it is available. 

*/




import { EC2Client, Vpc } from "@aws-sdk/client-ec2";
import {
    CreateDBInstanceCommandInput, CreateDBSnapshotCommand, CreateDBSnapshotCommandOutput, DBInstance, DBSnapshot, DeleteDBInstanceCommand, 
    DeleteDBInstanceCommandOutput, RDSClient, RestoreDBInstanceFromDBSnapshotCommand, RestoreDBInstanceFromDBSnapshotCommandInput,
    RestoreDBInstanceFromDBSnapshotCommandOutput
} from "@aws-sdk/client-rds";
import { RdsStatusMonitor, RdsStatusMonitorEventType } from "../../../epl-aws/RDSUtils";
import { EplEvent } from "../../../epl/EPLStyleEventEmitter";
import { DateUtils } from "../../../epl/utils/dateUtils/DateUtils";
import { StringUtils } from "../../../epl/utils/stringUtils/StringUtils";
import { Utils } from "../../../epl/utils/Utils";
import { App } from "../../App";
import { DevSession, Install } from "../../AppConfig";
import { CommandResult } from "../../types/Command";
import { NTaskStatus, Task } from "../../types/NTask";
import * as fs from "fs";

// This will initiate the AWS environment for this project. 

export class DevSessionStopTask extends Task {

    private _configInst: Install;
    private _config: DevSession;

    public ec2Client: EC2Client;
    public rdsClient: RDSClient;

    public output:DevSessionStopTaskOutput = new DevSessionStopTaskOutput();

    public run(): Task {

        this.name = "init-environment";

        this.addAction(async (params: any): Promise<CommandResult<void> | Task> => {
            return this._init(params);
        }, "setup-aws-client");

        this.addAction(async (params: any): Promise<CommandResult<DBSnapshot>|Task> =>{ 
            return await this._takeSnapshot();
        }, "save-output-file");
        
        // check status of snapshot. wait until it is available (aka: ready) before 
        // deleting the database. 

        this.addAction(async (params: any): Promise<CommandResult<void> | Task> => {

            this.pause();
            let sm: RdsStatusMonitor = new RdsStatusMonitor();
            sm.on(RdsStatusMonitorEventType.STATUS_CHANGE, (event: EplEvent) => {  
                this.emitUpdate("Snapshot [" + this.output.dbSnapshotIdentifier + "] has changed status to " + event.data.status + ".");
                if(event.data.status == "available"){
                    App.console.beep();
                    App.console.beep();
                    sm.stop();
                    sm.offAll();
                    this.next();
                }
            }, this);

            sm.monitorDBSnapshot(this.output.dbSnapshotIdentifier, this._configInst.region);

            return null;

        }, "check-snaopshot-status");

        
        this.addAction(async (params: any): Promise<CommandResult<void> | Task> => {
            try {
                await this._deleteDatabase();
            } catch (err) {
                this.emitError(err);
                this.status = NTaskStatus.ERROR;
                return new CommandResult(err);
            }
        }, "delete-database");

        this.addAction(async (params: any): Promise<CommandResult<void> | Task> => {

            this.pause();
            let dbId: string = this._config.database.DBInstanceIdentifier;

            let sm: RdsStatusMonitor = new RdsStatusMonitor();
            
            sm.on(RdsStatusMonitorEventType.STATUS_CHANGE, (event: EplEvent) => {
                let db:DBInstance = event.data
                this.emitUpdate("Database [" + dbId + "] has changed status to " + db.DBInstanceStatus + ".");
            }, this);

            sm.on(RdsStatusMonitorEventType.NOT_FOUND, (event: EplEvent) => {
                this.emitUpdate("Database [" + dbId + "] could not be found.");
                sm.stop();
                sm.offAll();
                this.next();
            }, this);

            sm.monitorDB(dbId, this._configInst.region);

            return null;

        }, "check-database-status");



        // this will send back the object before starting its sequence. This 
        // way, updates will appear on the screen as they are made available. 
        setTimeout(() => { this.start(); }, 20);

        return this;

    }



    private async _init(params: any): Promise<CommandResult<void> | Task> {

        this._config = App.config.data.cmdDefaults.devSession;
        this._configInst = App.config.data.cmdDefaults.install;

        let region: string = this._configInst.region;

        this.rdsClient = new RDSClient({ region: region });

        return new CommandResult("Region has been set to " + region, null);

    }

    private async _takeSnapshot():Promise<CommandResult<DBSnapshot>>{

        let d:Date = new Date();
        let dStr:string = DateUtils.toFormattedString(new Date(), "YYMMDD");
        let hours:string = StringUtils.spacePadding(String(d.getHours()),2,true,"0");
        let minutes:string = StringUtils.spacePadding(String(d.getMinutes()),2,true,"0");
        let seconds:string = StringUtils.spacePadding(String(d.getSeconds()),2,true,"0");
       
        dStr += "-" + hours + "-" + minutes + "-" + seconds;

        this.output.dbSnapshotName = this._config.dbSnapshotName + "-" + dStr;

        let cmd:CreateDBSnapshotCommand = new CreateDBSnapshotCommand({
            DBSnapshotIdentifier: this.output.dbSnapshotName, 
            DBInstanceIdentifier: this._config.database.DBInstanceIdentifier 
        });

        let response:CreateDBSnapshotCommandOutput = await this.rdsClient.send(cmd);
        this.output.dbSnapshotIdentifier = response.DBSnapshot.DBSnapshotIdentifier;

        let outStr: string = JSON.stringify(this.output, null, 2);
        fs.writeFileSync(this._config.outputFileName, outStr, "utf8");



        return new CommandResult("Snapshot created", response.DBSnapshot);
        
    }


    private async _deleteDatabase(): Promise<CommandResult<CreateDBInstanceCommandInput>> {

        let cmd: DeleteDBInstanceCommand = new DeleteDBInstanceCommand({
            DBInstanceIdentifier: this._config.database.DBInstanceIdentifier,
            SkipFinalSnapshot: true
        });

        try{
            let response: DeleteDBInstanceCommandOutput = await this.rdsClient.send(cmd);
            return new CommandResult("success");
        }catch(e){
            return new CommandResult("Could not delete the database");
        }
        
    }


    constructor(name?: string) {

        super(name);

    }

}


export class DevSessionStopTaskOutput {
    public dbSnapshotName:string; 
    public dbSnapshotIdentifier:string;
}