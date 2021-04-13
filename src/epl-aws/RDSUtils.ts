import { DeleteInternetGatewayCommand, DeleteVpcCommand, DetachInternetGatewayCommand } from "@aws-sdk/client-ec2";
import { DBInstance, DBSnapshot, DeleteDBSubnetGroupCommand, DescribeDBInstancesCommand, DescribeDBInstancesCommandOutput, DescribeDBSnapshotsCommand, DescribeDBSnapshotsCommandOutput, RDSClient } from "@aws-sdk/client-rds";
import { AppUtils } from "../app/AppUtils";
import { CommandResult } from "../app/types/Command";
import { EPLStyleEventEmitter } from "../epl/EPLStyleEventEmitter";
import { Timer } from "../epl/Timer";

export class RDSUtils {


    // -----------------------------------------
    // Database
    // -----------------------------------------

    public static async listDatabases(region: string): Promise<CommandResult<DBInstance[]>> {

        let client: RDSClient = new RDSClient({ region: region });

        let cmd: DescribeDBInstancesCommand = new DescribeDBInstancesCommand({});
        let response: DescribeDBInstancesCommandOutput = await client.send(cmd);
        let strResponse: string = "no database found.";

        if (response.DBInstances.length > 0)
            strResponse = AppUtils.objToTableString(response.DBInstances, ["DBInstanceIdentifier", "DBInstanceStatus"]);

        return new CommandResult<DBInstance[]>(strResponse, response.DBInstances)
    }


    public static async getDatabase(name: string, region: string): Promise<CommandResult<DBInstance>> {

        let client: RDSClient = new RDSClient({ region: region });

        let cmd: DescribeDBInstancesCommand = new DescribeDBInstancesCommand({
            Filters: [{
                Name: "db-instance-id",
                Values: [name],
            }]
        });
        let dbInstance:DBInstance; 

        try{
            let response: DescribeDBInstancesCommandOutput = await client.send(cmd);
            if (!response || !response.DBInstances || response.DBInstances.length == 0)
                return null;
            dbInstance = response.DBInstances[0]

        } catch(e){
            return null;
        }

        
        let strOut: string = AppUtils.objToTableString(dbInstance);
        return new CommandResult(strOut, dbInstance);

    }

    public static async getDBSnapshot(id: string, region: string): Promise<CommandResult<DBSnapshot>> {

        let client: RDSClient = new RDSClient({ region: region });

        let cmd: DescribeDBSnapshotsCommand = new DescribeDBSnapshotsCommand({
            Filters: [{
                Name: "db-snapshot-id",
                Values: [id],
            }]
        });
        try{
            let response: DescribeDBSnapshotsCommandOutput = await client.send(cmd);
            if (!response || !response.DBSnapshots || response.DBSnapshots.length == 0)
                return null;
            let strOut: string = AppUtils.objToTableString(response.DBSnapshots[0]);
            return new CommandResult(strOut, response.DBSnapshots[0]);
        } catch(e){
            return null;
        }

       

      

    }





    // -------------------------------
    // Subnet
    // -------------------------------

    public static async deleteDbSubnetGroup(name: string, region: string): Promise<void> {

        let client: RDSClient = new RDSClient({ region: region });

        let cmd: DeleteDBSubnetGroupCommand = new DeleteDBSubnetGroupCommand({
            DBSubnetGroupName: name
        });

        await client.send(cmd);
    }



}

export class RdsStatusMonitor extends EPLStyleEventEmitter {

    public interval: number = 10000; // 10 seconds
    public status: string = "";


    private _stopped: boolean = false;

    public stop(): void {
        this._stopped = true;
    }


    public monitorDB(dbInstanceIdentifier: string, region: string): void {

        Timer.setIntervalAsync(async () => {

            let getDbCmd: CommandResult<DBInstance> = await RDSUtils.getDatabase(dbInstanceIdentifier, region);
            if (!getDbCmd || !getDbCmd.data) {
                this.emit(RdsStatusMonitorEventType.NOT_FOUND, { status: "not found" });
                return true;
            }

            if (this.status == getDbCmd.data.DBInstanceStatus)
                return true;

            this.status = getDbCmd.data.DBInstanceStatus;

            this.emit(RdsStatusMonitorEventType.STATUS_CHANGE, getDbCmd.data);

            return (!this._stopped)

        }, this.interval);
    }


    public monitorDBSnapshot(dbSnapshotIdentifier: string, region: string): void {

        Timer.setIntervalAsync(async () => {

            let getDbCmd: CommandResult<DBSnapshot> = await RDSUtils.getDBSnapshot(dbSnapshotIdentifier, region);
           
            if (!getDbCmd || !getDbCmd.data) {
                this.emit(RdsStatusMonitorEventType.NOT_FOUND, { status: "not found" });
                return true;
            }

            if (this.status == getDbCmd.data.Status)
                return true;

            this.status = getDbCmd.data.Status;

            this.emit(RdsStatusMonitorEventType.STATUS_CHANGE, { status: this.status });

            return (!this._stopped)

        }, this.interval); 
    }







}

export enum RdsStatusMonitorEventType {
    NOT_FOUND = "notFound",
    STATUS_CHANGE = "statusChange",
}