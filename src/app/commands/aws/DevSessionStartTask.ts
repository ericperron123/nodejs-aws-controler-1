/* 
    // The objective of this task is to limit expenses by adding/removing Cloud resources 
    // that incure cost when they are not used. 
    
    1) Create database using the parameters found in the config file. 
    2) Monitor the status of the created database until it is available. 

*/

import { EC2Client, Vpc } from "@aws-sdk/client-ec2";
import { CreateDBInstanceCommand, CreateDBInstanceCommandInput, CreateDBInstanceCommandOutput, DBInstance, RDSClient, 
    RestoreDBInstanceFromDBSnapshotCommand, RestoreDBInstanceFromDBSnapshotCommandInput, 
    RestoreDBInstanceFromDBSnapshotCommandOutput } from "@aws-sdk/client-rds";
import { RdsStatusMonitor, RdsStatusMonitorEventType } from "../../../epl-aws/RDSUtils";
import { EplEvent } from "../../../epl/EPLStyleEventEmitter";
import { StringUtils } from "../../../epl/utils/stringUtils/StringUtils";
import { Utils } from "../../../epl/utils/Utils";
import { App } from "../../App";
import { DevSession, Install } from "../../AppConfig";
import { CommandResult } from "../../types/Command";
import { Task, NTaskStatus } from "../../types/NTask";
import * as fs from "fs";
import { Logger } from "../../../epl-nodejs/Logger";

// This will initiate the AWS environment for this project. 

export class DevSessionStartTask extends Task {

    private _configInst: Install;
    private _config: DevSession;

    public dbSnapshotName:string;
    public masterUserPassword:string = "";

    public ec2Client: EC2Client;
    public rdsClient: RDSClient;

    public run(): Task {

        this.name = "init-environment";

        this.addAction(async (params: any): Promise<CommandResult<void> | Task> => {
            return await this._init(params);
        }, "setup-aws-client");

        // Create the database

        this.addAction(async (params: any): Promise<CommandResult<CreateDBInstanceCommandInput> | this> => {
            
            try {
                if(this.dbSnapshotName)
                    await this._restoreDatabase(this.dbSnapshotName);
                else 
                    await this._createDatabase();
            
            } catch (err) {
                this.emitError(err);
                this.status = NTaskStatus.ERROR;
                return new CommandResult(err);
            }
        }, "create-database");

        // monitor for database status

        this.addAction(async (params: any): Promise<CommandResult<void> | Task> => {

            this.pause();
            let dbId: string = this._config.database.DBInstanceIdentifier;

            let sm: RdsStatusMonitor = new RdsStatusMonitor();

            sm.on(RdsStatusMonitorEventType.STATUS_CHANGE, (event: EplEvent) => {
                let db:DBInstance = event.data; 

                this.emitUpdate("Database [" + dbId + "] has changed status to " + db.DBInstanceStatus + ".");
                if(db.DBInstanceStatus == "available"){
                    
                    let msg:string = "\n\nRecovered database [" + db.DBInstanceIdentifier + "]: ";
                    msg += "\n  endpoint: " + db.Endpoint.Address;
                    msg += "\n  port: " + db.Endpoint.Port;
                    msg += "\n  user: " + db.MasterUsername;
                    msg += "\n  pswd: " + this.masterUserPassword;
                    msg += "\n  dbName: " + db.DBName;
                    msg += "\n\n\n";
                    this.emitUpdate(msg);

                    App.console.beep();
                    App.console.beep();
                    sm.stop();
                    sm.offAll();
                    this.next();
                }
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

        try{
            let fileStr:string = fs.readFileSync(this._config.outputFileName, "utf-8");
            let fileData:any =  JSON.parse(fileStr);
            this.dbSnapshotName = fileData.dbSnapshotName;
        } catch(e){}
       
        let region: string = this._configInst.region;

        this.rdsClient = new RDSClient({ region: region });

        return new CommandResult("Region has been set to " + region, null);

    }

    private async _restoreDatabase(dbSnapshotName:string): Promise<CommandResult<DBInstance>> {
        let dbInput: any = Utils.clone(this._config.database);

        this.masterUserPassword = dbInput.MasterUserPassword;
        // The following parameters are not needed for restore.
        delete dbInput.AllocatedStorage;
        delete dbInput.MasterUsername;
        delete dbInput.MasterUserPassword;
        delete dbInput.DBName;

        dbInput.DBSnapshotIdentifier = dbSnapshotName;

        let cmd: RestoreDBInstanceFromDBSnapshotCommand = new RestoreDBInstanceFromDBSnapshotCommand(dbInput as RestoreDBInstanceFromDBSnapshotCommandInput);
        let response: RestoreDBInstanceFromDBSnapshotCommandOutput = await this.rdsClient.send(cmd);
        
        let msg:string = "\n\nRecovering database from snapshot [" + dbSnapshotName + "]\n\n";
        
        this.emitUpdate(msg);
        Logger.info(msg);
        
        return new CommandResult(this._dbParamsToString(dbInput), response.DBInstance);
    }

    private async _createDatabase(): Promise<CommandResult<DBInstance>> {

        let dbInput: CreateDBInstanceCommandInput = this._config.database;
       
        // if there is no password, create one. 
        if (dbInput.MasterUserPassword == null)
            dbInput.MasterUserPassword = StringUtils.randomString(8);
        
        this.masterUserPassword = dbInput.MasterUserPassword;

        let cmd: CreateDBInstanceCommand = new CreateDBInstanceCommand(dbInput);
        let response: CreateDBInstanceCommandOutput = await this.rdsClient.send(cmd);

        let msg:string = "\n\nCreating database: ";
        msg += "\n  endpoint: " + response.DBInstance.Endpoint;
        msg += "\n  port: " + response.DBInstance.DbInstancePort;
        msg += "\n  user: " + response.DBInstance.MasterUsername;
        msg += "\n  pswd: " + dbInput.MasterUserPassword;
        msg += "\n\n\n";
        
        this.emitUpdate(msg);
        Logger.info(msg);

        return new CommandResult(this._dbParamsToString(dbInput), response.DBInstance);

    }

    private _dbParamsToString(params: any): string {
        let strResponse: string = "A request to create a new {0}GB {1} databse has been sent to the server.\nInstance Type: {2}\n"
        strResponse += "Port: {3}\nCredentials: {4} | {5}\n\n";
        strResponse += "Please wait for the creating process to be completed. This may take a few minutes.";

        strResponse = StringUtils.Format(strResponse, [
            params.AllocatedStorage,
            params.Engine,
            params.DBInstanceClass,
            params.Port,
            params.MasterUsername,
            params.MasterUserPassword
        ]);

        return strResponse;
    }




    constructor(name?: string) {

        super(name);

    }

}
