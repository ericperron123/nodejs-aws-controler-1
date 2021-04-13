import { Logger } from "../../epl-nodejs/Logger";
import { EplEvent, EPLStyleEventEmitter } from "../../epl/EPLStyleEventEmitter";
import { List } from "../../epl/List";
import { StringUtils } from "../../epl/utils/stringUtils/StringUtils";
import { CommandMessage, CommandResult } from "./Command";


export class Task extends EPLStyleEventEmitter {


    public parent: Task;
    public name:string;
    public actions: List<NTaskAction> = new List();
    public index: number = -1;
    public input:any;
    public output:any;
    public id:string;
    public status:NTaskStatus = NTaskStatus.NOT_STARTED;

    public static forEach(arr:Array<any>, f:(() => Promise<CommandResult<any>>)|typeof Task, parent?:Task):Task {

        
        // create a new task that will manage the actions
        let task:Task = new Task("for-each");
        task.parent = parent;
        Logger.debug("Task {0} [{1}] forEach item has started.", [task.name, task.id]);
      
        let anyF:any = f;
        
        // create an action for each of these 
        for(var i:number = 0;i < arr.length; i++)
        {
            if(anyF.prototype instanceof Task) {
                let childTask:Task = new (f as typeof Task)();
                childTask.input =  arr[i];
                anyF = childTask;
            }
                
            task.addAction(anyF, "itemCommand", arr[i])
        }     

        return task;
    }
    
    public start(): void {
        this.status = NTaskStatus.PLAY;
        
        this.index = -1;

        if (this.actions.length == 0)
            this.emitUpdate("TASK " + this.name + "[" + this.id + "]: Start, but there are no actions to run!", {
                status: "started"
            });
        else
            this.emitUpdate("TASK " + this.name + "[" + this.id + "] has started!", {
                status: "started"
            });

        setTimeout(()=>{this.next();},12);
            
    }

    public pause():void{
        this.status = NTaskStatus.PAUSE;
    }

    public async next():Promise<void> {
        
        this.status = NTaskStatus.PLAY;

        this.index += 1;
       
        // Is it completed? 
        if(this.index >= this.actions.length)
        {
            this.emitComplete("TASK " + this.name + "[" + this.id + "]: Complete!");
            return;
        }

        // run the next action
        let action:NTaskAction = this.actions.itemAt(this.index);

        // Getting the next action... notifying others first. 
        let msg:string = StringUtils.Format("TASK {0}[{1}] Starting {2} ({3} of {4})",[this.name, this.id, action.name, this.index + 1, this.actions.length]);
        this.emitUpdate(msg,{
            status: "next", 
            index: this.index
        });
        
        if(action.type == NTaskActionType.TASK){
            
            setTimeout(()=>{ this._runTask(action);},12);
            
            return;
        }
        else {
            this._runCommand(action);
            return 
        }
    }

    protected async _runCommand(action: NTaskAction): Promise<any> {

        let anyItem: any = action.item;
        let cmd: ((input?: any) => Promise<CommandResult<any> | Task>) = anyItem;
        let result: CommandResult<any> | Task = await cmd(action.input);
        
        
        // if the command returned nothing, go to the next action. 
        if(result == null) {
            if(this.status == NTaskStatus.PLAY)
                this.next();
            return;
        }
        
        // if the result is a command result, 
        //   emit an update 
        //   update the output of the action
        //   go to the next item
        if (result instanceof CommandResult) 
        {
            action.output = result.data;
            
            this.emit("update", new CommandMessage(action.item.name, result));

            if(result.error)
                this.emitError("Error:" + result.error.message);
            
            if(this.status == NTaskStatus.PLAY)
                this.next();
        
            return
        }

        // if the result is a task, 
        //   add the task as a new action to perform after this one.  
        //   go to the next item

        if (result && result instanceof Task) {
            this.addAction(result, action.item.name, null, this.index + 1);
            this.emit("update", new CommandMessage("Item in " + action.name +" has returned a Task.", result));
            if(this.status == NTaskStatus.PLAY)
                this.next();
            return;
        }
    }

