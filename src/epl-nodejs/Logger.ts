
import {StringUtils} from "../epl/utils/stringUtils/StringUtils";
import * as fs from "fs";
import {WriteStream} from "fs";
import {List} from "../epl/List";
import {Utils} from "../epl/utils/Utils";



export class LoggerLevel{

  public static readonly ERROR:string = "ERROR";
  public static readonly WARN:string = "WARN";
  public static readonly DEBUG:string = "DEBUG";
  public static readonly INFO:string = "INFO";
  public static readonly GROUP:string = "GROUP";
  public static readonly GROUPEND:string = "GROUPEND";
  
}


export class LoggerSettings{

  public get folderPath():string{
    return this._folderPath;
  }

  public set folderPath(path:string){
    
    // create the logs directory if it does not exists
    if (path && !fs.existsSync(path))
        fs.mkdirSync(path);

    this._folderPath = path;
  }

  public fileName:string = "logs.txt";
  public console:boolean = true;
  public clearTodayUponStart:boolean = false;

  public set level(value:string){

    if(value)
      this._level = value.toUpperCase();
    else
      this._level = value;
  }

  public get level():string{
    return this._level;
  }

  private _level:string;
  private _folderPath:string; 


  constructor(){

    this._level = LoggerLevel.DEBUG;

  }

}



class LoggerLine{

  public readonly msg:string;
  public readonly level:string;
  public readonly date:Date;
  public readonly line:string;

  public _getLineString():string{

    let str:string = Logger.dateStamp;

    if(this.level)
      str += StringUtils.spacePadding("[" + this.level + "]", 8);

    str = StringUtils.spacePadding(str, str.length + Logger.padding);
    str += this.msg + "\n";

    return str;
  }

  constructor(msg:string = null, level?:string){

    this.msg = msg;
    this.level = level;
    this.date = new Date();
    this.line = this._getLineString();
  }
}


export class Logger {


  // ***********************************************
  // PUBLIC STATIC PROPERTIES
  // ***********************************************

  public static SETTINGS:LoggerSettings = new LoggerSettings();
  public static padding:number = 0;
  public static FILE_DATE:Date;

  // ***********************************************
  // PUBLIC STATIC GET/SETS
  // ***********************************************

  public static get dateStamp():string
  {

    let zeroPadding:Function = (n:number):string=>{
      return n<10?"0" + n: String(n);
    };

    let d:Date = new Date();
    let str:string = zeroPadding(d.getHours()) + ":" + zeroPadding(d.getMinutes()) + ":" + zeroPadding(d.getSeconds()) +":"+ StringUtils.spacePadding(String(d.getMilliseconds()), 3 , true, "0");
    str = StringUtils.spacePadding(str, 13);

    return  str;

  }

  // ***********************************************
  // PUBLIC STATIC METHODS
  // ***********************************************

  public static clearTodaysFile():void{

    try{
      fs.unlinkSync(this.filePath);
    } catch(e){

      Logger.error("Unable to remove file path" + this.filePath);
    }
  }

  public static group(msg:string = null, vars?:Array<string>):void
  {
    if(Logger.SETTINGS.level == LoggerLevel.INFO && msg == null)
      msg = ">";

    if(vars)
      msg = StringUtils.Format(msg, vars);

    // write to console
    if(Logger.SETTINGS.console && msg !== null)
      console.group(msg);

    // append to the log file.
    if(msg === null)
      this.write("", LoggerLevel.GROUP);
    else 
      this.write("> " + msg, LoggerLevel.GROUP);
    
  }

  public static groupEnd():void
  {
    
    if(Logger.SETTINGS.console)
      console.groupEnd();

    this.write(null, LoggerLevel.GROUPEND);
  }

  public static debug(msg:string, vars?:Array<string>):void
  {
    if(Logger.SETTINGS.level == LoggerLevel.INFO)
      return;

    if(vars)
      msg = StringUtils.Format(msg, vars);

    // write to console
    if(Logger.SETTINGS.console)
      console.debug(msg);

    // append to the log file.
    this.write(msg, LoggerLevel.DEBUG);
  }

