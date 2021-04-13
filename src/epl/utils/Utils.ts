/**
 * Author: www.ericperron.com, 2018.
 */

import {StringUtils} from "./stringUtils/StringUtils";
import {DateUtils} from "./dateUtils/DateUtils";
import {List} from "../List";

export class Utils
{

  // I was anoyed with this type of line:
  //   if(a == "hello" || a == "big" || a == "bad" || a == "world")
  // so we can now replace it with
  //   if(Utils.orEquals(a, "hello", "big", "bad", "world"))

  public static orEquals(str:string, ...arr:Array<string>):boolean{

    let i:number = arr.findIndex((item)=>(item == str));

    return (i != -1);
  }


  public static removeNullProperties(o:any):any{
    let properties:Array<string> = Object.getOwnPropertyNames(o);
    
    properties.forEach((propName)=>{
      if(o[propName] == null)
        delete o[propName];
    });
    
    return o;
  }

  public static async toAsync(f:Function):Promise<any>{

    let r: any = f();
    if(r instanceof Promise) {

      let p:Promise<any> = r as Promise<any>;

      return new Promise((resolve, reject)=>{
        p.then((value:any)=>{
          resolve(value);
        }).catch((error:any)=>{
          reject(error);
        });
      });

    }
    else  return new Promise((resolve, reject)=>{
      resolve(r);
    });

  }

  public static copyToClipboard(text:string)
  {
    let previousFocus:any = document.activeElement;

    let tf = document.createElement("input");
    tf.type = "text";
    tf.style.position = "absolute";
    tf.style.opacity = "0";
    document.body.appendChild(tf);
    tf.value = text;
    tf.select();
    let r:boolean = document.execCommand("Copy");
    document.body.removeChild(tf);

    if(previousFocus)
      previousFocus.focus();
  }

  public static async getClipboard():Promise<string>
  {
    let previousFocus:any = document.activeElement;

    let tf = document.createElement("input");
    tf.type = "text";
    tf.style.position = "absolute";
    tf.style.opacity = "0";
    tf.style.top = "0px";
    document.body.appendChild(tf);
    tf.focus();
    tf.value = "yo";
    tf.setSelectionRange(0,2);

    let p:Promise<string> = new Promise((resolve, reject)=>{

      tf.onkeyup = () => {

        if(previousFocus)
          previousFocus.focus();

        let s:string = tf.value;
        document.body.removeChild(tf);

        resolve(s);

      };


    });

    document.execCommand("paste");



    return p;

  }




  /*
  *  This function is useful to read properties in an unknown object without causing a error.
  *
  *  for instance: prop_a.child_a.child_b.hello
  *
  *  if prop_a.child_a doesn't exist, you will simply get "null" back.
  *  it won't throw an error when trying to read "child_b" from an null object.
  *
  * */
  public static getValue(obj:any,path:string|Array<string>, defaultValue:any = null):any
  {

    if(path instanceof Array)
    {
      let arr:Array<string> = path as Array<string>;
      for(let i:number = 0; i < arr.length; i++)
      {
        let iPath:string = arr[i];
        let v:any = this.getValue(obj, iPath, null);
        if(v != null)
          return v;
      }

      return defaultValue;
    }

    if(obj == null || StringUtils.isNullOrEmpty(path))
      return defaultValue;

    let i:number = path.indexOf(".");

    let propertyName:string = null;
    if(i == -1)
      propertyName = path;
    else
      propertyName = path.substring(0,i);

    let value:any = obj[propertyName];


    if(i<path.length-1 && i != -1 && value != null)
    {
      path = path.substring(i+1,path.length);
      return Utils.getValue(value, path, defaultValue);
    }

    if(!obj.hasOwnProperty(propertyName))
      return defaultValue;

    return value;

  }

  public static getInheritencePath(obj:any, separator:string = " -> "):string{

    let className:string = Utils.getValue(obj, "__proto__.constructor.name");
    if(StringUtils.isNullOrEmpty(className))
      return null;

    let parentClassName:string;

    if(obj.__proto__ && obj.__proto__.__proto__)
      parentClassName = Utils.getInheritencePath(obj.__proto__, separator);

    if(!StringUtils.isNullOrEmpty(parentClassName))
      return parentClassName + separator + className;
    else
      return className;
  }



