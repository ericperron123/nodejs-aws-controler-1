/**
 * Author: www.ericperron.com, 2018.
 */

/*
This format does a little more than the one accepted by java.util.Properties.# This file uses an extended version of the java.util.Properties file format.
#  1) Object as follow defined by
#      propertieName{
#        propName:bindAtt
#      }
#  2) Array<string> defined by []
#     propertyName[
#      stringOne
#      stringTwo
#     ]
#  3) comments "#" can by added at the end of a line.
#  4) Variables accepted: @variable:bindAtt
#  5) White spaces at the end of the lines are ignored.
#  6) these characters in a bindAtt must be escaped: { } \ #. ex: \{,\},\\,\#
* */

import {StringUtils} from "../utils/stringUtils/StringUtils";
import {Key} from "../Key";

export class PropertiesFile {

  public fileText:string;
  public root:Block;
  public data:any;

  public async read(text?:string):Promise<any>
  {
    if(text == null)
      text = this.fileText;

    if(StringUtils.isNullOrEmpty(text))
    {
      console.debug("EPL PropertiesFile: [Warning] The localeManager file is empty.")
      return;
    }

    // remove the cariage returns
    text = StringUtils.replace(text,"\r","\n");
    text = StringUtils.replace(text,"\n\n","\n");

    // escape all the characters that were escaped in the line
    text = this.escapeText(text);

    // convert text into an array of line.
    let lines:Array<string> = text.split("\n");

    // parse through the lines creating blocks of codes
    this.root = new Block();

    let block:Block = this.root;
    let tmpVars:any = {};
    for(let lineNumber:number = 0; lineNumber < lines.length; lineNumber++)
    {
      let line:string = lines[lineNumber];

      // ------------------------------
      // remove empty spaces before and after the line

      line = StringUtils.trim(line);

      // ------------------------------
      // remove the comments found in this line.
      line = this.removeLineComments(line);
      if(line == "")
        continue;

      // ------------------------------
      // A line can be continued to the next if it ends with "\"
      while (line.charAt(line.length-1) == "\\")
      {
        lineNumber+=1;
        let nextLine:string = lines[lineNumber];
        line = line.substring(0,line.length-1) + StringUtils.trim(nextLine);
      }

      // -------------------------------
      // if the line defines an import
      /*
      if(StringUtils.startsWith(line, "@import", false))
      {
        let importFilePath:string = StringUtils.trim(line.split(" ")[1]);
        let path:string = StringUtils.replace(this.filePath, "\\", "/");
        let iPath:number = this.filePath.lastIndexOf("/");
        if(iPath > -1)
          path = path.substring(0,iPath);
        console.debug("EPL PropertiesFile: " + path +"/" + importFilePath);
        let subPropertyFile:PropertiesFile = new PropertiesFile();
        await subPropertyFile.loadFile(path +"/" + importFilePath);
        if(subPropertyFile.root && subPropertyFile.root.firstChild())
        {
          block.blocks.push(subPropertyFile.root.firstChild());
        } else {
          console.debug("EPL PropertiesFile: Problem reading sub property file " + subPropertyFile.filePath);

        }
        continue;
      }
*/

      // -------------------------------
      // if the line defines a variable or an import
      if(line.charAt(0) == "@")
      {
        line = line.substring(1,line.length);
        let arrVar:Array<string> = StringUtils.splitAt(line, StringUtils.indexOfMany(line, [':','=']));
        let value:string = StringUtils.trim(arrVar[1]);
        tmpVars[arrVar[0]] = StringUtils.replaceVariables(value, tmpVars);
        continue;
      }

      // Get index of special characters
      let iMany = StringUtils.indexOfMany(line, [":","=","{","["]);

      // ------------------------------
      // Starts a block of code?
      let newBlock:Block;
      if(line.charAt(iMany) == "{")
      {
        newBlock = new Block();
        newBlock.type = "object";
        newBlock.propertyName = StringUtils.trim(line.substring(0,line.indexOf("{")));
      }
      else if(line.charAt(iMany) == "[")
      {
        newBlock = new Block();
        newBlock.type = "array";
        newBlock.propertyName = StringUtils.trim(line.substring(0,iMany));
      }

      if(newBlock)
      {
        if (block)
        {
          newBlock.parent = block;
          block.blocks.push(newBlock);
        }

        block = newBlock;
      }

      // ------------------------------
      // Ends a block of code?

      else if(line == "}" || line == "]")
      {
        block = block.parent;
      }


      // there is a named bindAtt;
      else if(block.type == "array")
      {
        line = this.unescapeText(line);
        block.variables.push(new Key(null, line));
      }
      else if(iMany != -1 && line.charAt(iMany) == "=" || line.charAt(iMany) == ":")
      {
        let propertyName: string = line.substring(0, iMany);
        let value: string = line.substring(iMany + 1, line.length);
        propertyName = StringUtils.trim(propertyName);
        value = StringUtils.trim(value);
        value = this.unescapeText(value);
        value = StringUtils.replaceVariables(value, tmpVars);
        block.variables.push(new Key(propertyName, value));
      }
    }

    return this.root.toObject();
  }

  private unescapeText(line:string):string
  {
    let keys:Array<Key> = [
      new Key("\\","<EPL-backslash-char />"),
      new Key("\n","<EPL-n-char />"),
      new Key("\t","<EPL-t-char />"),
      new Key("\r","<EPL-r-char />"),
      new Key("#","<EPL-pound-char />"),
      new Key("{","<EPL-openCurl-char />"),
      new Key("}","<EPL-closeCurl-char />")
    ];

    for(let k of keys)
      line = StringUtils.replace(line,k.value,k.label);

    return line;
  }


  private escapeText(line:string):string
  {
    let keys:Array<Key> = [
      new Key("\\\\","<EPL-backslash-char />"),
      new Key("\\n","<EPL-n-char />"),
      new Key("\\t","<EPL-t-char />"),
      new Key("\\r","<EPL-r-char />"),
      new Key("\\#","<EPL-pound-char />"),
      new Key("\\{","<EPL-openCurl-char />"),
      new Key("\\}","<EPL-closeCurl-char />")
    ];

    for(let k of keys)
      line = StringUtils.replace(line,k.label,k.value);

    return line;
  }


  private removeLineComments(line:string):string
  {
    // remove line comments
    if(line.charAt(0) == "!")
      return "";

    let iComment = line.indexOf("#");
    while (iComment != -1){
      line = line.substring(0,iComment);
      if(iComment+1 > line.length)
        iComment = -1;
      else
        iComment  = line.indexOf("#",iComment+1);
    }


    line = StringUtils.trim(line);

    return line;

  }

}

export class Block{

  public blocks:Array<Block> = [];
  public parent:Block;
  public propertyName:string;
  public variables:Array<Key> = [];
  public type:string ="object"; // or "array"

  public firstChild():Block
  {
    for(let each of this.blocks)
      return each;
  }

  public toObject():any{

    let o:any = {};
    if(this.type == "object")
    {
      for (let k of this.variables) {
        if(k.value == "" || k.value == null)  o[k.label] = k.value;
        else if(k.value.toLowerCase() == "true")  o[k.label] = true;
        else if(k.value.toLowerCase() == "false")  o[k.label] = false;
        else if(!isNaN(k.value)) o[k.label] = parseFloat(k.value);
        else o[k.label] = k.value;
      }
        
      for(let b of this.blocks)
        o[b.propertyName] = b.toObject();
    }
    else if(this.type == "array")
    {
      o = [];
      for (let k of this.variables)
        o.push(k.value);

    }

    return o;
  }

}

