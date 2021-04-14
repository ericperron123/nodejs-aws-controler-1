**Author: ericperron.com, March 03, 2021**

This tool lets a developer spin up an AWS database on the fly to access during a development session. Once the dev session is over, the database can be automatically be deleted. 

Note that this tool takes a snapshot of the database before deleting it so that the snapshot is used to restore the database on the next Developer Session. 

Doing this can help in keeping Infrastructure costs to a minimum. 


### In this file: 

- Install Steps
- Setup of AWS-CLI/Developer Account
- Compiling the code
- Running the code
- Debugging the code

# Install Steps

1) Download and Install NodeJS from https://nodejs.org/
   - This will also install NPM.

2) Install typeScript globally by running the following command: 
   
   > npm install -g typescript

3) Download and install Visual Studio Code from https://code.visualstudio.com/

4) Create an empty folder for your project

5) Open Visual Studio Code

6) Open a Terminal Window. Terminal > New Terminal. This is where you will run commands!

7) Run the following command and answer the questions. You can use default values by pressing the 
   ENTER.
   
   > npm init 

8) Run the following commands to install typescript and the express server. 

   > npm install -D typescript
   > npm install -D @types/express
   > npm install express
   
9) Pull the project from GIT

10) Run the following commands to install the node-modules (these are defined in the package-lock.json file)  
    
    > npm install

11) Create the following directory which is ignored in GIT: 

    - \workspace
    - \workspace\logs
	 

# Setup of AWS-CLI/Developer Account

To run this project, you will need an AWS Developer account. 

1) Create a new IAM user through the console
  
  a) Open AWS Console > IAM > users > Add User
  b) choose a name such as “global-cli-user”
  c) Give it programmatic access
  d) You can choose the user groups to which your user belongs. For instance, 
     Developer’s group
     Administrators
     
     * If the group does not exist you will need to create the group after you have created the user 
       and assign the user to that group.
  
  WARNING: Once the account has been created, you will be provided with an Access key ID and a 
  secret access key. Keep these for your records and do not share with anyone. You will not get 
  access to the secret access key again. 

2) Download and install the CLI Client from AWS 
   
   https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-windows.html#cliv2-windows-Install

   verify that install was successful by running the following command
   
   > aws --version

3) Configure the AWS CLI client. This needs to be done once.

   run the following command: 

   > aws --configure

   You will be asked to provide values for each of the following properties. Here are sample values: 

   - Access key: AKIAIOSFODNN7EXAMPLE
   - Secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   - default region name: ca-central-1 
   - Default output format: ENTER

   Congratulation. You are now connected!

   

## Compiling the Code

Simply type the following command in the terminal: 

> tsc

## Running the Code

Type the following command in the terminal: 

> node dist-debug/js/Main.js

## Debugging the Code

Notice the "launch.json" file that has been created under .vscode. This file defines the
parameters to lauch a debug session in VSC. You can hit F5 or click on the debug icon on the left menu 
and select the "Launch Program" option on the top bar. 
