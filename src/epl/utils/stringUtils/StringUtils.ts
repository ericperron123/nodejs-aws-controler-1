/**
 * Author: www.ericperron.com, 2018.
 */

import {StringSearch} from "./StringSearch";
import {ArrayUtils} from "../ArrayUtils";
import {Utils} from "../Utils";
import { MathUtils } from "../MathUtils";


export class StringUtils {


  constructor() {}

  public static forEach(str:string, f:(char:string, i:number)=>void):void
  {
    for(let i:number = 0; i < str.length; i++)
      f(str.charAt(i), i);
    
  }


  public static toArray(str):Array<string>
  {
    let arr:Array<string> = new Array<string>();

    for(let i:number = 0; i < str.length; i++)
      arr.push(str.substr(i,1));

    return arr;

  }

  public static clip(str:string, length:number, threePoints:boolean = false)
  {
    if(str == null)
      return;
      
    if(str.length > length)
    {
      if(threePoints)
        length -= 3;
      str = str.substring(0, length);
      if(threePoints)
        str+="..."
    }

    return str;
  }

  public static toTitleCase(str:string):string{
    let flag:boolean = false;
    let out:string = "";

    for(let i = 0; i < str.length; i++){
      let c:string = str[i];

      if(flag || i == 0)
        c = c.toUpperCase();
      else
        c = c.toLowerCase();

      out += c;
      flag = (c == " ");

    }

    return out;
  }

  public static toSentenceCase(str:string):string{

    let out:string = "";
    let flag:boolean = true;

    for(let i = 0; i < str.length; i++){
      let c:string = str[i];

      c = flag? c.toUpperCase(): c = c.toLowerCase();

      if(c != " ") flag = false;
      if(c == ".") flag = true;

      out += c;

    }

    return out;
  }


  public static startsWith(str:string, subString:string, caseSensitive:boolean = true):boolean
  {
    if(str == null || subString == null)
      return false;

   if(caseSensitive)
     return  str.indexOf(subString) == 0;

    return str.toLowerCase().indexOf(subString.toLowerCase()) == 0;

  }

  public static endsWith(str:string, subString:string, caseSensitive:boolean = true):boolean
  {
    if(str == null || subString == null)
      return false;

    let i:number = str.length - subString.length;

    if(i < 0)
      return false;

    if(caseSensitive)
      return  str.lastIndexOf(subString) == i;

    return str.toLowerCase().lastIndexOf(subString.toLowerCase()) == i;

  }

  public static obfuscate(str:string, reverse:boolean = false, extendedChars:boolean = false)
  {
    /*
     this method can be useful to hide text in the javascript code that you don't want someone to
     be able to find by simply searching the source code.

     This method is not an encryption function in the sence that it should never be used for security
     measures. The reason for this is obvious, the key is right inline!!
    */

    let codes:Array<number> = [48,98,65,83,121,46,101,114,119,88,106,42,37,58,107,122,38,70,59,92,43,50,125,110,80,67,124,91,73,77,111,127,89,34,120,63,90,82,96,126,109,112,118,36,44,97,84,87,115,102,105,116,41,32,47,62,54,99,104,33,53,79,69,51,45,117,61,94,95,85,72,113,78,40,75,108,39,52,35,123,100,68,55,56,81,74,49,71,86,93,76,60,66,57,64,103];
    let codeExt:Array<number> = [197,148,45,143,150,168,121,85,149,116,255,127,144,92,195,59,125,252,60,193,179,134,91,93,76,219,100,215,50,202,94,151,162,48,246,177,175,126,139,114,241,63,83,110,136,49,210,205,79,42,172,35,109,70,201,236,122,111,234,224,187,181,137,176,159,212,77,206,138,105,160,64,178,170,104,115,192,117,145,86,142,166,120,101,82,38,222,61,155,199,58,214,174,130,229,66,98,68,211,107,141,54,203,247,129,132,223,188,171,228,158,74,218,189,227,99,221,239,220,108,80,51,46,102,180,52,88,78,184,208,216,209,191,89,163,207,198,36,97,186,173,250,230,55,251,34,242,237,135,217,39,167,183,200,106,243,133,226,165,123,235,62,154,249,153,118,190,213,161,71,75,65,128,124,140,47,185,119,37,231,182,238,225,204,146,72,33,244,69,248,157,156,103,112,254,84,245,95,152,131,96,81,67,90,169,44,113,164,53,73,194,87,32,196,233,41,56,240,147,40,253,232,57,43];
    let out:string = "";

    if(extendedChars)
      codes = codeExt;

    if(!reverse)
    {
      for(let char of str) {
        let code:number = char.charCodeAt(0)-32;
        out += String.fromCharCode(codes[code]);
      }
      return out;
    }
    else
    {
      for(let char of str)
      {
       let i:number = codes.indexOf(char.charCodeAt(0));
       out += String.fromCharCode(i+32);
      }

      return out;
    }
  }


