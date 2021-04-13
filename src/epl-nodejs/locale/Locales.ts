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




import {PropertiesFile} from "../../epl/file/PropertiesFile";
import {LocaleType} from "./LocaleType";
import {EPLStyleEventEmitter} from "../../epl/EPLStyleEventEmitter";
import {StringUtils} from "../../epl/utils/stringUtils/StringUtils";
import * as fs from "fs";
import {Utils} from "../../epl/utils/Utils";
import { Logger } from "../Logger";

export class Locales extends EPLStyleEventEmitter {

  // *******************************************
  // PUBLIC Properties
  // *******************************************

  public path:string;
  public _data:any = {};

  // *******************************************
  // Public GET/SETS Properties
  // *******************************************

  // -------------------------------------------
  // lang
  // -------------------------------------------

  public get lang():string{return this._lang;}
  public set lang(value:string)
  {
    if(value ==  this._lang)
      return;

    this._lang = value;

    if(!this.getData(this._lang).epsNotFound) {
      this.emit("change", this.getData());
      return;
    }
    else
      this.load();
  }


  // *******************************************
  // Public Methods
  // *******************************************

  public $(path:string, lang?:string, vars?:Array<string>):any{

    let text:string = Utils.getValue(this.getData(lang), path);

    if(vars)
      text = StringUtils.Format(text, vars);

    return text;
  }

  public getData(lang?:string):any
  {
    if(StringUtils.isNullOrEmpty(lang))
      lang = this.lang;

    if(this._data[lang] == null)
      return {
        "epsNotFound":true
      };
    else
      return this._data[lang];
  }

  public toggle():void
  {
    if(this.lang == LocaleType.en_CA)
      this.lang = LocaleType.fr_CA;
    else
      this.lang = LocaleType.en_CA;
  }

  public async load(path:string = null, lang?:string):Promise<any>
  {

    if(!StringUtils.isNullOrEmpty(path))
      this.path = path;

    if(StringUtils.isNullOrEmpty(this.path)) {
      return;
    }

    if(StringUtils.isNullOrEmpty(lang))
      lang = this.lang;


    let properties:PropertiesFile = new PropertiesFile();

    try{
      let fileText:string = await fs.readFileSync(path,'utf8');
      this._data[lang] = await properties.read(fileText);

      this.emit("change", this._data[this.lang]);

    } catch(e)
    {
      Logger.error("Could not load the locales from " + path)
      return;
    
    }
    return  this._data[this.lang];
  }

  // *******************************************
  // Private properties
  // *******************************************

  private _lang:string = LocaleType.en_CA;


}
