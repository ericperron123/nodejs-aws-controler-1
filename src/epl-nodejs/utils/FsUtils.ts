import * as fs from "fs";
import * as readline from "readline"; 
import {StringUtils} from "../../epl/utils/stringUtils/StringUtils";
import {Logger} from "../Logger";
import {DateUtils} from "../../epl/utils/dateUtils/DateUtils";


export class PathInfo{

  public folder:string;
  public file:string;
  public extension:string;
  
  public get fileFullName():string{
    return this.file +"." + this.extension;
  }

  public get path():string {
    return this.folder +"\\"+ this.fileFullName;
  }

  public set path(path:string){

    if(StringUtils.isNullOrEmpty(path)) {
      delete this.folder;
      delete this.extension;
      delete this.file;
      return;
    }
      
    path  = StringUtils.replace(path, "/", "\\");

    let iSlash:number = path.lastIndexOf("\\");
    let iPoint:number = path.lastIndexOf(".");
    
    this.folder = path.substring(0,iSlash);
    this.extension = path.substring(iPoint + 1, path.length);
    this.file = path.substring(iSlash+1, iPoint);

  }

  constructor(path:string){
    this.path = path;
  }

}

export class FsUtils{


  // this method makes the assumption that a character is a byte. However, characters can be 
  // 2 bytes. for exemple: "é". 

  // Note: I thought of using this function as I thought that the readstream would load all of the file 
  // before parsing it. However, it does not. it does it in chuncks of 64 KB. which means that you can 
  // iterate through the lines of a very big 1GB+ file using the readLines function in this class!

  public static async readCharacters(file: string | number, startAt: number, count: number): Promise<string> {

    let fileId: number;

    if (typeof (file) == "string")
      fileId = fs.openSync(file, 'r');
    else
      fileId = file;

    // one byte per character
    const b = Buffer.alloc(count);

    return new Promise((resolve, reject) => {

      fs.read(fileId, b, 0, count, startAt, (err, bytesRead, buffer) => {
        resolve("[" + String(buffer) + "]");
      });

    });

  }

  

  public static readFirstLine (path:string, encoding:BufferEncoding = 'utf8'):Promise<string> {
    
    return new Promise( (resolve, reject)=> {
      let rs:fs.ReadStream = fs.createReadStream(path, {encoding: encoding});
      let acc:string = '';
      let pos:number = 0;
      let index:number;
      rs
        .on('data', function (chunk:string) {
          index = chunk.indexOf('\n');
          acc += chunk;
          index !== -1 ? rs.close() : pos += chunk.length;
        })
        .on('close', function () {
          resolve(acc.slice(0, pos + index));
        })
        .on('error', function (err) {
          reject(err);
        })
    });
    
  }


  public static async readLines(filePath, f:(line:string)=>void, encoding:string = "utf8"):Promise<void> {
    
    return new Promise((resolve, reject)=>{
      
      let rl:readline.Interface = readline.createInterface({ input: fs.createReadStream(filePath, encoding) });
      rl.on('line', f)
      rl.on('close', ()=>resolve());

    });

  }


  public static async readLinesAsync(filePath, f:(line:string)=>Promise<void>, encoding:string = "utf8"):Promise<void> {
    
    return new Promise((resolve, reject)=>{
      
      let rl:readline.Interface = readline.createInterface({ input: fs.createReadStream(filePath, encoding) });
      rl.on('line', async (line)=>{
        rl.pause();
        await f(line);
        rl.resume();
      })
      rl.on('close', ()=>resolve());

    });

  }