  // this function also makes a difference for the
  // Date = "date"
  // null = "null"
  // Array = "array"
  // List  = "list"
  // Otherwise, these properties are seen as objects.

  public static typeof(obj):string{

    let t = typeof obj;

    if (t == "object")
    {

      if(List.isList(obj))
        return "list";
      
      else if(obj instanceof Array)
        return "array";

      else if(obj instanceof Date)
        return "date";

      else if(obj === null)
        return "null";

      else
        return "object";

    }

    return t;

  }


  public static toJSON(obj:any, recursive:boolean = false):any {

    let t:string = Utils.typeof(obj);

    // string, boolean, number, date
    if(t == "string" || t == "boolean" || t == "number" || t == "date")
      return obj;

    // null
    else if(t == "null")
      return null;

    // function, symbol
    if(t == "function" || t == "symbol")
      return undefined; // ignore functions and symbol

    // has a function called toJSON
    else if(obj && obj.toJSON != null)
      return obj.toJSON(recursive);

    if(t == "array" && recursive)
    {
      for(var i:number = 0; i < obj.length; i++)
        obj[i] = Utils.toJSON(obj[i], true);

      return obj;
    }
    else if(t == "object")
    {
      let o:any = {};

      for (let prop in obj)
      {
        // ignore private properties
        if(StringUtils.startsWith(prop, "_"))
          continue;

        let t:string = Utils.typeof(obj[prop]);

        if (recursive == false && ( t == "object" || t == "array" || t == "list"))
          o[prop] = "["+ t +"]";
        else {
          let v =  Utils.toJSON(obj[prop],recursive);
          if(v !== undefined)
            o[prop] = v;
        }
      }

      return o;
    }


    return null;
  }

  public static fromJSON<T>(json: any, obj: T = null) : T {

    if(json == null)
      return;

    if(this.typeof(obj) == "date")
    {
      let d:Date = new Date(json);
      
      (obj as any).setTime(d.getTime());
      return obj;
    }

    if(typeof(json) == "string") {
      json = JSON.parse(json);
      if(obj)
        obj = Utils.fromJSON(json, obj);
      return obj;
    }

    if (typeof obj["fromJSON"] === "function") {
      obj["fromJSON"](json);
      return obj;
    }


    for (var propName in json)
    {
      let prop:any = obj[propName];
      let value:any = json[propName];

      let t:string = Utils.typeof(prop);

      // string, boolean, number, date
      if(t == "boolean"){
        if(Utils.typeof(value) == "string")
          obj[propName] = StringUtils.toBool(value);
        else
          obj[propName] = value;
      }
      else if(t == "string" || t == "number" || t == "date")
        obj[propName] = value;

      else if (prop && prop.fromJSON != null)
        prop.fromJSON(value);

      else if (t == "object")
        Utils.fromJSON(value, prop);
      
      else
        obj[propName] = value
    }


    return obj;
  }


  public static mixin(...objs):any {
    let newObj = {};

    objs.forEach(o => {
      Object.keys(o).forEach(k => {
        if(typeof newObj[k] == "object")
          newObj[k] = Utils.mixin(newObj[k],o[k]);
        else
          newObj[k] = o[k];
      });
    });

    return newObj;
  }

  public static clone(obj:any):any {
      
    let objType = this.typeof(obj);

    if(obj === null) return null;
    if(obj === undefined) return undefined;

    if(objType == "string" || objType == "boolean" || objType == "number") 
      return obj;
   
    if(objType == "date") 
      return new Date((obj as Date).getTime());
    
    if(objType == "array") 
    {
      let arrIn:Array<any> = obj as Array<any>;
      let newObj:Array<any> = [];
      for(let each in arrIn)
        newObj[each] = this.clone(arrIn[each]);
      return newObj;
    }
       
    
    // we are assuming it is an object
    let newObj:any = {};
    for(let each in obj){
      newObj[each] = this.clone(obj[each]);
    }
    
    return newObj;
  }


  public static getProperties(obj:any):string[]{

    let props:string[] = [];

    for(let each in obj)
      props.push(each);

    return props;
  }

}
