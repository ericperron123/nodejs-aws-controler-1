import {
    AttachInternetGatewayCommand, CreateInternetGatewayCommand, CreateInternetGatewayCommandOutput, CreateSubnetCommand, DeleteInternetGatewayCommand,
    DeleteSubnetCommand, DeleteVpcCommand, DescribeRouteTablesCommand, DescribeRouteTablesCommandOutput, DescribeSecurityGroupsCommand,
    DescribeSecurityGroupsCommandOutput, DescribeSubnetsCommand, DetachInternetGatewayCommand, EC2Client,
    InternetGateway,
    RouteTable, SecurityGroup, Subnet, Vpc
} from "@aws-sdk/client-ec2";

import { AppUtils } from "../app/AppUtils";
import { ArrayUtils } from "../epl/utils/ArrayUtils";
import { AWSUtils } from "./AWSUtils";
import { TagResourceType } from "./TagResourceType";


// import * as SubnetCIDRAdviser from "subnet-cidr-calculator";

var SubnetCIDRAdviser = require('subnet-cidr-calculator');

export class Ec2Utils {


    // -------------------------------
    // Subnet
    // -------------------------------

    public static async deleteSubnet(id: string, region: string): Promise<void> {

        let client: EC2Client = new EC2Client({ region: region });

        let cmd: DeleteSubnetCommand = new DeleteSubnetCommand({
            SubnetId: id
        });

        await client.send(cmd);
    }


    public static async createSubnet(name: string, azId: String, vpc: Vpc, region: string): Promise<Subnet> {

        let client: EC2Client = new EC2Client({ region: region });

        if (vpc == null)
            return;

        let subnetParams: any = {
            AvailabilityZoneId: azId,
            VpcId: vpc.VpcId,
            TagSpecifications: [{
                ResourceType: TagResourceType.subnet,
                Tags: [{ Key: "Name", Value: name }]
            }]
        }

        let vpcBlock: string = vpc.CidrBlock.split("/")[0];
        let vpcSubnetMask: number = parseInt(vpc.CidrBlock.split("/")[1]);

        // --------------------------------------------------
        // get the existing CIDR block. 

        let subnets: Array<Subnet> = await this.listSubnets(vpc.VpcId, region);

        let existingSubnetCIDR: Array<string> = [];
        for (let each in subnets)
            existingSubnetCIDR.push(subnets[each].CidrBlock)

        // --------------------------------------------------
        // get CIDR block for new network

        let probabal_subnets: any = SubnetCIDRAdviser.calculate(vpcBlock, vpcSubnetMask, existingSubnetCIDR);
        let cidrToValidate = '';
        let nextValidCIDR: any = SubnetCIDRAdviser.getNextValidCIDR(vpc.CidrBlock, existingSubnetCIDR, probabal_subnets, cidrToValidate);

        subnetParams.CidrBlock = nextValidCIDR.newCIDR;

        // --------------------------------------------------
        // Create the subnet 

        let cmd: CreateSubnetCommand = new CreateSubnetCommand(subnetParams);
        let cmdResp: any = await client.send(cmd);
        return cmdResp.Subnet;

    }


    public static async listSubnets(vpcId: string, region: string): Promise<Array<Subnet>> {

        if (vpcId == null)
            return;

        let client: EC2Client = new EC2Client({ region: region });

        let cmd: DescribeSubnetsCommand = new DescribeSubnetsCommand({
            Filters: [
                {
                    Name: "vpc-id", Values: [vpcId]
                }
            ]
        });

        let results: any = await client.send(cmd);

        let arr: Array<string> = ArrayUtils.parse<string>(results.Subnets, (subnet: Subnet) => {
            return {
                SubnetId: subnet.SubnetId,
                VpcId: subnet.VpcId,
                CidrBlock: subnet.CidrBlock,
                AvailabilityZoneId: subnet.AvailabilityZoneId,
                Tags: AWSUtils.tagsToString(subnet.Tags)
            }
        });

        let strOut: string = AppUtils.objToTableString(arr, [
            "SubnetId", "VpcId", "CidrBlock", "AvailabilityZoneId", "Tags"
        ]);

        return results.Subnets;

    }


    // -------------------------------
    // VPC
    // -------------------------------

    public static async deleteVpc(id: string, region: string): Promise<void> {

        let client: EC2Client = new EC2Client({ region: region });

        let cmd: DeleteVpcCommand = new DeleteVpcCommand({
            VpcId: id
        });

        await client.send(cmd);
    }

    public static async getVpcDefaultRouteTable(vpcId: string, region: string): Promise<RouteTable> {

        let client: EC2Client = new EC2Client({ region: region });
        let cmd: DescribeRouteTablesCommand = new DescribeRouteTablesCommand({
            Filters: [
                {
                    Name: "vpc-id", Values: [vpcId]
                }
            ]
        })

        let result: DescribeRouteTablesCommandOutput = await client.send(cmd);

        return result.RouteTables[0];
    }


    public static async getVpcDefaultSecurityGroup(vpcId: string, region: string): Promise<SecurityGroup> {

        let client: EC2Client = new EC2Client({ region: region });
        let cmd: DescribeSecurityGroupsCommand = new DescribeSecurityGroupsCommand({
            Filters: [
                {
                    Name: "vpc-id", Values: [vpcId]
                }
            ]
        })

        let result: DescribeSecurityGroupsCommandOutput = await client.send(cmd);

        return result.SecurityGroups[0];
    }


    // -------------------------------
    // Internet Gateway
    // -------------------------------

    public static async deleteInternetGateway(id: string, region: string): Promise<void> {

        let client: EC2Client = new EC2Client({ region: region });

        let cmd: DeleteInternetGatewayCommand = new DeleteInternetGatewayCommand({
            InternetGatewayId: id
        });

        await client.send(cmd);
    }


    public static async detachInternetGateway(id: string, vpcId: string, region: string): Promise<void> {

        let client: EC2Client = new EC2Client({ region: region });

        let cmd: DetachInternetGatewayCommand = new DetachInternetGatewayCommand({
            VpcId: vpcId,
            InternetGatewayId: id
        });

        await client.send(cmd);
    }


    public static async createInternetGateway(vpcId: string, region: string): Promise<InternetGateway> {

        let client: EC2Client = new EC2Client({ region: region });

        let cmd: CreateInternetGatewayCommand = new CreateInternetGatewayCommand({});
        let results: CreateInternetGatewayCommandOutput = await client.send(cmd);
        let ig:InternetGateway = results.InternetGateway;

        let cmd2: AttachInternetGatewayCommand = new AttachInternetGatewayCommand({
            VpcId: vpcId,
            InternetGatewayId: ig.InternetGatewayId
        })

        await client.send(cmd2)

        return ig;
    }


}