/*
___________________________________
-----------------------------------
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
   COPYRIGHT
   ©2019 Eric Perron

   #################
   ##       ##    ##
   ####     ########
   ##       ##
   ######## ##

   This code is the property of its developer, Eric Perron. You are not allowed to use this code without a licence.
   please visit www.ericperron.com and contact Mr. Perron to obtain a licence.
___________________________________
-----------------------------------
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
*/



import {Key} from "../Key";
import {List} from "../List";
import { EplError } from "../Types";

export class Validation<T>{


  public payload:T;

  public get valid():boolean {
    return this.errors.length == 0;
  }

  public errors:List<ValidationDetail> = new List<ValidationDetail>();
  public warnings:List<ValidationDetail> = new List<ValidationDetail>();

  public addError(label:string, message?:string, source?:any, code:string = "0", data?:any):void
  {
    let e:ValidationDetail = new ValidationDetail(label, source, code, data);
    this.errors.addItem(e);

  }

  public addWarning(label:string, message?:string, source?:any, code:string = "0", data?:any):void
  {
    let w:ValidationDetail = new ValidationDetail(label, source, code, data);
    this.warnings.addItem(w);
  }

  public append(v:Validation<T>):void{
    this.errors.addItems(v.errors);
    this.warnings.addItems(v.warnings);
  }

  constructor(){

    this.warnings.itemFactory = ()=>{
      return new ValidationDetail();
    };

    this.errors.itemFactory = ()=>{
      return new ValidationDetail();
    };
  }

}

export class ValidationDetail{

  // the label of the error
  public label:string;

  // message for errors
  public message:string;

  // the error code
  public code:string;

  // data pertaining to the error
  public data:any;

  // the object in which the validation was made.
  public source:any;

  constructor(label?:string, source?:any, code?:string, data?:any){
    this.label = label;
    this.source = source;
    this.code = code;
    this.data = data;
  }
}