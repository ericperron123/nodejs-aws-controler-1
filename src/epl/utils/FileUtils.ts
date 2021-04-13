/**
 * Author: www.ericperron.com, 2018.
 */

export class FileUtils {


  public static downloadTextFile(text:string, fileName:string):void
  {
    this.downloadFile(new Blob([text]), fileName);
  }

  public static downloadFile(blob:Blob, fileName:string, options?:any):void{
    if(options == null)
      options = {type: 'text/plain'};

    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = fileName;

    // Append anchor to body.
    document.body.appendChild(a)
    a.click();

    // Remove anchor from body
    document.body.removeChild(a);
  }

  public static async fileToString(file:File, encoding:string = 'ISO-8859-1'):Promise<any>
  {
    let reader = new FileReader();

    return new Promise((resolve, reject)=>{
      reader.onload = (readerEvt:any)=> {
        let fileText = readerEvt.target.result;
        resolve(fileText);
      };
      reader.readAsText(file, encoding);
    });
  }


}
