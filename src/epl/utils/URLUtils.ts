/**
 * Author: www.ericperron.com, 2018.
 */

import {StringUtils} from "./stringUtils/StringUtils";

export class URLUtils {


  public static addPaths(basePath:string, subFolderPath:string):string{

    let newPath:string = basePath;

    if(newPath.charAt(newPath.length-1) != "\\" && newPath.charAt(newPath.length-1) != "/")
    {
      newPath += "/";
    }

    return newPath+subFolderPath;

  }


  public static objToForm(obj:any):string{
    let str = "";


    for (let key in obj) {
      if (str != "") {
        str += "&";
      }
      str += key + "=" + StringUtils.replace(obj[key],"&","&amp;");
    }

    return str;
  }

  public static objToURIParams(obj:any):string{

    let str = "";


    for (let key in obj) {
      if (str != "") {
        str += "&";
      }
      str += key + "=" + encodeURIComponent(obj[key]);
    }

    return str;
  }

  public static URIParamsToObj(path:string):any{

    let vars:any = {}

    let pairs:Array<string> = path.split("&");

    pairs.forEach((pair)=>{
      let s:Array<string> = pair.split("=");
      let propertyName:string = decodeURIComponent(s[0]);
      if(!StringUtils.isNullOrEmpty(propertyName))
      {
        let value:string = null;
        if(s.length>1)
          value = decodeURIComponent(s[1]);
        vars[propertyName] = value;
      }
    });

    return vars;
  }

  public static pathToLocation (path:string):URLLocation
  {
    let o:URLLocation = new URLLocation();

    o.fullPath = path;

    // ------------------------------
    // variables
    var i = path.indexOf("?");
    if(i != -1) {
      let vars:string = path.substring( i+1 , path.length);
      o.vars = this.URIParamsToObj(vars);
      path = path.substr(0,i);
    }

    // ------------------------------
    // protocole

    i = path.indexOf("://");
    if(i != -1) {
      o.protocol = path.substr(0,i);
      path = path.substring( i+3 , path.length);
    }

    // ------------------------------
    // check for port
    i = path.indexOf(":");
    var i2 = path.indexOf("/");

    if(i != -1 && (i < i2 || i2 == -1)){
      if(i2 == -1) {
        i2 = path.length;
      }
      else
        o.subPath = path.substring(i2 + 1,path.length);

      o.port = path.substring(i + 1,i2);
      path = path.substr(0,i);
    }

    // domain
    i2 = path.indexOf("/");
    if(i2 != -1){
      path = path.substr(0,i2);
    }

    o.domains = path.split(".");
    o.tld = o.domains.pop();

    return o;
  }

  public static  relativeToFullPath(path:string, defaultPath:string):string
  {
    path = StringUtils.replace(path, "\\", "/");

    let a:number = defaultPath.indexOf("://");
    let urlProtocol:string = "";
    let urlDomain:string = "";

    if(a != -1)
    {
      let arrPath:Array<string> = defaultPath.split("://");
      urlProtocol = arrPath[0];
      urlDomain = arrPath[1];
    }
    else
    {
      urlProtocol = "https";
      urlDomain = defaultPath;
    }

    let i:number = path.indexOf("/");
    let i2:number = path.indexOf("//");

    if(i2 == 0) // url starts with "//"
      return urlProtocol+":"+ path;

    if(i == 0) // url starts with "/"
      return urlProtocol + "://" +urlDomain + path;

    if(i == i2) // url has "//" before any "/"
      return path;

    var i3:number = path.indexOf(".");

    if(i3 < i) // there is a "." before a "/".
      return urlProtocol + "://"+path;

    return urlProtocol + "://" +urlDomain + "/" + path;
  }

}


export class URLLocation {

  public get host():string
  {
    return this.domains[this.domains.length - 1] + "." + this.tld;
  }

  public domains:Array<string>;
  public fullPath:string;
  public subPath:string;
  public tld:string;  // top level domain
  public protocol:string;
  public port:string;
  public vars:string;

}
