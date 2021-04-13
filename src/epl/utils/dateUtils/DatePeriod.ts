/**
 * Author: www.ericperron.com, 2018.
 */

import {DateDuration} from "./DateDuration";
import {DateUtils} from "./DateUtils";

export class DatePeriod {

  constructor(from?:Date, to?:Date)
  {
    if(from != null)
      this._from = from;
    if(to != null)
      this._to = to;
  }

  private _from:Date;
  private _to:Date;

  // **************************************
  // PUBLIC GETS AND SETS
  // **************************************


  public  get from():Date
  {
    return this._from;
  }


  public  get duration():DateDuration
  {
    return new DateDuration(this._from, this._to);
  }


  public get to():Date
  {
    return this._to;
  }


  // **************************************
  // PUBLIC METHODS
  // **************************************

  public containsDate(date:Date):number
{
  let d1:number = DateUtils.compareDates(date, this._from);
  let d2:number = DateUtils.compareDates(this._to, date);

  if(d1 != -1 && d2 != -1) // within bounds
    return 0;


  if (d1 != -1)  // is after this period.
    return 1;

  return -1; // is before this period.
}

  public  toString():String
{
  return "from " + this._from.toDateString() + " to " + this._to.toDateString();
}
}
