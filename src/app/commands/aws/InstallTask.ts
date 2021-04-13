 /*
            1) create a vpc
               - this will isolate the dev environment. There is a maximum of 5 per account

            2) Add an Internet Gateway. 
               - This will allow for resources in the vpc to communicate with the internet

            3) Route Table
               - Modity the main route table so that 0.0.0.0/0 points to the Internet Gateway
               - Note: VPC has a default "main" route table and the subnets under the vpc 
                       are implicitly associated to the main route table. 
               
            4) Security Group
               - Modify the security group so that Inboud trafic from is accepted. 
               - Notes: 
                  - The Security Group is assigned to a VPC
                  - by default, the rules of the VPC Security Group will apply to the database. 
               
            5) Add 3 subnets 
               - This will allow for the database to have copies, if needed into different availability zones. 

            6) Place the subnets in a db subnet group. 
               - The database will be assigned to this group. 
               - If there is no DB subnet group, then it is a non-VPC DB instance.

            7) Save the output
               - JSON file that contains the ids of the subnets, vpc, etc. 
               - Loaded when needed by this application. 

            Notes:
               NACL: Network Access Control List
                     By default, all inbound/outbut traffic are allowed.
                     It is associated with the VPC and its subnets. 
               
*/



import {
    AuthorizeSecurityGroupIngressCommand, AuthorizeSecurityGroupIngressCommandOutput,
    CreateRouteCommand, CreateRouteCommandOutput, CreateVpcCommand,
    CreateVpcCommandOutput,
    EC2Client, InternetGateway,
    ModifyVpcAttributeCommand,
    ModifyVpcAttributeCommandOutput,
    RouteTable, SecurityGroup, Subnet, Vpc
} from "@aws-sdk/client-ec2";

import { CreateDBSubnetGroupCommand, CreateDBSubnetGroupCommandOutput, DBSubnetGroup, RDSClient} from "@aws-sdk/client-rds";
import * as fs from "fs";
import { Ec2Utils } from "../../../epl-aws/Ec2Utils";
import { TagResourceType } from "../../../epl-aws/TagResourceType";
import { StringUtils } from "../../../epl/utils/stringUtils/StringUtils";
import { App } from "../../App";
import { Install } from "../../AppConfig";
import { AppUtils } from "../../AppUtils";
import { CommandResult } from "../../types/Command";
import { Task } from "../../types/NTask";
import { UninstallCmdInput } from "./UninstallTask";






// This will initiate the AWS environment for this project. 

export class InstallCmd extends Task {


    // ******************************
    // Public properties 
    // ******************************
    

    public output: InitCmdOutput = new InitCmdOutput();


    // ******************************
    // Private properties 
    // ******************************
    
    private _config: Install;
    private _ec2Client: EC2Client;
    private _rdsClient: RDSClient;

    
    // ******************************
    // Public methods 
    // ******************************
    
    public run(): Task {

        this.addAction(async (params: any): Promise<CommandResult<void>|Task> =>{ 
            return this._init(params);
        }, "setup-aws-client");

        // confirm with user to continue
        this.addAction(async (params: any): Promise<CommandResult<void>|Task> =>{ 
            return this._confirm(params);
        }, "user-confirm");

        this.addAction(async (params: any): Promise<CommandResult<Vpc>|Task> =>{ 
            return this._createVpc(params);
        }, "create-vpc");

        this.addAction(async (params: any): Promise<CommandResult<Vpc>|Task> =>{ 
            return this._enbledDNSHostNames(params);
        }, "enable-dnshostnames-vpc");


        

        // create the internet gateway and attach it to the voc
        this.addAction(async (params: any): Promise<CommandResult<InternetGateway>|Task> =>{ 
            return this._createInternetGateway(params);
        }, "create-internet-gateway");

        this.addAction(async (params: any): Promise<CommandResult<void>|Task> =>{ 
            return this._modifyRouteTable(params);
        }, "modify-route-table");

        this.addAction(async (params: any): Promise<CommandResult<void>|Task> =>{ 
            return this._modifySecurityGroup(params);
        }, "modify-security-group");

        this.addAction(async (params: any): Promise<CommandResult<Array<Subnet>>|Task> =>{ 
            return this._createSubnets(params);
        }, "create-subnets");

        this.addAction(async (params: any): Promise<CommandResult<DBSubnetGroup>|Task> =>{ 
            return this._createDbSubnetGroup(params);
        }, "create-dbSubnetGroup");
                
        this.addAction(async (params: any): Promise<CommandResult<void>|Task> =>{ 
            return this._saveOutputFile(params);
        }, "save-output-file");
        
        // this will send back the object before starting its sequence. This 
        // way, updates will appear on the screen as they are made available. 
        setTimeout(() => { this.start(); }, 20);

        return this;

    }

