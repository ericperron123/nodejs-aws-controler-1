

export class EplEvent {

  public static readonly COMPLETE:string = "complete";

  private _type:string;
  private _target:any;

  public data:any;

  constructor(type:string, targetObj?:any, data?:any ) {
    this._type = type;
    this._target = targetObj;
    this.data = data;
  }

  public get target():any {
    return this._target;
  }

  public get type():string {
    return this._type;
  }

  public clone(targetObj:any):EplEvent
  {
    let newEvent:EplEvent = new EplEvent(this.type,targetObj);
    newEvent.data = this.data;
    return newEvent;
  }


}


export class PropertyChangeEvent extends EplEvent
{

  public static readonly BEFORE_CHANGE:string = "beforePropertyChange";
  public static readonly CHANGE:string = "propertyChange";

  public oldValue:any;
  public newValue:any;
  public propertyName:string ="";

  public clone(targetObj:any)
  {
    let newEvent:PropertyChangeEvent = new PropertyChangeEvent(this.type, targetObj);
    newEvent.data = this.data;
    newEvent.oldValue = this.oldValue;
    newEvent.newValue = this.newValue;
    newEvent.propertyName = this.propertyName;

    return newEvent;

  }

  constructor(type:string, obj:any)
  {
    super(type, obj);
  }

}


export class EPLStyleEventEmitter {



  // *********************************************
  // Public Methods
  // *********************************************

  public mimicEvent(type:string, dispatcherObj:EPLStyleEventEmitter):void
  {
    dispatcherObj.on(type, this._mimicHandler, this);
  }

  public mimicEventOff(type:string, dispatcherObj:EPLStyleEventEmitter):void
  {
    dispatcherObj.off(type, this._mimicHandler, this);
  }

  public getEventListener(type:string, listener:Function|string, scope:any):EventListener
  {

    let exists:Boolean = false;

    for (let i = 0; i < this._listeners.length; i++)
    {
      let item:EventListener = this._listeners[i];
      if (item.type === type && item.listener === listener && item.scope == scope)
        return item;
    }

    return null;
  }


  public onAll(listenerFunc:Function|string, scope:any):EventListener|Array<EventListener> {

    let listener:EventListener = new EventListener("**EPS: subscribe to all events", listenerFunc, scope);
    this._listeners.push(listener);
    return listener;
  }

  public on(type:string|Array<string>, listenerFunc:Function|string, scope:any):EventListener|Array<EventListener> {

    if(listenerFunc == null)
    {
      
      console.error("The listener for ["+type+"], is not defined!");
      throw "The listener is not defined!";
    }

    if(typeof type == "string")
    {
      if (this.getEventListener(type, listenerFunc, scope) != null)
        return;

      let listener:EventListener =new EventListener(type, listenerFunc, scope);
      this._listeners.push(listener);
      return listener;
    }
    else {
      let arr:Array<EventListener> = new Array<EventListener>();

      for(let typeItem of type){
        let listener:EventListener = this.on(typeItem, listenerFunc, scope) as EventListener;
        arr.push(listener);
      }

      return arr;
    }
  }

  public onOnce(type:string|Array<string>, listenerFunc:Function, scope:any):EventListener|Array<EventListener>{
    if(typeof type == "string")
    {
      if (this.getEventListener(type, listenerFunc, scope))
        return;

      let listener:EventListener = new EventListener(type, listenerFunc, scope, true);
      this._listeners.push(listener);
      return listener;
    }
    else {
      let arr:Array<EventListener> = new Array<EventListener>();

      for(let typeItem of type){
        let listener:EventListener = this.onOnce(typeItem, listenerFunc, scope) as EventListener;
        arr.push(listener);
      }

      return arr;
    }

  }

  public off(type:string|Array<string>, listenerFunc:Function|string, scope:any):void {

    if(typeof type == "string")
    {
      for (let i = 0; i < this._listeners.length; i++)
      {
        let item:EventListener = this._listeners[i];
        if (item.type === type && (item.listener === listenerFunc || listenerFunc== null)  && item.scope === scope) {
            this._listeners.splice(i, 1);
        }
      }
    }
    else for(let typeItem of type)
      this.off(typeItem, listenerFunc, scope);
  }

  public offAll(scope:any = null):void {

    // let scope:any = null;
    for(let i:number = this._listeners.length - 1; i >= 0; i--)
    {
      let item:EventListener =  this._listeners[i];
      if(scope == null || item.scope == scope)
      {
        item.type = null;
        item.scope = null;
        item.listener = null;
        try{
          this._listeners.splice(i, 1);
        }catch(error){}
      }
    }

  }

  public emit(evt:EplEvent|string, data?:any) {

    if(typeof evt == "string") {
      evt = new EplEvent(evt, this);
      evt.data = data;
    }

    for (let i = 0; i < this._listeners.length; i++)
    {
      if (this._listeners[i].type === evt.type || this._listeners[i].type == "*" || this._listeners[i].type == "**EPS: subscribe to all events")
      {
        let listener = this._listeners[i];
        if(typeof listener.listener == "string" ){
          listener.scope[listener.listener](evt);
        }
        else
          listener.listener.call(this, evt, listener.scope);

        if(listener.once)
          this.off(listener.type, listener.listener, listener.scope);

      }
    }
  }


  // *********************************************
  // Private properties
  // *********************************************



  private _listeners:Array<EventListener> = new Array<EventListener>();


  // *********************************************
  // Event Handlers
  // *********************************************

  private _mimicHandler(event:any, scope:any):void
  {
    let newEvent:any = event.clone(scope);
    scope.emit(newEvent);
  }

  private removeEventListener(eventListener:EventListener):void{

    for(let i:number = 0; i < this._listeners.length; i++)
    {
      if(eventListener == this._listeners[i])
        this._listeners.splice(i, 1);
    }

  }

}





export class EventListener {

  public type:string;
  public listener:Function|string;
  public scope:any;
  public once:boolean = false

  constructor(type:string, listener:Function|string, scope:any, once:boolean = false){
    this.type = type;
    this.listener = listener;
    this.scope = scope;
    this.once = once;
  }

}
