import {Utils} from "./utils/Utils";

export class EplError{

  public message:string;
  public code:number;
  public details:EplErrorDetails = new EplErrorDetails();

  public fromJSON(data:any):void{
    this.message = data.message;
    this.code = data.code;
    this.details = data.details;
  }
  
  constructor(msg?:string, code?:number, error?:any)
  {

    if(msg)
      this.message = msg;

    if(typeof(code) == "number")
      this.code = code;

    if(error)
    {

      if(typeof(error) == "string")
        this.details.message = error;
      else {
        this.details = Utils.getValue(error, "name");
        this.details = Utils.getValue(error, "message");
        this.details = Utils.getValue(error, "stack");
      }
    }

    if(this.details && this.details.time)
       this.details.time = new Date();

  }
}

export class EplErrorDetails{

  public name:string;
  public message:string;
  public stack:string;
  public time:Date;

}

export class Size{

  public width:number = 0;
  public height:number = 0;

  public isEqualTo(size:Size):boolean
  {
    if(size.height != this.height)
      return false;

    if(size.width != this.width)
      return false;

    return true;
  }

  constructor(width:number = 0, height:number = 0)
  {
    this.width = width;
    this.height = height;
  }

}

export class Scalar{

  public value:number;
  public isPercent:boolean = false;

}

export class Point{

  public x:number;
  public y:number;

  public constructor(x?:number, y?:number){

    this.x = x;
    this.y = y;

  }
}


export class Rect{

  public x:number;
  public y:number;
  public width:number = 0;
  public height:number = 0;

  public getPolygon():Array<Array<number>>{
     return [
        [this.x, this.y], 
        [this.x, this.y + this.height], 
        [this.x + this.width, this.y + this.height], 
        [this.x + this.width, this.y]
      ];
  }

  public includePoint(point:Point):void{

    if(isNaN(this.x) || isNaN(this.x)){
      this.x = point.x;
      this.y = point.y;
      return;
    }

    let max:Point = new Point(this.x + this.width, this.y + this.height);

    if(this.x == undefined || this.x > point.x) this.x = point.x;
    else if(max.x == undefined || max.x < point.x) max.x = point.x;
    
    if(this.y == undefined || this.y > point.y) this.y = point.y;
    else if(max.y == undefined || max.y < point.y) max.y = point.y;

    this.width = max.x - this.x;
    this.height = max.y - this.y;
  }

  public includeSquarePolygon(polygon:Array<Array<number>>):void{

    let min:Point = new Point(polygon[0][0],polygon[0][1]);
    let max:Point = new Point(polygon[2][0],polygon[2][1]);
    
    this.includePoint(min);
    this.includePoint(max);
  }



  public constructor(x?:number, y?:number, width?:number, height?:number){

    this.x = x;
    this.y = y;
    
    if(!isNaN(width))
      this.width = width;

    if(!isNaN(height))
      this.height = height;

  }

}