    // ******************************
    // Private methods 
    // ******************************
    
    private async _modifyRouteTable(params: any): Promise<CommandResult<void> | Task> {

        // -----------------------------------------
        // Load the Route table

        await Ec2Utils.getVpcDefaultRouteTable(this.output.vpc.VpcId, this._config.region);

        let routeTable:RouteTable;

        try{
            routeTable =  await Ec2Utils.getVpcDefaultRouteTable(this.output.vpc.VpcId, this._config.region);
        } catch(e){
            return new CommandResult("WARNING: Could not load route table! " + e.message);
        }

        let cmd2:CreateRouteCommand = new CreateRouteCommand({
            RouteTableId: routeTable.RouteTableId,
            DestinationCidrBlock: this._config.vpc.routeTableRules.internetGateway.destination, 
            GatewayId: this.output.internetGateway.InternetGatewayId
        });

        try{
            let output2:CreateRouteCommandOutput = await this._ec2Client.send(cmd2);
            return new CommandResult(output2.Return?"Success":"Could not add route to route table");
        }
        catch(e){
            return new CommandResult("WARNING: Could not modify route table! " + e.message);
        }

    }

    private async _modifySecurityGroup(params: any): Promise<CommandResult<void> | Task> {

        // -----------------------------------------
        // Load the Security Group

        let securityGroup:SecurityGroup;

        try{
            securityGroup = await Ec2Utils.getVpcDefaultSecurityGroup(this.output.vpc.VpcId, this._config.region);
        } catch(e){
            return new CommandResult("WARNING: Could not load route table! " + e.message);
        }
        
        let cmd2: AuthorizeSecurityGroupIngressCommand = new AuthorizeSecurityGroupIngressCommand({
            GroupId: securityGroup.GroupId,
            IpPermissions: [{
                FromPort: 3306,
                ToPort: 3306,
                IpProtocol: "tcp",
                IpRanges: [
                    { CidrIp: '0.0.0.0/0', Description: 'All IPv4 Addresses' }
                ],
                Ipv6Ranges: [
                    { CidrIpv6: '::/0', Description: 'All IPv6 Addresses' }
                ]
            }]
        });

        try{

            let output2: AuthorizeSecurityGroupIngressCommandOutput = await this._ec2Client.send(cmd2);
            return new CommandResult("Success");
        }
        catch(e){
            return new CommandResult("WARNING: Could not modify security group! " + e.message);
        }

    }


    private async _init(params: any): Promise<CommandResult<void> | Task> {

        this.name = "init-environment";

        this._config = App.config.data.cmdDefaults.install;
        let region: string = this._config.region;

        this._ec2Client = new EC2Client({ region: region });
        this._rdsClient = new RDSClient({ region: region });

        return new CommandResult("Region has been set to " + region, null);

    }

    private async _confirm(params: any): Promise<CommandResult<void> | Task> {

        let answer: string = await App.console.prompt("\n\nThis will create a new vpc, subnet group and subnets on which the database will be deployed. Continue? [Y/N]\n")
        let flag: boolean = StringUtils.toBool(answer);

        if (!flag) {
            this.pause();
            this.emitComplete("Aborted");
            return new CommandResult("User has abordted process");
        }

        return new CommandResult("User has confirmed");
    }

    private async _createVpc(params: any): Promise<CommandResult<Vpc> | Task> {

        let name: string = this._config.vpc.name;

        let cmd: CreateVpcCommand = new CreateVpcCommand({
            CidrBlock: "10.0.0.0/16",
            TagSpecifications: [{
                ResourceType: TagResourceType.vpc,
                Tags: [
                    { Key: "Name", Value: name }]
            }]
        });

        try {
            let results: CreateVpcCommandOutput = await this._ec2Client.send(cmd);
            this.output.vpc = results.Vpc;
            return new CommandResult("VPC has been created!", results.Vpc);
        }
        catch (err) {
            return new CommandResult(err);
        }

    }

   
    /*
        Indicates whether the instances launched in the VPC get DNS hostnames. If enabled, instances in the VPC get DNS hostnames; otherwise, they do not.
    */