  public static async modifyLines(filePath, f: (line: string) => string, encoding:BufferEncoding = "utf8"): Promise<void> {

    // create a temporaryfile
    let pathInfo: PathInfo = new PathInfo(filePath);
    pathInfo.file = pathInfo.file + "_tmp";

    var tmpFile = fs.createWriteStream(pathInfo.path, {
      encoding: encoding,
      flags: 'a' // 'a' means appending (old data will be preserved)
    })

    // create the promise 
    return new Promise((resolve, reject) => {


      // now lets iterate through each lines of the file using an interface.
      readline.createInterface({ input: fs.createReadStream(filePath, encoding) })

        // ON EACH LINE
        .on('line', (line: string) => {

          // process the line and write it to the new file. 
          tmpFile.write(f(line) + "\r\n");

        })

        // ONE CLOSE: executed once done reading the file
        .on('close', () => {

          // close the stream on the tmp file
          tmpFile.end();

          // delete the original file
          fs.unlinkSync(filePath);

          // rename the tmp file to the filePath
          fs.renameSync(pathInfo.path, filePath);

          // Resolve the promise
          resolve()
        });

    });

  }

  public static cleanUpLineBreaks(filePath:string, encoding:BufferEncoding = "utf8"):void{
    // clean up the line breaks
    let fileStr:string = fs.readFileSync(filePath, encoding);
    fileStr = fileStr.replace(/\r\n|\r|\n/g, "_lb_");
    fileStr = fileStr.replace(/(_lb__lb_)/g, "_lb_");
    fileStr = fileStr.replace(/(_lb_)/g, "\r\n");
    fs.writeFileSync(filePath,fileStr, encoding);
  }

  public static async listFileToFixedLength(filePath:string, encoding:BufferEncoding = "utf8"):Promise<{ lines:number, maxWidth:number }>{
    
    // figure out which line is the longest
    let lineMax:number = 0;
    let lineCnt:number = 0
    
    await FsUtils.readLines(filePath, async (line):Promise<void> => {
      lineCnt++;
      if(line.length>lineMax)
        lineMax = line.length;
    }, encoding);
    
    await FsUtils.modifyLines(filePath, (line:string)=>{
      return StringUtils.spacePadding(line, lineMax, false, " ");
    }, encoding);

    return {
      lines:lineCnt,
      maxWidth:lineMax
    };
  }

  public static async getLineAt(filePath:string, lineNumber:number, fixedLineWidth:number, encoding:BufferEncoding = "utf8"):Promise<string>{

    let lineStr:string = "";

    let start:number = lineNumber*(fixedLineWidth + 2);
    
    return new Promise((resolve, reject)=>{

      fs.createReadStream(filePath, {
        start: start, 
        end: start + fixedLineWidth - 1,
        encoding: encoding
      })
      .on('data',(data)=>lineStr+= data)
      .on("end",()=>{
        resolve(lineStr);
      })
      
    });
    
  }

  public static saveJsonSync(data:any, filePath:string):void{

    let str:string = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, str, "utf8");
  }



  public static loadJsonSync(filePath:string):any
  {
    let fileStr:string;
    let data:any;

    try
    {
      fileStr = fs.readFileSync(filePath, "utf8");
    }
    catch(e)
    {
      let errorMsg:string = StringUtils.Format("Unable to load the JSON file from [{0}].",[filePath]);
      Logger.error(errorMsg)
      throw e;
    }

    try
    {
      data = JSON.parse(fileStr);
    }
    catch(e)
    {
      let errorMsg:string = StringUtils.Format("Unable to parse the JSON file found at [{0}]. Take a lot at the format.. likely something wrong there. ",[filePath]);
      Logger.error(errorMsg)
      throw e;
    }

    return data;

  }

  public static addDateToFileName(path:string, includeTime:boolean = false):void
  {
    
    let tFormat:string = "YYMMDD";
    if(includeTime)
      tFormat+= "_HHmmSS";

    // get a timestamp for the old file.
    let strDate:string =  DateUtils.toFormattedString(new Date(),tFormat);
    let newPath:string = StringUtils.insert(path, "_" + strDate, path.lastIndexOf("."));

    try
    {
      fs.renameSync(path, newPath);
    }
    catch(e)
    {
      let msg:string = StringUtils.Format("Unable to rename the following path [{0}]. \n\n{1}\n\n",[path, JSON.stringify(e)]);
      Logger.error(msg);
      throw e;
    }

  }
}