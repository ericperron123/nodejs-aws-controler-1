/**
 * Author: www.ericperron.com, 2018.
 */

import {DateDuration} from "./DateDuration";
import {DatePeriod} from "./DatePeriod";
import {StringUtils} from "../stringUtils/StringUtils";

export class DateUtils {

  constructor(){}

  private static _monthsNames:Array<any> = [
    {
      fr_CA:[ "Janvier", "Jan" ],
      en_CA:[ "January", "Jan" ]
    },{
      fr_CA:[ "Février", "Fév" ],
      en_CA:[ "February", "Feb" ]
    },{
      fr_CA:[ "Mars", "Mars" ],
      en_CA:[ "March", "Mar" ]
    },{
      fr_CA:[ "Avril", "Avr" ],
      en_CA:[ "April", "Apr" ]
    },{
      fr_CA:[ "Mai", "Mai" ],
      en_CA:[ "May", "May" ]
    },{
      fr_CA:[ "Juin", "Juin" ],
      en_CA:[ "June", "Jun" ]
    },{
      fr_CA:[ "Juillet", "Juil" ],
      en_CA:[ "July", "Jul" ]
    },{
      fr_CA:[ "Août", "Août"],
      en_CA:[ "August", "Aug"]
    },{
      fr_CA:[ "Septembre", "Sept" ],
      en_CA:[ "September", "Sep" ]
    },{
      fr_CA:[ " Octobre", "Oct" ],
      en_CA:[ " October", "Oct" ]
    },{
      fr_CA:[ " Novembre", "Nov" ],
      en_CA:[ " November", "Nov" ]
    },{
      fr_CA:[ " Décembre", "Déc" ],
      en_CA:[ " December", "Dec" ]
    }
  ];

  private static _weeksDescriptions:Array<any> = [
    {
      fr_CA:[ "Première semaine", "1ère semaine" ],
      en_CA:[ "First week", "1st week"]
    },{
      fr_CA:[ "Deuxième semaine", "2ème semaine" ],
      en_CA:[ "Second week", "2nd week"]
    },{
      fr_CA:[ "Troisième semaine", "3ème semaine" ],
      en_CA:[ "Third week", "3rd week"]
    },{
      fr_CA:[ "Quatrième semaine", "4ème semaine" ],
      en_CA:[ "Forth week", "4th week"]
    },{
      fr_CA:[ "Cinquième semaine", "5ème semaine" ],
      en_CA:[ "Fift week", "5th week" ]
    },
  ]

  private static _daysNames:Array<object> = [
    {
      fr_CA:[ "Dimanche", "Dim" ],
      en_CA:[ "Sunday", "Sun" ]
    },{
      fr_CA:[ "Lundi", "Lun" ],
      en_CA:[ "Monday", "Mon" ]
    },{
      fr_CA:[ "Mardi", "Mar" ],
      en_CA:[ "Tuesday", "Tue" ]
    },{
      fr_CA:[ "Mercredi", "Mer" ],
      en_CA:[ "Wednesday", "Wed" ]
    },{
      fr_CA:[ "Jeudi", "Jeu" ],
      en_CA:[ "Thursday", "Thu" ]
    },{
      fr_CA:[ "Vendredi", "Ven" ],
      en_CA:[ "Friday", "Fri" ]
    },{
      fr_CA:[ "Samedi", "Sam" ],
      en_CA:[ "Saturday", "Sat" ]
    }
  ];

