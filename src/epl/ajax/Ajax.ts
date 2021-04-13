/**
 * Author: www.ericperron.com, 2018.
 */

import {URLUtils} from "../utils/URLUtils";
import {StringUtils} from "../utils/stringUtils/StringUtils";
import {StringSearch} from "../utils/stringUtils/StringSearch";
import {Key} from "../Key";
import {XMLUtils} from "../utils/XMLUtils";


export class Ajax{

  public static async soap(url:string, action:string, body:any):Promise<any>
  {
    let args:AjaxArgs = new AjaxArgs();

    args.url = url;
    args.method = AjaxMethod.POST;
    args.requestType = args.type = AjaxType.SOAP;
    args.soapAction = action;
    args.data = body;

    return await Ajax.load(args);
  }

  public static async json(url:string,  data:any = null, type:string = AjaxType.JSON, headers:Array<Key> = null, withCredentials:boolean = false):Promise<any>
  {
    let args:AjaxArgs = new AjaxArgs();

    args.url = url;
    args.method = AjaxMethod.POST;
    args.requestType = AjaxType.JSON;
    args.type = type;
    args.data = data;
    args.headers = headers;
    args.withCredentials = withCredentials;

    return await Ajax.load(args);
  }

  public static async post(url:string,  data:any = null, type:string = AjaxType.TEXT, headers:Array<Key> = null, withCredentials:boolean = false):Promise<any>
  {
    let args:AjaxArgs = new AjaxArgs();

    args.url = url;
    args.method = AjaxMethod.POST;
    args.requestType = AjaxType.FORM;
    args.type = type;
    args.data = data;
    args.headers = headers;
    args.withCredentials = withCredentials;

    return await Ajax.load(args);
  }

  public static async get(url:string, data:any = null,  type:string = AjaxType.TEXT, headers:Array<Key> = null, withCredentials:boolean = false):Promise<any>
  {
    let args:AjaxArgs = new AjaxArgs();

    args.url = url;
    args.method = AjaxMethod.GET;
    args.type = type;
    args.requestType = AjaxType.URI_PARAMS;
    args.data = data;
    args.headers = headers;
    args.withCredentials = withCredentials;

    return await Ajax.load(args);
  }



  public static async load(args:AjaxArgs):Promise<any>
  {
    // prepare models
    let response:string = null;

     if(response == null)
    {
      try{
        response = await this._xmlHttpRequestCall(args);
      } catch(error){
        throw error;
      }

    }

    // -----------------------------
    // expecting XML
    if(args.type == AjaxType.XML)
    {
      return XMLUtils.parseXML(response);
    }

    // -----------------------------
    // expecting JSON
    if (args.type == AjaxType.JSON)
    {
      try
      {
        response = JSON.parse(response);
      }
      catch(error)
      {
        console.debug("EPL AJAX [Error]: Error Parsing JSON Response from " + args.url);
        throw (new Error(error.message + " : " + response));
      }

      return response;
    }

    // expecting text or anything else
    return response;

  }
  

