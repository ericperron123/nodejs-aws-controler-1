/**
 * Author: www.ericperron.com, 2018.
 */

export class StringSearch {


  constructor(content:string, contentBeginsWith:string, contentEndsWith:string = "", caseSensitive:Boolean = false)
  {
    this.content = content;
    this.contentBeginsWith = contentBeginsWith;
    this.contentEndsWith = contentEndsWith;
    this.caseSensitive = caseSensitive;
  }


// **************************************
  // PUBLIC GETS AND SETS
  // **************************************

  public get index():number
  {
    return this._index;
  }

  public get indexEnd():number
  {
    return this._indexEnd;
  }

  public get indexInnerStart():number
  {
    return this._indexInnerStart;
  }

  public get indexInnerEnd():number
  {
    return this._indexInnerEnd;
  }

  public get result():string
  {
    return this._result;
  }

  public get innerResult():string
  {
    return this._innerResult;
  }

  // **************************************
  // PUBLIC PROPERTIES
  // **************************************

  public  content:string
  public  contentBeginsWith:string = "";
  public  contentEndsWith:string = ""
  public  caseSensitive:Boolean = false;


  // **************************************
  // PRIVATE METHODS
  // **************************************

  public searchNext()
  {
    if(this.index+1 >= this.content.length)
      return -1;
    else
      return this.search(this.index+1);

  }

  public search(indexOffset:number = 0):number
  {

    this._resetResults();

    // makes sure there is something in this string;
    if(this.content ==  null || this.content == "")
      return -1;

    let clc:string = this.content.toLowerCase();

    if(!this.caseSensitive)
      this._index = clc.indexOf(this.contentBeginsWith.toLowerCase(), indexOffset);
    else
      this._index = this.content.indexOf(this.contentBeginsWith, indexOffset);

    if(this._index == -1)
      return -1;

    this._indexInnerStart = this._index + this.contentBeginsWith.length;

    if(this.contentEndsWith == ""){
      this._indexInnerStart = -1;
      this._indexEnd = this._indexInnerStart;
      return this._index;
    }

    if(!this.caseSensitive)
      this._indexInnerEnd = clc.indexOf(this.contentEndsWith.toLowerCase(), this._indexInnerStart);
    else
      this._indexInnerEnd = this.content.indexOf(this.contentEndsWith, this._indexInnerStart);

    if(this._indexInnerEnd == -1)
    {
      this._indexInnerStart = -1;
      this._indexEnd = this._indexInnerStart;
      return this._index;
    }

    this._innerResult = this.content.substring(this._indexInnerStart, this._indexInnerEnd);
    this._indexEnd = this._indexInnerEnd+this.contentEndsWith.length;
    this._result = this.content.substring(this._index, this._indexEnd);

    return this.index;
  }

  // **************************************
  // PRIVATE PROPERTIES
  // **************************************

  private  _index:number;
  private  _indexOffset:number;
  private  _indexEnd:number;
  private  _indexInnerStart:number;
  private  _indexInnerEnd:number;

  private  _result:string;
  private  _innerResult:string;

  // **************************************
  // PRIVATE METHODS
  // **************************************

  private _resetResults():void
  {

    this._index= -1;
    this._indexEnd = -1
    this._indexInnerStart = -1;
    this._indexInnerEnd = -1;

    this._result = "";
    this._innerResult = "";

  }

  // **************************************
  // CONSTRUCTOR
  // **************************************




}
