/**
 * Author: www.ericperron.com, 2018.
 */
import {Key} from "../Key";

export class ArrayUtils {


  public static parse<T>(arr:Array<T>, f:Function, sameArray:boolean = false):Array<T>
  {
    let tArray:Array<T> = arr;
    if(sameArray)
      tArray = [];

    for(var i:number = 0; i < arr.length;i++)
      tArray[i] = f(arr[i]);

    return tArray;
  }

  public static forEach<T>(arr:Array<T>,f:Function):void
  {
    for(var i:number = 0; i < arr.length;i++)
    {
      let result:any = f(arr[i]);
      if(result == "break")
        break;
    }

  }

  public static async forEachAsync<T>(arr:Array<T>,f:Function):Promise<any>
  {
    for(var i:number = 0; i < arr.length;i++)
    {
      let result:any = await f(arr[i]);
      if(result == "break")
        break;
    }

  }


  public static getListOfNumbers(count:number, startAt:number = 0):Array<number>
  {
    let arr:Array<number> = [];
    for(let i =0; i <= count; i++)
      arr.push(startAt + i)

    return arr;
  }


  public static shuffle(arr:Array<any>) {
    var currentIndex = arr.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = arr[currentIndex];
      arr[currentIndex] = arr[randomIndex];
      arr[randomIndex] = temporaryValue;
    }

    return arr;
  }


  public static removeItem(arr:Array<any>, item:any):boolean
  {
    let i:number = ArrayUtils.indexOf(arr, item);

    if(i != -1)
    {
      arr.splice(i,1);
      return true;
    }

    return false;

  }

  public static removeItemAt(arr:Array<any>, index:number):void
  {
    arr.splice(index, 1);
    return ;
  }

  public static lastItem(arr:Array<any>):any
  {
    if(arr.length>0)
      return arr[arr.length-1];
    else
      return null;
  }




  public static getItemByProperty(arr:Array<any>, propertyName:string, value:any)
  {
    for(let i:number = 0; i< arr.length; i++)
    {
      if(arr[i][propertyName] == value)
        return arr[i];
    }

    return null;

  }


  public static  getUniqueValues(arr:Array<any>):Array<any>
  {
    if(arr == null)
      return null;

    let arrUnique:Array<any> = [];
    let j:number;
    let found:Boolean = false;

    for (let i:number = 0 ; i < arr.length; i++ )
    {
      found = false;
      for (j = 0 ; j < arrUnique.length; j++ )
      {
        if(arrUnique[j] == arr[i])
          found = true;
      }

      if(!found)
        arrUnique.push(arr[i]);
    }

    return arrUnique;

  }


  public static indexOf(arr:Array<any>, value:Object, subFieldName?:any, ignoreCase:boolean = false):number
  {
    if(arr == null || arr.length == 0)
      return -1;

    if(ignoreCase)
      value = (value as string).toLowerCase();

    for(let i:number = 0; i < arr.length; i++)
    {
      let iValue = subFieldName? arr[i][subFieldName]: arr[i];

      if(ignoreCase)
        try {
          iValue = iValue.toLowerCase();
        }
        catch(err){
          // do nothing
        }

      if(iValue == value)
        return i;
    }
    return -1;
  }

  public static contains(arr:Array<any>, value:Object, subFieldName?:any, ignoreCase:boolean = false):boolean
  {
    let i:number = ArrayUtils.indexOf(arr, value, subFieldName, ignoreCase);
    return i != -1;
  }


  public static collectionToArray(o:any):Array<Key>{
    let arr:Array<Key> = new Array<Key>();
    for(let each in o){
      arr.push(new Key(each, o[each]));
    }

    return arr;
  }
}