  private static uniqueCtr:number = 0;
  
  
  // [Eric Perron 2019-10-10] I tested this method and it will return a 1000 random string in 1 or 2 ms even if it must be a unique string.

  public static randomString(length:number, unique:boolean = false):string
  {


    let str:string = "";

    for(let i:number = 0; i < length; i++)
    {
      let g:number = Math.round(Math.random()*2)
      let c:number;

      // 48 to 57 [0 to 9]
      if(g == 0) c = Math.round(Math.random()*(57-48))+48

      // 65 to 90 [A to Z]
      if(g == 1) c = Math.round(Math.random()*(90-65))+65

      // 97 to 122 [a to z]
      if(g == 2) c = Math.round(Math.random()*(122-97))+97

      str += String.fromCharCode(c);

    }

    if(unique)
    {
    
      this.uniqueCtr++; 
      let uStr:string = MathUtils.toBaseN(this.uniqueCtr, 62);

      if(uStr.length >= str.length)
        str = uStr;
      else 
        str = str.substr(0,str.length - uStr.length) + uStr;
    }

    return str;
  }

  /*
    variables within a string can be reset
    "hello Mr.{0} {1}" can become "hello Mr.{3} {4}". 

    This is useful for building sql strings using predefined searches. 
  */ 

  public static startCtrVariablesAt(str: string, startAt: number): string {

    var ctr:number = startAt - 1;

    return this.parse(new StringSearch(str, "{","}"),true,(s:StringSearch)=>{
      let n:number = Number.parseInt(s.innerResult, 10);
      if(!isNaN(n)){
        ctr++;
        return ctr;
      }
      else 
        return s;
    });

  }


  public static Format(str:string, values:Array<any>):string
  {
    for(let i:number = 0; i < values.length; i++)
      str = StringUtils.replace(str, "{"+i+"}", values[i]);

    return str;
  }

  public static splitAt(str:string, index:number):Array<string>
  {

    // example: splitAt("helloWorld", 4) will return ["hello","World"];

    let arr:Array<string> = [];
    arr[0] = str.substring(0,index);
    arr[1] = str.substring(index+1,str.length + 1);

    return arr;
  }

  public static indexOfMany(text:string, arr:Array<string>):number
  {
    let min:number = -1;

    for(let v of arr)
    {
      let i:number = text.indexOf(v);
      if(min == -1) min = i;

      if(i < min && i != -1)
      {
        min = i;
      }
    }

    return min;
  }

  public static  isPostalCode(str:string):Boolean
  {
    str = StringUtils.replace(str, " ","");
    return StringUtils.validateMask(str, "A#A#A#");
  }

  public static  charIsAnumber(char:string):Boolean
  {
    if(char.charCodeAt(0) >=48 && char.charCodeAt(0) <=57)
      return true;
    else
      return false;
  }

  public static charIsALetter(char:string):Boolean
  {
    // a to z
    if(char.charCodeAt(0) >=97 && char.charCodeAt(0) <=122)
      return true;

    // A to Z
    if(char.charCodeAt(0) >=65 && char.charCodeAt(0) <=90)
      return true;

    return false;
  }

  public static  validateMask(str:string, mask:string):Boolean
  {
    if(str.length != mask.length)
      return false;

    // A = Letter
    // # = number
    // exeample Masks: A#A#A#, (###) ###-####

    for(let i:number = 0; i < mask.length; i++)
    {
      let cMask:string = mask.charAt(i).toLowerCase();
      let cStr:string = str.charAt(i);

      // not enough characters!
      if(cStr == null)
      {

        return false;
      }

      if(cMask == "a")
      {
        if( !StringUtils.charIsALetter(cStr) )
          return false;
      }
      else if(cMask == "#")
      {
        if(!StringUtils.charIsAnumber(cStr) )
          return false;
      }
      else if(cMask != cStr)
      {
        return false;
      }

    }

    return true;
  }


  public static applyMask(str:string, mask:string):string
  {
    let output:string = "";
    let iStr:number = 0;

    for(let i:number = 0; i < mask.length; i++)
    {
      let c:string = mask.charAt(i).toLowerCase();
      if(c == "a" || c == "#")
      {
        output += str.charAt(iStr);
        iStr ++;
      }
      else
        output += c;
    }

    return output;
  }

  public static  toBool(str:string):boolean
  {

    if(str == null)
      return false;

    if(typeof str == "boolean")
      return str as boolean;
    
    if(typeof str != "string")
      return false;
    
    str = str.toLowerCase();

    if(ArrayUtils.indexOf(['1','true','t','on','yes','y','oui'],str)!= -1)
      return true;
    else
      return false;
  }



