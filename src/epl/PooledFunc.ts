/**
 * Author: www.ericperron.com, 2019.
 */

import {EplEvent, EPLStyleEventEmitter} from "./EPLStyleEventEmitter";
import {List} from "./List";

// This method might be useful when calling an async function from a non async one.
// This will prevent calling the same function before the previous call was completed.

export class PoolAsync extends EPLStyleEventEmitter {

  public func:Function;
  public poolList:List<any> = new List();
  public current:any = null;

  public async call(requestData:any):Promise<any>
  {

    if(this.current)
    {
      this.poolList.addItem(requestData);
      console.log("Pooling request ... ");
      return;
    }

    this.current = requestData;
    await this.func(requestData);
    this.current = null;

    // If there is a pending request in the pool, process it.
    if(this.poolList.count != 0)
    {
      requestData = this.poolList.pop(true);
      await this.call(requestData);
    }


    return
  }

  constructor(func: Function)
  {
   super();
    this.func = func;

  }
}
