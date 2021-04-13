/**
 * Author: www.ericperron.com, 2018.
 */

import {DateUtils} from "./DateUtils";

export class DateDuration {

  constructor(d1:Date, d2:Date)
  {
    this.run(d1, d2);
  }


  public days:number;
  public daysTotal:number;

  public months:number;
  public monthsTotal:number;

  public weeksTotal:number;

  public years:number;

  public run(date1:Date, date2:Date):void
{
  var d1:Date = new Date(date1);
  var d2:Date = new Date(date2);

  if(d2<d1)
  {
    var tmp:Date = d1;
    d1 = d2;
    d2 = tmp;
  }

  // ---------------------------
  // DAYS

  this.daysTotal+=Math.floor((d2.getTime() - d1.getTime()) / 1000 / 60 / 60 / 24);

  if(d1.getDate() > d2.getDate())
    this.days = DateUtils.getDaysInMonth(d1) - d1.getDate() + d2.getDate();
  else
    this.days = d2.getDate() - d1.getDate();

  d1.setDate( d1.getDate() + this.days);

  // WEEKS
  this.weeksTotal = this.daysTotal / 7;


  // ---------------------------
  // MONTHS

  if(d1.getMonth() > d2.getMonth())
    this.months = 12 - d1.getMonth() + d2.getMonth();
  else
    this.months = d2.getMonth() - d1.getMonth();

  d1.setMonth(d1.getMonth() + this.months);

  this.monthsTotal = this.months;


  // --------------------------------------------------------
  // number of years
  this.years = Math.abs(d1.getFullYear() - d2.getFullYear());

  this.monthsTotal += this.years * 12;

}

}