  public static  getValue(str:string):any
  {
    str = str.toLowerCase();
    if(str == "false") return false;
    if(str == "true")  return true;

    let num:number = parseFloat(str);
    if(!isNaN(num))	return num;

    let i:number = parseInt(str);
    if(!isNaN(i)) return i;

    return str;
  }


// Removes all spaces and sets the string to lower case.
// then sends the index of str2 in str1.

  public static  simplifyIndexOf(str1:string, str2:string):number
  {
    str1 = StringUtils.simplify(str1);
    str2 = StringUtils.simplify(str2);
    return str1.indexOf(str2);
  }

// Removes all spaces and sets the string to lower case.
// then verifies if both are the same.

  public static  simplifyIsEqual(str1:string, str2:string):Boolean
  {
    return (StringUtils.simplify(str1) == StringUtils.simplify(str2));
  }

  public static  isNullOrEmpty(str:string):Boolean
  {
    return (str == null || str.length == 0 || str == "" || str == undefined);
  }

  public static spacePadding(str:string, length:number, left:Boolean = false, spaceChar:string = " "):string
  {
    if(str.length > length)
      return str;

    let spaces:string = "";

    for(let i:number = str.length; i < length; i++)
      spaces += spaceChar;

    if(left)
      return spaces + str;
    else
      return str + spaces;
  }

  public static spaceOffset(str:string, length:number, left:Boolean = true, spaceChar:string = " "):string
  {
    let spaces:string = "";

    for(let i:number = 0; i < length; i++)
      spaces += spaceChar;

    if(left)
      return spaces + str;
    else
      return str + spaces;
  }


// Removes all spaces and sets the string to lower case.
  public static  simplify(str:string):string
  {
    if (str == null || str == "")
      return str;

    str = StringUtils.replace(str, " ", "", false, true);
    str = str.toLowerCase();

    return str;
  }

  public static  removeExtraSpaces(str:string, leadingSpaces:Boolean = true, endingSpaces:Boolean=true, doubleSpaces:Boolean = false):string
  {

    let i:number = 0;
    let flag:Boolean = false;

    if(endingSpaces)
    {

      do
      {
        flag = (" \n\r\t".indexOf(str.charAt(i)) != -1);
        if(flag) i++;
      }
      while(flag && i < str.length - 1);

      str = str.substring(i, str.length);
    }

    if(leadingSpaces)
    {
      i = str.length - 1;

      do
      {
        flag = (" \n\r\t".indexOf(str.charAt(i)) != -1);
        if(flag) i--;
      }
      while(flag && i > 0);

      str = str.substring(0, i + 1);
    }

    if(doubleSpaces)
      str = StringUtils.replace(str, "  ", " ", false, true);

    return str;
  }


  public static  replaceVariables(str:string, variables:Object, caseSensitive:Boolean = false):string
  {
    for(let each in variables)
      str = StringUtils.replace(str, "{" + each + "}", variables[each], caseSensitive);

    return str;
  }

  public static removeFrenchChars(str:string):string{

    let frenchCharsA:Array<string> = ['À','Â','Ä','È','É','Ê','Ë','Î','Ï','Ô','Œ', 'Ù','Û','Ü','Ÿ','à','â','ä','è','é','ê','ë','î','ï','ô','œ', 'ù','û','ü','ÿ','Ç','ç','«','»','€'];
    let frenchCharsB:Array<string> = ['A','A','A','E','E','E','E','I','I','O','OE','U','U','U','Y','a','a','a','e','e','e','e','i','i','o','oe','u','u','u','y','C','c','"','"','euro'];

    frenchCharsA.forEach((char, index)=>{
      str = StringUtils.replace(str, char, frenchCharsB[index],true, true);
    });

    return str;

  }

  public static indexOf(str:string, find:string, position:number = 0, caseSensitivte:boolean = false, ignoreFrenchChars:boolean = false):number
  {
    if(StringUtils.isNullOrEmpty(str) || StringUtils.isNullOrEmpty(find))
      return -1;

    if(!caseSensitivte) {
      str = str.toLowerCase();
      find = find.toLowerCase();
    }

    if(ignoreFrenchChars){
      str = StringUtils.removeFrenchChars(str);
      find = StringUtils.removeFrenchChars(find);
    }

   return str.indexOf(find);

  }

  public static toOneLine(str:string, divider:string = "|"){

     str = StringUtils.replace(str, "\r", "\n");
    str = StringUtils.replace(str, "\n\n", "|");
    str = StringUtils.replace(str, "\n", "|");
    str = StringUtils.trim(str);
    str = StringUtils.removeExtraSpaces(str);

    return str;
  }

