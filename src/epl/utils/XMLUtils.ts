import {NodeType} from "./DOMUtils";

/**
 * Author: www.ericperron.com, 2018.
 */


interface ActiveXObject {
  new (s: string): any;
}

declare var ActiveXObject: ActiveXObject;


export class XMLUtils{


  public static getAttribute(node:Node, attributeName):string{

    let attributes:NamedNodeMap = node["attributes"] as NamedNodeMap;
    let att:Attr = attributes.getNamedItem(attributeName);

    if(att)
      return att.value;

    return null;
  }

  public static forEachChildElementNodes(node:Node, f:Function):void
  {
    for(let i = 0; i < node.childNodes.length; i++)
    {
      var childNode:any = node.childNodes[i];
      if(childNode.nodeType == NodeType.ELEMENT_NODE) {
         f(childNode, i);
      }
    }
  }

  public static async forEachChildElementNodesAsync(node:Node, f:Function):Promise<any>
  {
    for(let i = 0; i < node.childNodes.length; i++)
    {
      var childNode:any = node.childNodes[i];
      if(childNode.nodeType == NodeType.ELEMENT_NODE) {
        await f(childNode, i);
      }
    }
  }


  public static replaceTextNode(node:Node, html:string):void
  {
    let doc:XMLDocument = node.ownerDocument;
    let parent:Node = node.parentNode;

    // replace node
    let span:Node = doc.createElement("span");
    span["innerHTML"] = html;

    let beforeNode:Node = node;
    for(let j:number = span.childNodes.length - 1; j >= 0 ; j--)
    {
      let child:Node = span.childNodes[j];
      parent.insertBefore(child, beforeNode);
      beforeNode = child;
    }

    parent.removeChild(node);
  }

  public static parseXML(xmlStr:string):XMLDocument
  {

    let doc:XMLDocument;

    if (typeof DOMParser != "undefined")
    {
      doc = new DOMParser().parseFromString(xmlStr, "text/xml");
    }
    else if (typeof ActiveXObject != "undefined" && new ActiveXObject("Microsoft.XMLDOM")) {

        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        doc = xmlDoc;
    } else {
      throw new Error("No XML parser found");
    }

    return doc;

  }


}