  private static async _xmlHttpRequestCall(args:AjaxArgs):Promise<any>{

    let url:string = args.url;
    let data:any = args.data;

    if(data != null) {
      // FORM
      if (args.requestType == AjaxType.FORM)
        data = URLUtils.objToForm(data);

      // JSON
      else if (args.requestType == AjaxType.JSON && typeof(data) != "string")
        data = JSON.stringify(data);

      // TEXT
      else if (args.requestType == AjaxType.TEXT)
        data = data;

      // URI_PARAMS (GET variables)
      else if (args.requestType == AjaxType.URI_PARAMS)
        data = URLUtils.objToURIParams(data);

      //  SOAP + HTTPS
      //  if args is a SOAP done through http, then remove the authorization header, if there is one in the first place.
      else if (args.requestType == AjaxType.SOAP && url && !url.toLowerCase().startsWith("https") && typeof(data) == "string" && data.toLowerCase().indexOf("<wsse:security") != -1) {
        data = StringUtils.parse(new StringSearch(data, "<wsse:Security", "/wsse:Security>"), false, (s: StringSearch) => {
          return ""
        });
      }
    }

    // if the method is GET, set variables in URL
    if(data != null && args.method == AjaxMethod.GET)
      url += "?"+ data;


    // prepare Request
    let r:XMLHttpRequest = new XMLHttpRequest();
    r.withCredentials = args.withCredentials;
    if(args.type == AjaxType.File)
      r.responseType = 'blob';

    r.open(args.method, url, true);

    if(args.headers)
    {
      args.headers.forEach((k:Key)=>{
        r.setRequestHeader(k.label, k.value);
      });
    }

    // Set Content name based on the provided request Type
    if(args.type != null)
    {
      if(args.requestType == AjaxType.SOAP)
      {
        r.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        r.setRequestHeader("SOAPAction", args.soapAction);
      }
      if(args.requestType == AjaxType.XML)
        r.setRequestHeader("Content-Type", "text/xml");
      if(args.requestType == AjaxType.JSON || args.requestType == AjaxType.TEXT || args.requestType == AjaxType.FORM)
        r.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }

    return new Promise((resolve, reject)=>{

      r.onerror = (event:Event):void =>{
        reject(Error(StringUtils.Format("Ajax Error: Loading failed.",[event.type])));
        console.debug("EPL AJAX [error]: status 0");
        reject(Error("AJAX: Status Error: " + r.status));
        return;
      };

      r.onabort = (event:Event):void =>{
        console.debug("EPL AJAX [error]: abort 0");
        reject(Error(StringUtils.Format("Ajax onAbort: Loading failed.",[event.type])));
        return;
      };

      r.ontimeout = (event:Event):void =>{
        console.debug("EPL AJAX [error]: timeout 0");
        reject(Error(StringUtils.Format("Ajax onTimeout: Loading failed.",[event.type])));
        return;
      };

      r.onreadystatechange = (data:Event):void => {
        var r: XMLHttpRequest = data.target as XMLHttpRequest;

        if (r.readyState != 4)
          return;

        if(r.status != 200)
        {
          reject(new Error("Not found!"));
        }

        resolve(r.response);
        return;
      };

      r.send(data);

    });

  }




}

export class AjaxType{

  public static readonly XML:string = "xml";
  public static readonly File:string = "file";
  public static readonly JSON:string = "json";
  public static readonly TEXT:string = "text";
  public static readonly FORM:string = "form";
  public static readonly SOAP:string = "soap";
  public static readonly URI_PARAMS:string = "uriParams";

}

export class AjaxMethod{

  public static readonly POST:string = "POST";
  public static readonly GET:string = "GET";

}


export class AjaxArgs{

  public url:string;
  public headers:Array<Key>;
  public method:string = AjaxMethod.GET;
  public type:string = AjaxType.FORM;
  public requestType:string = AjaxType.XML;
  public withCredentials:boolean = false; // send the cookie to a cross origin web site.
  public async:boolean = true;
  public soapAction:string = "";


  private _data:any;

  public get data():any
  {
    return this._data;
  }

  public set data(value:any)
  {
    if(value == this._data)
      return;

    if(value == null)
      this._dataString = null;
    else if(typeof(value) == "string")
      this._dataString = value;
    else
      this._dataString = JSON.stringify(value);

    this._data = value;

  }

  private _dataString:string;

  public get dataString():string {

    return this._dataString;

  }


  public clone():AjaxArgs{

    let clone:AjaxArgs = new AjaxArgs();

    clone.url = this.url;
    clone.method = this.method;
    clone.type = this.type;
    clone.async = this.async;
    clone.soapAction = this.soapAction;

    // we don't want to send an object pointer to a clone.
    // hence, we are not copying the headers
    // and we stringify models objects

    clone.data = this.dataString;


    return clone;
  }




  constructor(){}
}
