/**
 * Author: www.ericperron.com, 2018.
 */

import {EPLStyleEventEmitter, EplEvent, PropertyChangeEvent} from "./EPLStyleEventEmitter";
import {Utils} from "./utils/Utils";

export class Key extends EPLStyleEventEmitter
{

    public get label():string { return this._label;};
    public get value():any { return this._value;};

    public set label(v:string)
    {
        if(this._label == v)
            return;

        // prepare the change event
        let e:PropertyChangeEvent = new PropertyChangeEvent(PropertyChangeEvent.CHANGE, this);
        e.newValue = v;
        e.oldValue = this._label;
        e.propertyName = "label";

        // change the bindAtt
        this._label = v;

        // dispatch the event
        this.emit(e);

    };

    public set value(v:any)
    {
        if(this._value == v)
            return;

        // prepare the change event
        let e:PropertyChangeEvent = new PropertyChangeEvent(PropertyChangeEvent.CHANGE, this);
        e.newValue = v;
        e.oldValue = this._value;
        e.propertyName = "value";

        // change the bindAtt
        this._value = v;

        // dispatch the event
        this.emit(e);

    };


    private _label:string;
    private _value:any;

    public toJSON():any{
        return {
            label: this.label,
            value:this.value
        }
    }

    public fromJSON(o:any):void
    {
      this.label = o.label;
      this.value = o.value;
    }

    constructor(label:string = null, value?:any)
    {
        super()

        this._label = label;
        this._value = value;

    }

}
