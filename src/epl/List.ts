/**
 * Author: www.ericperron.com, 2018.
 */

import {EPLStyleEventEmitter, EplEvent} from "./EPLStyleEventEmitter";
import {Utils} from "./utils/Utils";
import {StringUtils} from "./utils/stringUtils/StringUtils";

export class ListEvent extends EplEvent {

  public static readonly ITEM_ADDED:string = "itemAdded";
  public static readonly ITEM_REMOVED:string = "itemRemoved";
  public static readonly ITEMS_ADDED:string = "itemsAdded";
  public static readonly REMOVE_ALL:string = "removeAll";
  public static readonly BEFORE_REMOVE_ALL:string = "beforeRemoveAll";
  public static readonly MOVE:string = "move";

  public item:any;
  public items:Array<any>;
  public index:number = -1;
  public oldIndex:number = -1;

  constructor(type:string, targetObj:any)
  {
    super(type, targetObj);
  }

}


export class List<T> extends EPLStyleEventEmitter{

  // *************************************
  // Static Public property
  // *************************************

  public static readonly BREAK:string = "break";

  // *************************************
  // Static Public methods
  // *************************************

  public static isList(obj:any):boolean{
    if(obj && obj.className == "List")
      return true;

    return false;
  }


  // *************************************
  // Public Properties
  // *************************************

  public idFieldName:string = "id";
  public className:string = "List";


  // *************************************
  // Private Properties
  // *************************************


  private _list:Array<any> = [];


  // *************************************
  // Public Methods
  // *************************************

  public hasUniqueValues():boolean
  {
    let flag:boolean = true;

    this.forEach((a:T)=>{
      let c:number = this.find((b:T)=>{
        return (a == b)
      });

      if(c != -1) {
        flag = false;
        return List.BREAK;
      }
    });

    return flag;

  }

  public getUniqueValues():List<T>
  {
    let unique:List<any> = new List<T>();
    let j:number;
    let found:Boolean = false;

    for (let i:number = 0 ; i < this._list.length; i++ )
    {
      found = false;
      for (j = 0 ; j < unique.length; j++ )
      {
        if(unique[j] == this._list[i])
          found = true;
      }

      if(!found)
        unique.addItem(this._list[i]);
    }

    return unique;

  }

  public removeDuplicates(f?:(a:T,b:T)=>boolean):void
  {

    if(f == null)
      f = (a:T,b:T)=>{ return a == b; };

    if(this.length < 2)
      return;

    this.forEach((item:T, index:number)=>{

      let findIndex:number = this.find((item2:T, index2:number):boolean=> (index != index2 && f(item,item2)));
      if(findIndex != -1) {
        this.removeItemAt(findIndex);
      }
    },true);

    return;

  }

  public async destroy():Promise<any> {

    // removes all the event listeners.
    // this method is to clear memory. When this is called, your code should not be
    // listening to any events on this object.
    this.offAll();

    // destroy each of the children
    await this.forEachAsync(async (item:any):Promise<any>=>{
      if(item.destroy)
        return Utils.toAsync(item.destroy());
    });

    // removes all the children.
    this.removeAll();
  }

  public toString(f?:(item:T)=>string, seperator:string = ",", ignoreNullOrEmpty:boolean = false):string
  {
    
    let result:string = ""
    
    this.forEach((item:T)=>{

      let itemValue:string = (f == null) ? item.toString() : f(item);

      if(!ignoreNullOrEmpty || !StringUtils.isNullOrEmpty(itemValue))
        result += itemValue + seperator;
       
    })

    result = result.substr(0,result.length-1);

    return result;
  }

  public get last():T{

    if(this._list.length == 0)
      return null;

    return this._list[this._list.length-1]
  }

  public get first():T{

    return this._list[0];
  }

  public get random():T{
    if(this.count == 0)
      return null;

    if(this.count == 1)
      return this._list[0];

    let i:number = Math.round(Math.random()*this.count - 1);
    if(i==-1) i = 0;
    
    return this._list[i];
  }

  public get length():number
  {
    return this._list.length;
  }

  public get count():number
  {
    return this._list.length;
  }

  public removeItemAt(index:number):void {
    // remove from the list

    if(index < 0 && index > (this._list.length - 1))
    {
      console.debug("EPL List: Index is out of range. index: " + index + ".")
      return;
    }

    let rslt: Array<any> = this._list.splice(index, 1);

    if (rslt.length == 0)
    {
      console.debug("EPL List: Unable to remove item at " + index + ". Nothing returned by the splice method!")
      return;
    }

    let item = rslt[0];

    let event:ListEvent = new ListEvent(ListEvent.ITEM_REMOVED, this);
    event.item = item;
    event.index = index;
    this.emit(event);

    return item;

  }

