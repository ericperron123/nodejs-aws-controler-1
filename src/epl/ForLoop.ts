/**
 * Author: www.ericperron.com, 2018.
 */

import {EplEvent, EPLStyleEventEmitter} from "./EPLStyleEventEmitter";

export class ForLoop extends EPLStyleEventEmitter {

  public startExp:Function; 	// void
  public testExp:Function;  	// boolean
  public countExp:Function;  	// void
  public statement:Function;	// void

  public isRunning:Boolean = false;
  public timeout:number = 1000*60; // 1 hour
  public delay:number = 1;
  public time:number = 0;

  private _startTime:number;

  public start():void
  {
    this._startTime = new Date().getTime();

    this.isRunning = true;
    this.startExp();
    this.next();
  }

  public next():void
  {
    this.time = new Date().getTime() - this._startTime;

    if(this.testExp() && this.time < this.timeout)
    {
      this.statement();
      if(this.delay != 0)
        this.startTimer();
      else
      {
        this.countExp();
        this.next();
      }
    }
    else
    {
      this.isRunning = false;
      this.emit(EplEvent.COMPLETE);
    }
  }

  private startTimer():void
  {
    setTimeout((event:EplEvent) =>
      {
        this.countExp();
        this.next();
      }, this.delay
    );
  }

  constructor(startExp: Function, testExp: Function, countExp: Function, statement: Function)
  {
    super();
    this.startExp = startExp;
    this.testExp = testExp;
    this.countExp = countExp;
    this.statement = statement;

    //start();

  }
}
