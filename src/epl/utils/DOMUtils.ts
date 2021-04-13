/**
 * Author: www.ericperron.com, 2018.
 */

import {StringUtils} from "./stringUtils/StringUtils";
import {List} from "../List";

export class NodeType {

  public static readonly ELEMENT_NODE:number   =  1;
  public static readonly ATTRIBUTE_NODE:number  =  2;
  public static readonly TEXT_NODE:number  =  3;
  public static readonly CDATA_SECTION_NODE:number  =  4;
  public static readonly ENTITY_REFERENCE_NODE:number  =  5;
  public static readonly ENTITY_NODE:number  =  6;
  public static readonly PROCESSING_INSTRUCTION_NODE:number  =  7;
  public static readonly COMMENT_NODE:number  =  8;
  public static readonly DOCUMENT_NODE:number  =  9;
  public static readonly DOCUMENT_TYPE_NODE:number  =  10;
  public static readonly DOCUMENT_FRAGMENT_NODE:number  =  11;
  public static readonly NOTATION_NODE:number  =  12;

}


export class DOMUtils {

  public static scrollToTop():void{
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  public static appendHTML(element:HTMLElement, html:string):HTMLElement
  {
    if(element == null)
    {
      console.debug("EPL DOMUtils: Cannot add html to null element: "+ html);
      return null;
    }

    let div:HTMLElement = document.createElement("div");
    div.innerHTML = html;

    let returnElement:HTMLElement =  div.children[0] as HTMLElement;

    for(let i:number =0; i < div.children.length; i++)
      element.appendChild(div.children[i]);

    return returnElement;
  }

  public static getChildNodes(node:Node):Array<Node>
  {
    let children:Array<Node> = [];

    for(let i:number = 0; i < node.childNodes.length; i++)
    {
      let iNode = node.childNodes[i];
      if(iNode.nodeType == NodeType.ELEMENT_NODE)
        children.push(iNode)
    }

    return children;
  }

  public static getNodesByName(node:Node, name:string):Array<Node>
  {
    let nodes:Array<Node> = [];

    for(let i:number = 0; i < node.childNodes.length; i++)
    {
      let iNode = node.childNodes[i];
      if(iNode.nodeType == NodeType.ELEMENT_NODE && iNode.nodeName == name)
        nodes.push(iNode)
    }

    return nodes;
  }


  public static firstChildNode(node:XMLDocument):Node
  {
    for(let i:number = 0; i < node.childNodes.length; i++)
    {
      let iNode = node.childNodes[i];
      if(iNode.nodeType == NodeType.ELEMENT_NODE)
        return iNode;
    }

    return null;
  }




  public static getNodeByName(node:Node, name:string, recursive:boolean = false):Node
  {

    for(let i:number = 0; i < node.childNodes.length; i++)
    {
      let iNode = node.childNodes[i];
      if(iNode.nodeType == NodeType.ELEMENT_NODE)
        if(iNode.nodeName == name)
        {
          return iNode;
        } else
        {
          if(recursive && iNode.childNodes.length > 0)
          {
            let rNode:Node = DOMUtils.getNodeByName(iNode, name, recursive);
            if(rNode != null)
              return rNode;
          }
        }
    }

    return null;
  }

  public static getList(node:Node, nodeName:string, f:Function, list?:List<any>):List<any>
  {
    if(list == null)
      list = new List<any>();
    else
      list.removeAll();

    // load the errors

    let listElement:Node = DOMUtils.getNodeByName(node, nodeName);
    let childNodes = DOMUtils.getChildNodes(listElement);

    for(let i:number = 0; i < childNodes.length; i++)
    {
      let iNode:Node = childNodes[i];
      list.addItem(f(iNode, i));
    }

    return list;
  }


  public static getText(node:Node, nodeName?:string):string
  {
    let resultNode:Node = nodeName?DOMUtils.getNodeByName(node, nodeName):node;

    if(resultNode == null)
      return null;

    return resultNode.firstChild.nodeValue;
  }

  public static getBool(node:Node, nodeName:string):boolean
  {
    let resultNode:Node = nodeName?DOMUtils.getNodeByName(node, nodeName):node;
    if(resultNode == null)
      return null;

    return StringUtils.toBool(resultNode.firstChild.nodeValue);
  }

  public static getInt(node:Node, nodeName:string):number
  {
    let resultNode:Node = nodeName?DOMUtils.getNodeByName(node, nodeName):node;
    if(resultNode == null)
      return null;

    return parseInt(resultNode.firstChild.nodeValue);
  }


  public static getFloat(node:Node, nodeName:string):number
  {
    let resultNode:Node = nodeName?DOMUtils.getNodeByName(node, nodeName):node;
    if(resultNode == null)
      return null;

    return parseFloat(resultNode.firstChild.nodeValue);
  }

  public static XmlStringToObj(XmlString:string):any
  {
    let dp:DOMParser = new DOMParser();
    let doc:XMLDocument = dp.parseFromString(XmlString,'text/xml');

    let node:Node = DOMUtils.firstChildNode(doc);
    let bodyNode:Node = DOMUtils.getNodeByName(node,"s:Body", true);
    let obj = DOMUtils.nodeToObj(bodyNode);

    return obj;
  }

  public static nodeToObj(node:Node):any
  {
    let obj:any = {};

      if(node['attributes'])
      {
          let att:any = node['attributes'];
          for (let i:number = 0; i < att.length; i++)
          {
              let attr:Attr = att.item(i);

              // ignore namespace attributes
              if(attr.name.indexOf("xmlns:") != -1) continue;

              if(obj.attributes == null)
                  obj.attributes = {};
              obj.attributes[attr.name] = attr.value;

          }
      }


    let strValue:string = "";
    let elementNodeCount:number = 0;

    for(let i:number = 0; i < node.childNodes.length; i++)
    {
      let iNode:Node = node.childNodes[i];

      if(iNode.nodeType == NodeType.ELEMENT_NODE)
      {
        elementNodeCount++;
        let propName = iNode.nodeName;
        if(propName.indexOf(":")!=-1)
          propName = propName.split(":")[1];

        if(obj[propName] == null)
        {
          obj[propName] = DOMUtils.nodeToObj(iNode);
        }
        else if(Object.prototype.toString.call( obj[propName] ) === '[object Array]' )
        {
          obj[propName].push(DOMUtils.nodeToObj(iNode));
        }
        else
        {
          let tmp:any = obj[propName];
          obj[propName] = [];
          obj[propName].push(tmp);
          obj[propName].push(DOMUtils.nodeToObj(iNode));
        }
      } else
        strValue += iNode.nodeValue;
    }

    if(elementNodeCount == 0)
    {
      if(obj.attributes == null) obj = strValue;
      else if(strValue != "") obj.text = strValue;
    }

    return obj;
  }



}