  private static  _arrMonthsDayCount:Array<number> = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];


  public static timeToString(t:number):string{

    let out:string = "";

    let s = 1000; // 60 * 1000;
    let h = 60000; // 60 * s;
    let d = 1440000; // 24 * h;

    // how many days
    let days:number = Math.floor(t/d);
    if(days > 0){
      t -= days*d;
      out += days + " days, ";
    }
    
    // how many hours
    let hours:number = Math.floor(t/h);
    if(hours > 0){
      t -= hours*h;
      out += hours + " hrs, ";
    }
    // how many seconds
    let seconds:number = Math.floor(t/s);
    if(seconds > 0){
      t -= seconds*s;
      out += seconds + " seconds, ";
    }

    out += t + " ms"
    return out;
  }

  public static removeHours(date:Date, count:number):Date{
    
    date.setTime(date.getTime()-3600000*count);
    
    return date;
  }


  public static addHours(date:Date, count:number):Date{
    
    date.setTime(date.getTime()+3600000*count);
    
    return date;
  }

  public static addDays(date:Date, count:number):Date{
    
    date.setTime(date.getTime()+86400000*count);
    
    return date;
  }

  public static removeDays(date:Date, count:number):Date{
    
    date.setTime(date.getTime()-86400000*count);
    
    return date;
  }


   

  public static isDate(obj:any):boolean
  {
    if(obj != null && obj.toDateString != null && obj.getDate != null && obj.setTime != null)
      return true;

    return false;
  }


  public static toString(date:Date = null, includeTime:boolean = false, utc:boolean = false):string
  {
    if(date == null)
      return null;

    let year:string, month:string, day:string, hours:string, minutes:string, seconds:string, milliseconds:string;


    if(utc)
    {
      year         = date.getUTCFullYear().toString();
      month        = (date.getUTCMonth()+ 1).toString();
      day          = date.getUTCDate().toString();
      hours        = date.getUTCHours().toString();
      minutes      = date.getUTCMinutes().toString();
      seconds      = date.getUTCSeconds().toString();
      milliseconds = date.getUTCMinutes().toString();
    }
    else
    {
      year         = date.getFullYear().toString();
      month        = (date.getMonth()+ 1).toString();
      day          = date.getDate().toString();
      hours        = date.getHours().toString();
      minutes      = date.getMinutes().toString();
      seconds      = date.getSeconds().toString();
      milliseconds = date.getMinutes().toString();
    }

    month = StringUtils.spacePadding(month,2,true,"0");
    day = StringUtils.spacePadding(day,2,true,"0");
    hours = StringUtils.spacePadding(hours,2,true,"0");
    minutes = StringUtils.spacePadding(minutes,2,true,"0");
    seconds = StringUtils.spacePadding(seconds,2,true,"0");
    milliseconds = StringUtils.spacePadding(milliseconds,4,true,"0");

    let str = "{0}-{1}-{2}";
    if(includeTime)
      str = "{0}-{1}-{2} {3}:{4}:{5}:{6}";

    return StringUtils.Format(str, [year, month, day, hours, minutes, seconds, milliseconds]);
  }

  public static toFormattedString(date:Date = null,format:string = "YY-MM-DD",language:string = "en_CA"):string
  {


    /*
     sample formats:
     DD-MM-YYYY    : 01-01-2010
     DD,MM,YYYY    : 01,01,2010
     DDD DD,MMM,YYYY  : Mon 10, FEB, 2010
     DDDD DD, MMMM, YY : Monday 10, February 10
     DDDD, DDst of MMMMM, YYYY : Monday, 10th of February 2010
     */

    if(date == null)
      date = new Date();

    let strDate:string = format;


    // --------------------------------
    // hours

    if(strDate.toLowerCase().indexOf("hh") != -1)
    {
      let hours:string = date.getHours().toString();
      hours = StringUtils.spacePadding(hours,2,true,"0");
      strDate = StringUtils.replace(strDate, "hh", hours);
    }

    // --------------------------------
    // minutes

    if(strDate.indexOf("mm") != -1)
    {
      let minutes:string = date.getMinutes().toString();
      minutes = StringUtils.spacePadding(minutes,2,true,"0");
      strDate = StringUtils.replace(strDate, "mm", minutes, true);
    }

    // --------------------------------
    // seconds
    if(strDate.toLowerCase().indexOf("ss") != -1)
    {
      let seconds:string = date.getSeconds().toString();
      seconds = StringUtils.spacePadding(seconds,2,true,"0");
      strDate = StringUtils.replace(strDate, "ss", seconds);
    }

    // --------------------------------
    // milliseconds
    if(strDate.toLowerCase().indexOf("ms") != -1)
    {
      let milliseconds:string = date.getMilliseconds().toString();
      milliseconds = StringUtils.spacePadding(milliseconds,3, true,"0");
      strDate = StringUtils.replace(strDate, "ms", milliseconds);
    }

    // ------------------------------
    // Day
    let day:string = date.getDate().toString(10);
    let dayZeroPadding:string = date.getDate().toString(10);

    if(date.getDate() < 10)
      dayZeroPadding = "0" + day;

    let dayFullName:string = DateUtils._daysNames[date.getDay()][language][0];
    let dayShortName:string = DateUtils._daysNames[date.getDay()][language][1];

    strDate = StringUtils.replace(strDate, "DDDD", dayFullName);
    strDate = StringUtils.replace(strDate, "DDD", dayShortName);
    strDate = StringUtils.replace(strDate, "DD", dayZeroPadding);
    strDate = StringUtils.replace(strDate, "D", day, true);


    // ------------------------------
    // Week
    let week:number = Math.floor(date.getDate()/7);
    let weekLong:string =  DateUtils._weeksDescriptions[week][language][0];
    let weekShort:string = DateUtils. _weeksDescriptions[week][language][1];

    strDate = StringUtils.replace(strDate, "WWWW", weekLong);
    strDate = StringUtils.replace(strDate, "WWW", weekShort);
    strDate = StringUtils.replace(strDate, "WW", week.toString(10));


    // -------------------------------
    // MONTH
    let month:string = "" + (date.getMonth()+1);
    let monthZeroPadding:string = month;

    if(date.getMonth()<9)
      monthZeroPadding = "0"+ month;

    let monthFullName:string = DateUtils._monthsNames[date.getMonth()][language][0];
    let monthShortName:string = DateUtils._monthsNames[date.getMonth()][language][1];

    strDate = StringUtils.replace(strDate, "MMMM",	monthFullName, true);
    strDate = StringUtils.replace(strDate, "mmmm",	monthFullName.toLowerCase(), true);

    strDate = StringUtils.replace(strDate, "MMM",	monthShortName, true);
    strDate = StringUtils.replace(strDate, "mmm",	monthShortName.toLowerCase(), true);

    strDate = StringUtils.replace(strDate, "MM",	monthZeroPadding, true);
    strDate = StringUtils.replace(strDate, "mm",	monthZeroPadding.toLowerCase(), true);

    strDate = StringUtils.replace(strDate, "M ",	month + " ", true);

    // --------------------------------
    // Year
    let year:string = date.getFullYear().toString().substr(2, 2);
    let fullYear:string = date.getFullYear().toString();

    strDate = StringUtils.replace(strDate, "YYYY", fullYear);
    strDate = StringUtils.replace(strDate, "YY", year);

    return strDate;


  }

  public static  isBeforeToday(date:Date):Boolean
  {
    let d:Date = new Date();
    let today:Date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

    if(date.getTime() < today.getTime())
      return true;
    else
      return false;
  }


  // expected format: 2011-10-29 or 11-10-29 24:01:01.1111
  public static  stringToDate(str:string, utc:boolean = false):Date
  {

    if(StringUtils.isNullOrEmpty(str))
      return null;

    let date:Date;
    let strDate:string = str;
    let strTime:string;

    let arr:Array<string> = str.split(" ");
    if(arr[1] == null) arr[1] = "00:00:00:0000";
    if(arr.length == 2)
    {
      strDate = arr[0];
      strTime = arr[1];
    }

    // --------------------------
    // convert the date

    let arrDate:Array<string> = strDate.split("-");

    let year:number = parseInt(arrDate[0]);
    if(arrDate[0].length == 2)
      year += 2000;

    let month:number = 1;
    let day:number = 1;

    if(arrDate[1])
    {
      month = parseInt(arrDate[1]);
      if(arrDate[2]) day = parseInt(arrDate[2]);
    }

    if(StringUtils.isNullOrEmpty(strTime))
    {
      return new Date(year, month - 1, day);
    }

    // --------------------------
    // convert the time
    let arrTime:Array<string> = strTime.split(":");

    let hours:number = 0;
    let minutes:number = 0;
    let seconds:number = 0;
    let milliseconds:number = 0;

    if(arrTime[0])
    {
      hours = parseInt(arrTime[0]);
      if(arrTime[1])
      {
        minutes = parseInt(arrTime[1]);
        if(arrTime[2])
        {
          seconds = parseInt(arrTime[2]);
          if(arrTime[3])
            milliseconds = parseInt(arrTime[3]);
        }
      }
    }

    date = new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);

    if(utc)
    {
      // the timezone difference is in minutes from UTC
      let dif:number = date.getTimezoneOffset()*60*1000;
      date.setTime(date.getTime() - dif);
    }

    return date;
  }

  public static  isToday(date:Date):Boolean
  {
    let today:Date = new Date();
    let dif:number = DateUtils.compareDates(date, today);

    return (dif == 0)
  }

  public static  stringToDateSlashDelimited(str:string):Date
  {

    if(str == null)
      return null;

    let arr:Array<string> = str.split("/");
    let day:number = parseInt(arr[1]);
    let month:number = 1;
    let year:number = 1;

    if(arr.length==3)
    {
      month = parseInt(arr[0]);
      //peel off time from year field
      let yearPlus:string = arr[2];
      let ya:Array<string> = yearPlus.split(" ");  //split at space
      year = parseInt(ya[0]);
    }
    else if(arr.length == 2)
    {
      month = parseInt(arr[1]);
    }
    let dt:Date = new Date(year, month-1, day);
    return dt;

  }

  public static  getClosestMonth(date:Date):Date
  {

    let returnDate:Date = new Date(date);

    let tmpDate:Date = new Date(date);

    let c1:number = 0;
    let c2:number = 0;
    let month:number = returnDate.getMonth();

    // get next month
    do
    {
      tmpDate.setDate(tmpDate.getDate() + 1);
      c1++;
    }
    while(tmpDate.getMonth() == month);

    // get last month
    do
    {
      tmpDate.setDate(tmpDate.getDate() - 1);
      c2++;
    }
    while(tmpDate.getMonth() != month);

    if(c1 > c2)
      returnDate.setDate(returnDate.getDate() + c1);
    else
      returnDate.setDate(returnDate.getDate() - c2);

    return returnDate;

  }

  public static getDayByName(dayName:string):number
  {
    let day:number = -1;

    dayName = dayName.toLowerCase();

    if("sunday".indexOf(dayName) == 0 )    day = 0;
    if("monday".indexOf(dayName) == 0 )    day = 1;
    if("tuesday".indexOf(dayName) == 0 )   day = 2;
    if("wednesday".indexOf(dayName) == 0 ) day = 3;
    if("thursday".indexOf(dayName) == 0 )  day = 4;
    if("friday".indexOf(dayName) == 0 )    day = 5;
    if("saturday".indexOf(dayName) == 0 )  day = 6;

    return day;
  }


  // example: getNextDay(date, "saturday");

  public static getNextDay(date:Date, dayName:string):Date
  {
    let day:number = this.getDayByName(dayName);
    if(day == -1){
      throw new Error(StringUtils.Format("Day id '{0}' could not be found!",[dayName]));
    }

    let outDate:Date = new Date();

    outDate.setTime(date.getTime());

    let dif = day - outDate.getDay();

    if(dif == 0) dif = 7;
    if(dif < 0) dif = 7 + dif;

    outDate.setDate(date.getDate() + dif);

    return outDate;

  }

  public static getLastDay(date:Date, dayName:string):Date
  {
    let day:number = this.getDayByName(dayName);
    if(day == -1){
      throw new Error(StringUtils.Format("Day id '{0}' could not be found!",[dayName]));
    }

    let outDate:Date = new Date();

    outDate.setTime(date.getTime());

    let dif = outDate.getDay() - day;

    if(dif == 0) dif = 7;
    if(dif < 0) dif = 7 + dif;

    outDate.setDate(date.getDate() - dif);

    return outDate;

  }


  public static  getClosestYearDividableBy(date:Date, m:number):Date
  {
    let returnDate:Date = new Date(date);

    returnDate.setDate(1);
    returnDate.setMonth(0);

    let tmpDate:Date = new Date(returnDate);

    let c1:number = 0;
    let c2:number = 0;

    // get next year dividable by m
    while(tmpDate.getFullYear() % m != 0)
    {
      tmpDate.setFullYear(tmpDate.getFullYear() + 1);
      c1++;
    }

    // get last year dividable by m
    while(tmpDate.getFullYear() % m != 0)
    {
      tmpDate.setFullYear(tmpDate.getFullYear() - 1);
      c2++;
    }

    if(c1 > c2)
      returnDate.setFullYear(returnDate.getFullYear() + c1);
    else
      returnDate.setFullYear(returnDate.getFullYear() - c2);

    return returnDate;

  }


  public static  isLeapYear(year:number):Boolean
  {

    if (year % 400 == 0)
      return true;
    else if (year % 100 == 0)
      return false;
    else if (year % 4 == 0)
      return true;

    return false;
  }


  public static  getDurationBetweenDates(d1:Date, d2:Date):DateDuration
  {

    return new DateDuration(d1, d2);

  }

  public static  getDaysInMonth(date:Date):number
  {
    if(date.getMonth() == 1 && DateUtils.isLeapYear(date.getFullYear()))
      return 29;
    else
      return DateUtils._arrMonthsDayCount[date.getMonth()];
  }


  public static  periodOverlapTest(period1:DatePeriod, period2:DatePeriod):number
  {
    /*
     -1 does not overlap
     0  period2 starts before period1 ends
     1  period1 starts and ends within the boundaries of period2
     2  period1 starts before period2 ends
     3  period2 starts and ends within the boundaries of period1
     */

    let c1:number = DateUtils.compareDates(period1.from, period2.from);
    let c2:number = DateUtils.compareDates(period1.from, period2.to);
    let c3:number = DateUtils.compareDates(period1.to, period2.from);
    let c4:number = DateUtils.compareDates(period1.to, period2.to);

    // ------------------------------------------
    // 0  period2 starts before period1 ends
    // ------------------------------------------

    if(
      c1 == -1  // pariod1.from is smaller then period2.from
      && c3 != -1  // pariod1.to is greater then or equal to period2.from
      && c4 == -1  // period1.to is smaller then period2.to
    )
      return 0;


    // ------------------------------------------
    // 1  period1 starts and ends within the boundaries of period2
    // ------------------------------------------

    if(
      c1 != -1  // pariod1.from is greater then or equal to period2.from
      && c4 != 1   // pariod1.to is smaller then or equal to period2.to
    )
      return 1;


    // ------------------------------------------
    // 2  period1 starts before period2 ends
    // ------------------------------------------

    if(
      c1 != -1  // pariod1.from is greater then or equal to period2.from
      && c2 != 1   // pariod1.from is smaller then or equal to period2.to
      && c4 == 1   // pariod1.to is greater then to period2.to
    )
      return 2;

    // ------------------------------------------
    // 3 period2 starts and ends within the boundaries of period1
    // ------------------------------------------

    if(
      c1 != 1  // pariod2.from is greater then or equal to period1.from
      && c4 != -1   // pariod2.to is smaller then or equal to period1.to
    )
      return 3;



    return -1;


  }

  public static  getYesterday():Date
  {
    let d:Date = new Date();
    d.setTime(d.getTime() - 86400000); // one day

    return d;
  }

  public static  getTomorrow():Date
  {
    let d:Date = new Date();
    d.setTime(d.getTime() + 86400000); // one day

    return d;
  }


  public static  compareDates(dateOne:Date, dateTwo:Date):number
  {
    /*
     -1 dateOne is smaller then dateTwo
     0  dateOne and dateTwo are equal
     1  dateOne is greater then dateTwo

     */

    let r:number = 0;

    if(dateOne.getFullYear() < dateTwo.getFullYear())
    {
      r = -1
    }
    else if(dateOne.getFullYear() > dateTwo.getFullYear())
    {
      r = 1
    }
    else
    {
      if(dateOne.getMonth() < dateTwo.getMonth())
      {
        r = -1
      }
      else if(dateOne.getMonth() > dateTwo.getMonth())
      {
        r = 1
      }
      else
      {
        if(dateOne.getDate() < dateTwo.getDate()) r = -1
        else if(dateOne.getDate() > dateTwo.getDate()) r = 1
      }
    }

    return r;
  }


  public static  isDayInDateRange(date:Date, startDate:Date, endDate:Date):Boolean
  {
    let ret:Boolean = true;

    if(date)
    {
      if(startDate)
      {
        // before the start date
        if (DateUtils.compareDates(date, startDate) == -1)
          return false;

        // after end date
        if(endDate && DateUtils.compareDates(date, endDate) == 1)
          return false;

        // if it got this far, than the date is >= to the start date and <=  to the end date.
        return true;
      }
    }

    // there is an argument missing here.
    return false
  }



  public static  isTimeInDateRange(date:Date, startDate:Date, endDate:Date):Boolean
  {
    let ret:Boolean = true;

    if(date)
    {
      if(startDate)
      {
        if(endDate)
        {
          if ((date.getTime() >= startDate.getTime()) && (date.getTime() <= endDate.getTime()))
            ret=true;
          else
            ret = false;
        }
      }
    }
    return ret;
  }

  public static  isSameDay(dateOne:Date, dateTwo:Date):Boolean
  {
    if(dateOne == dateTwo)
      return true;

    if(dateOne == null || dateTwo == null)
      return false;

    let result:number = DateUtils.compareDates(dateOne, dateTwo);

    if(result === 0)
      return true;
    else
      return false;
  }


}
