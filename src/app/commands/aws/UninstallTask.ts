import { EC2Client, Subnet, Vpc } from "@aws-sdk/client-ec2";
import { DBSubnetGroup, RDSClient } from "@aws-sdk/client-rds";
import * as fs from "fs";
import { Ec2Utils } from "../../../epl-aws/Ec2Utils";
import { RDSUtils } from "../../../epl-aws/RDSUtils";
import { ArrayUtils } from "../../../epl/utils/ArrayUtils";
import { StringUtils } from "../../../epl/utils/stringUtils/StringUtils";
import { App } from "../../App";
import { Install } from "../../AppConfig";
import { CommandResult } from "../../types/Command";
import { Task } from "../../types/NTask";


// import * as SubnetCIDRAdviser from "subnet-cidr-calculator";
var SubnetCIDRAdviser = require('subnet-cidr-calculator');


// This will initiate the AWS environment for this project. 

export class UninstallCmd extends Task {

    private _config: Install;

    public ec2Client: EC2Client;
    public rdsClient: RDSClient;

    public input: UninstallCmdInput = new UninstallCmdInput();

    private _vpc: Vpc;
    private _subnets: Subnet[] = [];

    public run(): Task {

        
        this.name = "uninstall";

        // ------------------------------------
        // STEP 0: Confirm with user
        // ------------------------------------
        this.addAction(async (params: any): Promise<CommandResult<void> | Task> => {

            let answer: string = await App.console.prompt("\n\nThis will remove the (1) VPC, (2) subnet group and (3) the subnets on which the database is installed. Are you sure you want to continue? [Y/N]\n")
            let flag: boolean = StringUtils.toBool(answer);

            if (!flag) {
                this.pause();
                this.emitComplete("Aborted");
                return new CommandResult("User has abordted process");
            }

            return new CommandResult("User has confirmed");

        }, "user-confirm");


        // ------------------------------------
        // STEP 1: Set the AWS Clients
        // ------------------------------------

        this.name = "uninstall";

        this.addAction(async (params: any): Promise<CommandResult<void> | Task> => {

            this.emitUpdate("preparing the clients to connect to AWS");

            this._config = App.config.data.cmdDefaults.install;
            let region: string = this._config.region;

            this.ec2Client = new EC2Client({ region: region });
            this.rdsClient = new RDSClient({ region: region });

            return new CommandResult("Region has been set to " + region, null);

        }, "setup-aws-client");







        // ------------------------------------
        // STEP 2: load data from file
        // ------------------------------------

        this.addAction(async (params: any): Promise<CommandResult<void> | Task> => {

            try {
                let fileStr: string = fs.readFileSync(this._config.outputFileName, "utf8");
                let data: any = JSON.parse(fileStr);

                this.input.vpcId = data.vpcId;
                this.input.subnetIds = data.subnetIds;
                this.input.dbSubnetGroupName = data.dbSubnetGroupName;
                this.input.internetGatewayId = data.internetGatewayId;

            }
            catch (e) {
                this.pause();
                this.emitError("Could not open file");
                this.emitComplete("Could not open file");
            }

            return new CommandResult("Data has been loaded", null);

        }, "setup-aws-client");



        // Delete Db Subnet Group
        
        this.addAction(async (params: any): Promise<CommandResult<DBSubnetGroup> | Task> => {
            try {
                await RDSUtils.deleteDbSubnetGroup(this.input.dbSubnetGroupName, this._config.region);
            } catch (err) {
                return new CommandResult("WARNING: Could not delete the DbSubnetGroup!");
            }
            return new CommandResult("Subnet group [" + this.input.dbSubnetGroupName + "] has been deleted!");
        }, "delete-dbSubnetGroup");


        // Delete Subnets
        
        this.addAction(async (params: any): Promise<CommandResult<DBSubnetGroup> | Task> => {

            this.emitUpdate("Delete the subnets");

            await ArrayUtils.forEachAsync(this.input.subnetIds, async (subnetId: string): Promise<void> => {
                try {
                    await Ec2Utils.deleteSubnet(subnetId, this._config.region);
                } catch (e) {
                    this.emitUpdate("Unable to delete subnet " + subnetId + ": " + e.message);
                }
            });

            return new CommandResult("Delete subnets command complete!");

        }, "delete-subnets");


        // Detach Internet Gateway
        
        this.addAction(async (params: any): Promise<CommandResult<DBSubnetGroup> | Task> => {

            try {
                await Ec2Utils.detachInternetGateway(this.input.internetGatewayId, this.input.vpcId, this._config.region);
            } catch (e) {
                this.emitUpdate("Unable to delete Internet Gateway! " + e.message);
            }

            return new CommandResult("internet gateway has been Detached!");

        }, "detach-internet-gateway");
        


        // Delete Internet Gateway
        
        this.addAction(async (params: any): Promise<CommandResult<DBSubnetGroup> | Task> => {

            try {
                await Ec2Utils.deleteInternetGateway(this.input.internetGatewayId, this._config.region);
            } catch (e) {
                this.emitUpdate("Unable to delete Internet Gateway! " + e.message);
            }
            return new CommandResult("Internet Gateway has been deleted!");

        }, "delete-internet-gateway");


        
        // Delete Vpc
        
        this.addAction(async (params: any): Promise<CommandResult<DBSubnetGroup> | Task> => {
            try {
                await Ec2Utils.deleteVpc(this.input.vpcId, this._config.region);
            } catch (e) {
                this.emitUpdate("Unable to delete vpc! " + e.message);
            }
    
            return new CommandResult("VPC has been deleted!");
        }, "delete-vpc");
        

        // Delete data file 

        this.addAction(async (params: any): Promise<CommandResult<DBSubnetGroup> | Task> => {
            return this._deleteDataFile();
        }, "delete-data-file");

        
        // this will send back the object before starting its sequence. This 
        // way, updates will appear on the screen as they are made available. 
        setTimeout(() => { this.start(); }, 20);

        return this;
    }


    private async _deleteDataFile(): Promise<CommandResult<DBSubnetGroup>>{

        try {
            fs.unlinkSync(this._config.outputFileName);
            return new CommandResult("File has been deleted!");
        } catch (err) {
            return new CommandResult(err);
        }

    }




    constructor(name?: string) {

        super(name);

    }

}

export class UninstallCmdInput {

    public vpcId: string;
    public dbSubnetGroupName: string;
    public subnetIds: string[];
    public internetGatewayId:string;

}