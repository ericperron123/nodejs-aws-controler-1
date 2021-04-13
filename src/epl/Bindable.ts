/**
 * Author: www.ericperron.com, 2018.
 */


import {EPLStyleEventEmitter, EplEvent, PropertyChangeEvent} from "./EPLStyleEventEmitter";

export class Bindable extends EPLStyleEventEmitter
{
  private _obj:any;

  private _initProxy(obj:any):any{

    let proxy = new Proxy(obj, {

      set: (pt, propertyName, value):boolean => {

        if(pt[propertyName] == value) return true;

        // prepare the change event
        let e:PropertyChangeEvent = new PropertyChangeEvent(PropertyChangeEvent.CHANGE, this);
        e.newValue = value;
        e.oldValue = pt[propertyName];
        e.propertyName = propertyName.toString();

        // change the bindAtt
        pt[propertyName] = value;
        // dispatch the event
        this.emit(e);

        return true;
      },
      get: (pt, propertyName):any => {

        return pt[propertyName];
      }
    });

    return proxy;

  }


  constructor(data:any = null)
  {
    super();

    if(data)
      for (let propName in data) {
        this[propName] = data[propName];
      }

    return this._initProxy(this);
  }

}