    protected _runTask(action:NTaskAction):void
    {
        let task:Task = action.item as Task;

        // relay update events
        task.on("update",(event:EplEvent):void=>{
            this.emit("update", new CommandMessage(event.data.message,{
                action: action,
                data: event.data
            }));
            action.output = task.output;
        }, this);

        task.on("complete", (event:EplEvent):void=>{
            // unsubscrib from all events on the action's task
            task.offAll(this);
            this.emit("update",new CommandMessage(event.data.message,{
                action: action,
                data: event.data
            }));

            // update the output data
            action.output = task.output;

            // go to next action
            if(this.status == NTaskStatus.PLAY)
                this.next();

        }, this);

        task.input = action.input;
        task.start();      
    }
    
    public get currentChild():NTaskAction{
        return this.actions.itemAt(this.index);
    }


    public addAction(
        action: NTaskAction | Task | ((input?:any) => Promise<CommandResult<any>|Task>), 
        name?: string,
        input?: any, 
        index?:number
    ): NTaskAction {

        let anyChild: any = action;
        let newAction:NTaskAction;

        if (action instanceof NTaskAction) 
        {
            newAction = action;
            newAction.parent = this;
            if(input)
                newAction.input = input;
        }
        else {
            newAction = new NTaskAction(anyChild, name, this, input);
        }
        if(index > -1)
            this.actions.addItemAt(newAction, index);
        else 
            this.actions.addItem(newAction);
        
        return newAction;

    }


    public bindUpdateEvents(task:Task):void{
        
        if(task == this)
            throw Error("A task cannot relay events from itself!");

        task.on("update", (event:EplEvent) => {
            let snTaskMessage:CommandMessage<any> = event.data;
            snTaskMessage.message = ".." + snTaskMessage.message;
            this.emit("update", snTaskMessage);
        }, this);
    
    }

    public unbindUpdateEvents(task:Task):void{
        task.off("update", null, this);
    }

    public unbindCompleteEvents(task:Task):void{
        task.off("complete", null, this);
    }

    public bindCompleteEvents(task:Task):void{
        task.on("complete", (event:EplEvent)=>{
            this.unbindUpdateEvents(task);
            this.emitComplete("complete", this.output)
        }, this);
    }



    public emitError(error:string|Error, data?:any){
        let err:Error;

        this.status = NTaskStatus.ERROR;

        if(typeof error == "string")
            err = new Error(error);
        else 
            err = error;

        this.emit("error", err);
    }

    public emitComplete(message?:string, data?:any){
        
        if(message == null)
            message = "complete";
        
        if(data === undefined)
            data = this.output;

        this.status = NTaskStatus.COMPLETE;
        
        let msg:CommandMessage<any> = new CommandMessage(message, data);

        if(this.output == null){
            this.output = [];    
            this.actions.forEach((action:NTaskAction)=>{
                this.output.push(action.output);
            });
        }
            
        this.emit("complete", msg);
    }

    public emitUpdate(message:string, data?:any){
        let msg:CommandMessage<any> = new CommandMessage(message, data);
        this.emit("update", msg);
    }


    
    constructor(name?:string){
        super();
        this.name = name;
        this.id = StringUtils.randomString(5);
    }

}


export class NTaskEvent{

    public static COMPLETE:string = "complete";
    public static UPDATE:string = "update";
    
    public message:CommandMessage<any>;
    
}



export class NTaskAction {

    // Item can be a sub task or a function that returns a command result
    public item: Task | ((input?:any) => Promise<CommandResult<any>>);
    public name: string;
    public get type(): NTaskActionType{
        return (this.item instanceof Task) ? NTaskActionType.TASK : NTaskActionType.COMMAND;;
    }
    public parent: Task;
    public params:any;
    public input:any;
    public output:any;

    constructor(
        item: Task | ((input?:any) => Promise<CommandResult<any>>), 
        name?: string, 
        parent?: Task,
        input?:any
    ) {

        this.item = item;
        this.name = name;
        this.parent = parent;
        this.input = input;
    }

}

export enum NTaskActionType {
    COMMAND = "NTaskActionType.command",
    TASK = "NTaskActionType.task"
}


export enum NTaskStatus {
    NOT_STARTED = "not started",
    PLAY = "play",
    PAUSE = "pause",
    COMPLETE = "complete",
    ERROR = "error"
    
}