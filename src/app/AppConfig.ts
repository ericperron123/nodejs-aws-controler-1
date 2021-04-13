import * as fs from "fs";
import { PropertiesFile } from "../epl/file/PropertiesFile";


export class AppConfig {

    private file:PropertiesFile = new PropertiesFile();
    
    public data:root;

    public async load(path:string):Promise<any>{
        
        let fileStr:string = fs.readFileSync(path, "utf-8");
        this.data = await this.file.read(fileStr);
      
    }
    
    public async save():Promise<any>{

    }

}


//*****************************************************
// INTERFACE for the data object
//*****************************************************

export interface root{
    cmdDefaults:cmdDefaults;
    logPath:string;
    logLevel:string;
    
}
export interface cmdDefaults{
    install:Install;
    devSession:DevSession;
}

export interface DevSession{
    dbSnapshotName:string;
    outputFileName:string;
    database:Database;
}

export interface Install{
    region:string;
    vpc:Vpc;
    subnet1:Subnet; 
    subnet2:Subnet; 
    subnet3:Subnet;
    subnetGroup:SubnetGroup;
    outputFileName:string;
}

export interface Vpc{
    name:string;
    routeTableRules:RouteTableRules;
}

export interface RouteTableRules{
    internetGateway:InternetGateway;
}

export interface InternetGateway{
    destination:string;
}

export interface Subnet{
    az:string;
    name:string;
}

export interface SubnetGroup{
    name:string;
    description:string;
}

export interface Database {
    AllocatedStorage:number;
    DBInstanceIdentifier: string;
    DBInstanceClass:string;
    Engine:string;
    MasterUsername:string;
    Port:number;
    DBName:string;
    PubliclyAccessible:boolean;
    DBSubnetGroupName:string;
  }
