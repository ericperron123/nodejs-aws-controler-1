/**
 * Author: www.ericperron.com, 2018.
 */

import {EPLStyleEventEmitter} from "./EPLStyleEventEmitter";

export class Timer extends EPLStyleEventEmitter{

  //**************************************
  // STATIC  
  //**************************************
  
  
  public static async timeout(time:number):Promise<any>
  {
    return new Timer().timeout(time);
  }


  //**************************************
  // PUBLIC PROPERTIES  
  //**************************************
  
  public njsTimer:NodeJS.Timer;
  public startTime:number;
  public stopTime:number;
  public time:number;

  public start():void
  {
    this.startTime = new Date().getTime();
    return;
  }

  public restart():void
  {
    this.reset();
    this.start();
  }
  

  public getElapsedTime():number{
    return new Date().getTime() - this.startTime;
  }

  public stop():number
  {
    this.stopTime = new Date().getTime();
    this.time =  this.stopTime - this.startTime;
    return this.time;
  }
  
  public reset():void{

    this.startTime = 0;
    this.stopTime = 0;
    this.time = 0;
    
  }

  public clearTimeout():void{
    if(this.njsTimer)
      clearTimeout(this.njsTimer);
  }

  public async timeout(time:number):Promise<any>{

    // this method makes will cancel the previous timeout of this object. 

    return new Promise((resolve, reject)=>{
      
      
      // Clear timeout so that it is not called twice.
      this.clearTimeout();

      this.njsTimer = setTimeout(()=>{
        resolve(true);
      }, time);

      this.onOnce("cancel", ()=>{
        this.clearTimeout();
        resolve(false);
      }, this);

    });

  }

  // this interval will keep going as long as the function specified returns true
  public static setInterval(f:Function, interval:number):void{
   
    let _f:Function = (value:any):any=>{
      if(f())
        Timer.timeout(interval).then(()=>{ _f(); });
    }

    Timer.timeout(interval).then(()=>{ _f(); });

  }

  // this interval will keep going as long as the function specified returns true
  public static setIntervalAsync(f:Function, interval:number):void{
   
    let _f:Function = async (value:any):Promise<any>=>{
      if(await f())
        Timer.timeout(interval).then(()=>{ _f(); });
    }

    Timer.timeout(interval).then(()=>{ _f(); });

  }




  public cancel():void{

    this.emit("cancel");

  }






  constructor(startNow:boolean = false){

    super();

    if (startNow)
      this.start();
  }


}