    private async _enbledDNSHostNames(params: any): Promise<CommandResult<any> | Task> {

        let name: string = this._config.vpc.name;

        let cmd: ModifyVpcAttributeCommand = new ModifyVpcAttributeCommand({
            VpcId:this.output.vpc.VpcId, 
            EnableDnsHostnames: {Value:true}
        });

        try {
            let results: ModifyVpcAttributeCommandOutput = await this._ec2Client.send(cmd);
            return new CommandResult("DNS has been enabled on VPC!");
        }
        catch (err) {
            return new CommandResult(err);
        }

    }

    private async _createInternetGateway(params: any): Promise<CommandResult<Vpc> | Task> {
    
        try {
            this.output.internetGateway = await Ec2Utils.createInternetGateway(this.output.vpc.VpcId, this._config.region);
        } catch(e){
            this.emitUpdate("WARNING: Unable to create/attach the Internet Gateway: " + e.message);
        }

        return new CommandResult("Internet gateway has been created!", this.output.internetGateway);

    }


    private async _createSubnets(params: any): Promise<CommandResult<Array<Subnet>> | Task>{

        
        try {

            let subnet: Subnet = await Ec2Utils.createSubnet(this._config.subnet1.name, this._config.subnet1.az, this.output.vpc, this._config.region);
            this.output.subnets.push(subnet);
            this.emitUpdate("Subnet 1 Created");

            subnet = await Ec2Utils.createSubnet(this._config.subnet2.name, this._config.subnet2.az, this.output.vpc, this._config.region);
            this.output.subnets.push(subnet);
            this.emitUpdate("Subnet 2 Created");

            subnet = await Ec2Utils.createSubnet(this._config.subnet3.name, this._config.subnet3.az, this.output.vpc, this._config.region);
            this.output.subnets.push(subnet);
            this.emitUpdate("Subnet 3 Created");

            return new CommandResult("The subnets have been created!", this.output.subnets);
        }
        catch (err) {
            return new CommandResult(err);
        }
    }


    private async _createDbSubnetGroup(params: any): Promise<CommandResult<DBSubnetGroup> | Task>{

        let subnetIds: Array<string> = [];
        this.output.subnets.forEach((subnet: Subnet) => {
            subnetIds.push(subnet.SubnetId);
        })

        let cmd: CreateDBSubnetGroupCommand = new CreateDBSubnetGroupCommand({
            DBSubnetGroupName: this._config.subnetGroup.name,
            SubnetIds: subnetIds,
            DBSubnetGroupDescription: this._config.subnetGroup.description
        });

        try {

            let response: CreateDBSubnetGroupCommandOutput = await this._rdsClient.send(cmd);
            let strResponse: string = "Subnet group [" + this._config.subnetGroup.name + "] has been created!\r\n\r\n";

            this.output.dbSubnetGroup = response.DBSubnetGroup;

            strResponse += AppUtils.objToTableString(response.DBSubnetGroup);

            return new CommandResult(strResponse, response.DBSubnetGroup);

        } catch (err) {
            return new CommandResult(err);
        }

    }





    private async _saveOutputFile(params: any): Promise<CommandResult<void> | Task>{

        this.emitUpdate("Save environemnt data");

        let o: UninstallCmdInput = new UninstallCmdInput();
        o.vpcId = this.output.vpc.VpcId;

        if (this.output.dbSubnetGroup)
            o.dbSubnetGroupName = this.output.dbSubnetGroup.DBSubnetGroupName;

        o.subnetIds = [
            this.output.subnets[0].SubnetId,
            this.output.subnets[1].SubnetId,
            this.output.subnets[2].SubnetId
        ]
        o.internetGatewayId = this.output.internetGateway.InternetGatewayId;

        let outStr: string = JSON.stringify(o, null, 2);
        fs.writeFileSync(this._config.outputFileName, outStr, "utf8");
        return new CommandResult("File created.");

    }


    constructor(name?: string) {
        super(name);
    }

}



export class InitCmdOutput {

    public vpc: Vpc;
    public internetGateway: InternetGateway;
    public subnets: Subnet[] = [];
    public dbSubnetGroup: DBSubnetGroup;

}