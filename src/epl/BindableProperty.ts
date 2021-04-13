/**
 * Author: www.ericperron.com, 2018.
 */

import {EPLStyleEventEmitter, EplEvent, PropertyChangeEvent} from "./EPLStyleEventEmitter";

export class BindableProperty extends EPLStyleEventEmitter
{
  public get name():string { return this._name;};
  public get value():any { return this._value;};

  public set value(v:any)
  {
    if(this._value == v)
      return;

    // prepare the change event
    let e:PropertyChangeEvent = new PropertyChangeEvent(PropertyChangeEvent.CHANGE, this);
    e.newValue = v;
    e.oldValue = this._value;
    e.propertyName = this.name;

    // change the bindAtt
    this._value = v;

    // dispatch the event
    this.emit(e);

  };


  private _name:string;
  private _value:any;

  constructor(name:string, value?:any)
  {
    super();

    this._name = name;
    this._value = value;

  }

}