  public static replace(str:string, find:string|Array<string>, replaceWith:string, caseSensitive:Boolean = false, recursive:Boolean = false):string
  {
    if(Utils.typeof(find) == "array")
    {
      let arr:Array<string> = find as Array<string>;
      for(let i:number = 0; i < arr.length; i++)
        str = StringUtils.replace(str, arr[i], replaceWith, caseSensitive, recursive);

      return str;
    }

    if(typeof(str) != "string")
      return str;

    if(str == null || str == "")
      return str;

    if(find == replaceWith || str == null)
      return str;

    let strOut:string = "";

    let s:StringSearch = new StringSearch(str, find as string, "", caseSensitive);
    let i:number=0;
    let i2:number = 0;

    do
    {
      i2 = s.search(i);
      if(i2 != -1)
      {

        strOut += str.substring(i, i2)+replaceWith;

        i = i2+find.length;

      }
      else
      {
        strOut += str.substring(i, str.length);
        i = -1;
      }

    }
    while(i != -1);

    if(recursive && strOut.indexOf(find as string) != -1){
      strOut = StringUtils.replace(strOut, find, replaceWith, caseSensitive, recursive);
    }
    return strOut;
  }


  public static  textFileToLines(str:string):Array<string>
  {
    return StringUtils.splitWithMultipleDelimeter(str, ["\r\n", "\r", "\n"]);
  }

  public static allIndexesOf(str:string, searchString:string):Array<number>{

    let i:number = 0;
    let arr:Array<number> = [];

    do
    {
      i = str.indexOf(searchString, i);
      if (i != -1)
      {
        arr.push(i);
        i += searchString.length;
      }
    } while (i != -1 && i < str.length - 1);

    return arr;
  }





  public static  parse(search:StringSearch, innerResultOnly:Boolean, f:Function):string
  {
    if(!search.content || search.content == "")
      return "";

    let i:number = 0;
    let i2:number = -1;
    let strOut:string = "";

    do
    {
      i2 = search.search(i);

      if(i2 != -1)
      {

        if(innerResultOnly)
        {
          strOut += search.content.substring(i, search.indexInnerStart) + f(search);
          i = search.indexInnerEnd;

        }
        else
        {
          strOut += search.content.substring(i, i2) + f(search);
          i = search.indexEnd;
        }


      }
      else
      {
        strOut += search.content.substring(i, search.content.length);
        i = -1;
      }
    }
    while(i != -1);


    return strOut;
  }

  public static  split(str:string, delimeter:string, caseSensitive:Boolean = false):Array<string>
  {

    let arr:Array<string> = [];
    let tmp_str:string = str;
    let tmp_delimeter:string = delimeter;

    if(!caseSensitive)
    {
      if(tmp_str)
        tmp_str = tmp_str.toLowerCase();
      if(tmp_delimeter)
        tmp_delimeter = tmp_delimeter.toLowerCase();
    }

    let i:number = 0;
    let i2:number = tmp_str.indexOf(tmp_delimeter);

    if(i2 == -1)
      return [str];

    do
    {
      arr.push(str.substring(i, i2));
      i = i2 + tmp_delimeter.length;
      i2 = tmp_str.indexOf(tmp_delimeter, i2 + tmp_delimeter.length);
    }
    while(i2 != -1);

    arr.push(str.substring(i, tmp_str.length));

    return arr;

  }

  public static  spitStrings(arrStr:Array<string>, delimeter:string,  caseSensitive:Boolean = false):Array<string>
  {

    let outArr:Array<string> = [];
    let tmpArr:Array<string>;

    for (let i:number = 0; i < arrStr.length; i++)
    {
      tmpArr = StringUtils.split(arrStr[i], delimeter, caseSensitive);

      for (let j:number = 0; j < tmpArr.length; j++ )
      {
        outArr.push(tmpArr[j]);
      }
    }

    return outArr;
  }

  public static  splitWithMultipleDelimeter(str:string, delimeters:Array<string>, caseSensitive:Boolean = false):Array<string>
  {

    let arrOut:Array<string> = [str];

    for (let i:number = 0; i < delimeters.length; i++ )
    {
      arrOut =  StringUtils.spitStrings(arrOut, delimeters[i], caseSensitive);
    }

    return arrOut;
  }

  public static trim(input:string):string
  {
    if (input == null || input.length == 0)
      return input;

    let rtrim:RegExp = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    return input.replace(rtrim, '');

  }

  public static insert(str:string, insertStr:string, index:number, before:boolean = true){

    if(!before && index != str.length)
      index++;

    str = str.substr(0,index) + insertStr + str.substring(index,str.length);

    return str;
  }


}