  public move(item:any, index:number):void{

    let old_index:number = this.indexOf(item);
    if(old_index == -1 || old_index == index || index == this.count)
      return;

    this._list.splice(index, 0, this._list.splice(old_index, 1)[0]);

    let event:ListEvent = new ListEvent(ListEvent.MOVE, this);
    event.item = item;
    event.index = index;
    event.oldIndex = old_index;
    this.emit(event);

  }

  public pop(first:boolean = false):any
  {
    let item:any;

    if(first){
      item = this.first;
      this.removeItemAt(0);
    }
    else
    {
      item = this.last;
      this.removeItemAt(this.count - 1);
    }
    return item;
  }

  public popRange(from:number, to:number):List<T>{

    if(to > this.length - 1)
      to = this.length - 1;
      
    if(from == 0 && to == 0)
    {
      let r:List<T> = new List();
      r.addItem(this._list[0]);
      this._list = [];
      return r;
    } 

    return new List(this._list.splice(from, to));

  }

  public removeAll():void{

    let event:ListEvent = new ListEvent(ListEvent.BEFORE_REMOVE_ALL, this);
    this.emit(event);

    this._list = [];

    let event2:ListEvent = new ListEvent(ListEvent.REMOVE_ALL , this);
    this.emit(event2);

  }

  public itemAt(index:number):T
  {
    return this._list[index];
  }

  public find(f:(a:T, b?:number)=>boolean):number
  {
    let flag;
    let index:number = 0

    for(index; index<this.length; index++)
    {
      flag = f(this.itemAt(index), index);
      if(flag)
        break;
    }

    if(flag)
      return index;
    else
      return -1;
  }



  public findSortedItem(value:string|number, getValue:(item:T, index?:number)=>string|number):T {
  
    if(getValue == null)
      getValue = (item:T, index?:number)=>{
        return String(item);
      }

    let f:(value:string|number, from:number, to:number)=>T = (value:string|number, from:number, to:number):T=>{

      if(from == to){
        let item:T = this.itemAt(from);
        return (getValue(item) == value)?item:null;
      }
      else if (to - from == 1){
        
        let fromItem:T = this.itemAt(from);
        if(getValue(fromItem) == value) 
          return fromItem;

        let toItem:T = this.itemAt(to);
        if(getValue(toItem) == value) 
          return toItem;

        return null;
      }

      let mid:number = Math.floor((to-from)/2) + from;
      let midItem:T = this.itemAt(mid);
      let midItemValue:string|number = getValue(midItem);
    
      if(midItemValue == value)
        return midItem;
      else if(midItemValue < value)
        return f(value, mid, to);
      else 
        return f(value, from, mid);

    };
    
    

    return f(value, 0, this.count - 1);

  }



  public findItem(f:(a:T, b?:any)=>boolean, data?:any):T
  {
    let flag;
    let index:number = 0

    for(index; index<this.length; index++)
    {
      flag = f(this.itemAt(index), data);
      if(flag)
        break;
    }

    if(!flag)
      return null;
    else
      return this.itemAt(index);
  }

  public forEach(f:(a: T, b?:number) => string|void, reverse:boolean = false):string
  {
    let flag:string|void;

    if(reverse) {
      for (let index: number = this.length - 1; index >= 0; index--){
        flag = f(this.itemAt(index), index);
        if(flag == List.BREAK)
          break;
      }
    }
    else
      for(let index:number = 0; index<this.length; index++)
      {
        flag = f(this.itemAt(index), index);
        if(flag == List.BREAK)
          break;
      }

    if(flag == List.BREAK)
      return flag;
  }

  public async forEachAsync(f:(a: T, b?:number) => Promise<string>|Promise<void>, reverse:boolean = false):Promise<any>
  {

    if(reverse){
      for(let index:number = this.length - 1; index>=0; index--){
        let r:any = await f(this.itemAt(index), index);
        if(r == "break")
         break;
      }
    }
    else
      for(let index:number = 0; index<this.length; index++){
        let r:any = await f(this.itemAt(index), index);
        if(r == "break")
         break;
      }
  }


