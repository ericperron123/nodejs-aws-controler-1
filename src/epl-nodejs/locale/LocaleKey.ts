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




import {LocaleType} from "./LocaleType";
import {EPLStyleEventEmitter, PropertyChangeEvent} from "../../epl/EPLStyleEventEmitter";
import {List} from "../../epl/List";
import {Key} from "../../epl/Key";

export class LocaleKey extends EPLStyleEventEmitter {

  public type:string = LocaleType.en_CA;
  public labels: List<Key> = new List<Key>();
  public locale: string = LocaleType.en_CA;

  public get label():string{ return this.getKey(this.type).label; }
  public get en():string{ return this.getKey(LocaleType.en_CA).label; }
  public get fr():string{ return this.getKey(LocaleType.fr_CA).label; }

  private _value: string;

  public get value(): string {
    return this._value;
  }

  public set value(v: string) {
    if (v == this.value)
      return;

    // prepare change event
    let e: PropertyChangeEvent = new PropertyChangeEvent(PropertyChangeEvent.CHANGE, this);
    e.propertyName = "value";
    e.oldValue = this._value;
    e.newValue = v;

    // change event
    this._value = v;

    // dispatch Event
    this.emit(e);

  }

  public  addLabel(label: string, locale: any): Key {

    let key: Key = new Key(label, locale);
    this.labels.addItem(key);

    return key;
  }

  public  getLabel(locale: string): string {
    let key: Key = this.getKey(locale);
    if(key)
      return key.label;
    else
      return "";
  }



  public  getKey(locale: string): Key {
    let key: Key;

    for (let i: number = 0; i < this.labels.length; i++) {
      let iKey: Key = this.labels.itemAt(i) as Key;
      if (iKey.value == locale) {
        key = iKey;
        break;
      }
    }

    return key;
  }

  constructor(frLabel?:string, enLabel?:string, value?:any){
    super();

    if(frLabel) this.addLabel(frLabel,LocaleType.fr_CA);
    if(enLabel) this.addLabel(enLabel,LocaleType.en_CA);
    this.value = value;

  }


}