  public static info(msg:string, vars?:Array<string>):void
  {
    if(vars)
      msg = StringUtils.Format(msg, vars);

    // write to console
    if(Logger.SETTINGS.console)
      console.info(msg as string);

    // append to the log file.
    this.write(msg, LoggerLevel.INFO);
  }

  public static error(msg:string|Error, vars?:Array<string>):void
  {
    let txt:string;
    if(msg instanceof Error)
      txt = (msg as Error).name + ": " + (msg as Error).message +"\n";
    else 
      txt = msg;

    if(vars)
      msg = StringUtils.Format(txt, vars);

    // write to console
    if(Logger.SETTINGS.console)
      console.error(msg as string);

    // append to the log file.
    this.write(txt, LoggerLevel.ERROR);
  }

  public static warn(msg:string, vars?:Array<string>):void
  {
    if(Logger.SETTINGS.level == LoggerLevel.INFO)
      return;

    if(vars)
      msg = StringUtils.Format(msg, vars);

    // write to console
    if(Logger.SETTINGS.console)
      console.warn(msg);

    // append to the log file.
    this.write(msg,LoggerLevel.WARN);
  }

  // ***********************************************
  // PRIVATE GETS/SETS
  // ***********************************************


  private static get filePath():string{

    this.FILE_DATE = new Date();

    let zeroPadding:Function = (n:number):string=>{
      return n<10?"0" + n: String(n);
    };
    let strDate:string = this.FILE_DATE.getFullYear() + zeroPadding(this.FILE_DATE.getMonth()+1) + zeroPadding(this.FILE_DATE.getDate());

    let i:number = Logger.SETTINGS.fileName.lastIndexOf(".");
    let fileName:string = Logger.SETTINGS.fileName.substr(0,i);
    let fileExt:string = Logger.SETTINGS.fileName.substring(i+1,Logger.SETTINGS.fileName.length);

    return Logger.SETTINGS.folderPath + '/' + fileName + "-" + strDate + "." + fileExt;
  }

  private static writeCachedLines():void{
   
      this._cachedLines.forEach((line:LoggerLine)=>{
        this.write(line.msg, line.level, false);
      });

      this._cachedLines.removeAll();
  }

  private static get logStream():WriteStream
  {

    if(this._logStream == null)
    {
      // open the file for appending
      this._logStream = fs.createWriteStream(this.filePath, {'flags': 'a'});
      this._logStream.write("-----------------------------");
      this._logStream.write("\nLogger Started: " +  new Date().toDateString());
      this._logStream.write("\n-----------------------------");
      this._logStream.write("\n");

    }

    return this._logStream;
  }


  // ***********************************************
  // PRIVATE PROPERTIES
  // ***********************************************

  private static _logStream:WriteStream;
  private static _cachedLines:List<LoggerLine> = new List<LoggerLine>();


  // ***********************************************
  // PRIVATE METHODS
  // ***********************************************

  private static write(msg:string = null, level?:string, checkCachedLines:boolean = true):void {

    
    // verify if cached lines should not be written out to the file first. 
    if(checkCachedLines && this._cachedLines.count > 0 && this.SETTINGS.folderPath)
      this.writeCachedLines();
      

    let oLine:LoggerLine = new LoggerLine(msg, level);

    // append to the log file.
    if (this.SETTINGS.folderPath)
    {

      let zeroPadding:Function = (n:number):string=>{
        return n<10?"0" + n: String(n);
      };

      let dateToStr:Function = (d:Date):string=>{
        return d.getFullYear() + zeroPadding(d.getMonth()+1) + zeroPadding(d.getDate());
      };

      if(level == LoggerLevel.GROUP)
        Logger.padding += 3;
      else if(level == LoggerLevel.GROUPEND){
        Logger.padding -= 3;
      if(Logger.padding < 0)
        Logger.padding = 0;
    }

      if(oLine.msg != null)
      {
        // if this log is not for today
        if(this.FILE_DATE && dateToStr(this.FILE_DATE) != dateToStr(new Date()))
          this._logStream = null;

        if(!Utils.orEquals(level, LoggerLevel.WARN, LoggerLevel.DEBUG, LoggerLevel.GROUP) || Logger.SETTINGS.level != LoggerLevel.INFO)
          this.logStream.write(oLine.line);
      }

     
        
    }
    else {
      this._cachedLines.addItem(oLine);
    }


  }

}


