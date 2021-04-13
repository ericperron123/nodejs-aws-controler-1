/**
 * Author: www.ericperron.com, 2018.
 */

import {EPLStyleEventEmitter, EplEvent} from "./EPLStyleEventEmitter";
import {List, ListEvent} from "./List";

export class SelectionEvent extends EplEvent {

  constructor(type:string, targetObj:any)
  {
    super(type, targetObj);
  }

  public static readonly ITEM_SELECTED:string = "itemSelected";
  public static readonly ITEM_UNSELECTED:string = "itemUnselected";
  public static readonly SELECT_ALL:string = "selectAll";
  public static readonly UNSELECT_ALL:string = "unselectAll";
}

export class EplSelection<T> extends EPLStyleEventEmitter
{

  public list:List<T>;
  public multiple:boolean = true;

  private _selectedItems:Array<T>;

  public get selectedItems():Array<T>
  {
    return this._selectedItems;
  }

  public get selectedItem():T
  {
    return this._selectedItems[0];
  }

  public isItemSelected(item:T):boolean
  {
    let i = this._selectedItems.indexOf(item);
    return (i != -1);
  }


  public selectItem(item:T):Boolean
  {

    // check if item is already selected.
    if(this.isItemSelected(item))
      return false;

    // if multiple selection is not allowed, unselect the current item.
    if(!this.multiple && this.selectedItem != null)
    {
      this.unselectItem(this.selectedItem);
    }

    // add the item to the selected items.
    this._selectedItems.push(item);

    let event:SelectionEvent = new SelectionEvent(SelectionEvent.ITEM_SELECTED, this);
    event.data = item;
    this.emit(event);

    return true;
  }

  public unselectItem(item:T):Boolean
  {

    // check if item is already not selected.
    if(this.isItemSelected(item)== false)
      return false;

    // remove the selected item from the unselectedItems array
    let i = this._selectedItems.indexOf(item);
    if(i != -1)
      this._selectedItems.splice(i,1);

    let event:SelectionEvent = new SelectionEvent(SelectionEvent.ITEM_UNSELECTED, this);
    event.data = item;
    this.emit(event);

    return true;
  }

  public unselectAll():void
  {
    this._selectedItems = [];

    let event:SelectionEvent = new SelectionEvent(SelectionEvent.UNSELECT_ALL, this);
    this.emit(event);
  }

  public selectAll():void
  {
    this._selectedItems = [];
    this.list.forEach((item:T)=>{
      this._selectedItems.push(item);
    })

    let event:SelectionEvent = new SelectionEvent(SelectionEvent.SELECT_ALL, this);
    this.emit(event);

  }


  constructor(list:List<T> = null, multiple:boolean = true){

    super();
    if(list)
      this.list = list;
    else
      this.list = new List<T>();

    this.list.on(ListEvent.ITEM_REMOVED, (event:ListEvent)=>{
      this.unselectItem(event.item);
    }, this);

    this.list.on(ListEvent.REMOVE_ALL, (event:ListEvent)=>{
      this.unselectAll();
    }, this);

  }


}