  public setItemAt(item:T, index:number = -1):T
  {

    if(this._list[index] !== undefined){
      let event:ListEvent = new ListEvent(ListEvent.ITEM_REMOVED, this);
      event.item = item;
      event.index = index;
      this.emit(event);
    }
    
    // replace the content
    this._list[index] = item;

    let event2:ListEvent = new ListEvent(ListEvent.ITEM_ADDED, this);
    event2.item = item;
    event2.index = index;
    this.emit(event2);

    return item;
  }

  public addItemAt(item:T, index:number = -1):T
  {
    // if the index is invalid, append to the end.
    if(index < 0  || index > this._list.length)
      this._list.push(item);
    else
      this._list.splice(index, 0, item);

    let event:ListEvent = new ListEvent(ListEvent.ITEM_ADDED, this);
    event.item = item;
    event.index = index;
    this.emit(event);

    return item;
  }

  public addItem(item?:T):T
  {
    if(item == null)
      if(this.itemFactory)
        item = this.itemFactory();
      else
        return;

    this.addItemAt(item, -1);

    return item;
  }

  public toArray():Array<T>
  {
    let arr:Array<T> = [];

    this.forEach((item:T)=>{
      arr.push(item);
    });

    return arr;
  }

  public sort(compareFn?: (a: T, b: T) => number):void{
    this._list.sort(compareFn);
  }

  /**
   * This will iterate through each values in the list and replace it with the returned value.
   * @param f
   */
  public iterate(f:(a: T, b?:number) => T):void
  {

    for(let i:number = 0; i < this._list.length; i++)
      this._list[i] = f(this._list[i], i);

  }

  public filter(f:(a: T, b?:number) => boolean):void
  {
    let newList:Array<T> = [];

    for(let i:number = 0; i < this._list.length; i++) {
      if (f(this._list[i], i)) {
        newList.push(this._list[i])
      }
    }

    this._list = newList;
  }

  public addItems(items:Array<T>|List<T>):void
  {

    if(items == null || items.length == 0)
      return;

    if(items["className"] == this.className)
    {
      let list:List<T> = items as List<T>;

      list.forEach((list:T)=>{
        this._list.push(list);
      });

      let event:ListEvent = new ListEvent(ListEvent.ITEMS_ADDED, this);
      event.items = list.toArray();
      this.emit(event);

    }
    else {
      let arr:Array<T> = items as Array<T>;
      
      for(let item of arr )
        this._list.push(item);
      
      let event:ListEvent = new ListEvent(ListEvent.ITEMS_ADDED, this);
      event.items = arr;
      this.emit(event);
    }

  }

  public removeItem(item:T):void
  {
    let i:number = this.indexOf(item);
    if(i == -1)
      return;

    this.removeItemAt(i);

  }

  public indexOf(item:T):number
  {
    return this._list.indexOf(item);
  }


  public contains(item:T):boolean{

    return this._list.indexOf(item) != -1;
  }


  public lastIndexOf(item:T):number
  {
    return this._list.lastIndexOf(item);
  }

  public getItemById(id:string, idFieldName:string = null, ignoreCase:boolean = false):T
  {
    if(StringUtils.isNullOrEmpty(id))
      return;

    if(idFieldName)
      this.idFieldName = idFieldName;

    if(ignoreCase)
      id = id.toLowerCase();

    for(let i:number = 0; i < this.length; i++)
    {
      let item:any = this.itemAt(i);
      if(item != null){
        let v:string = item[this.idFieldName];
        if(ignoreCase && v && typeof v == "string")
          v = v.toLowerCase();

        if(v == id)
          return item;
      }
    }

    return null;
  }

  public toJSON(recursive:boolean = false):any{

    let arr:Array<any> = new Array<any>();

    this.forEach((item:T)=>{
      arr.push(Utils.toJSON(item, recursive));
    })

    return arr;
  }

  public fromJSON<T>(arr:Array<T>):any{

    for(let i:number = 0; i < arr.length; i++)
    {
      // create an instance of the list item
      if(this.itemFactory != null){
        let item:any = this.itemFactory();

        // push the values into the instance
        Utils.fromJSON<T>(arr[i], item);

        // add the item into this list;
        this.addItem(item)
      }
      else {
        console.warn("WARNING: Unable to instantiate new items as the itemFactory function has not be defined in this List.");
      }
    }
  }

  public itemFactory:Function;


  public get list():Array<T>
  {
    return this._list;
  }


  // ***************************************
  // CONSTRUCTOR
  // ***************************************

  constructor(list?:List<T>|Array<T>){

    super();

    this.addItems(list);
    
  }


}
