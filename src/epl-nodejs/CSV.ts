
import * as csv from "csv-parser";
import * as fs from "fs";
import { Timer } from "../epl/Timer";
import { FsUtils } from "./utils/FsUtils";



export class CSV{



    // This doesn't seem to work well with big files
    public static async loadObjs(path: string): Promise<Array<any>> {

        let result: Array<string> = [];

        return new Promise((resolve, reject) => {

            fs.createReadStream(path)
                .pipe(csv())
                .on('data', (data: string) => {
                    result.push(data);
                })
                .on('end', () => {
                    return resolve(result);
                });

        });
    }


    public static async load(path: string, onRecord?:(record:Array<string>)=>any): Promise<Array<any>> {

        let t:Timer = new Timer(true);
        
        let records:Array<any> = [];

        await FsUtils.readLines(path, (str):void => {
           
            // if the record is empty, abort. 
            if (!str || str.length == 0)
                return;

            let record: Array<string> = [""];
            let iRecord: number = 0;
            let cell: string = "";

            var quoteFlag: boolean = false;

            for (var i: number = 0; i < str.length; i++) {
                var cc: string = str.charAt(i);
                if (cc == '"') {
                    // starting a new cell
                    if (!quoteFlag)
                        quoteFlag = true;

                    // escaped quote
                    else if (str.charAt(i + 1) == "\"") {
                        cell += cc;
                        i++;
                    }

                    // end of string
                    else {
                        quoteFlag = false;
                    }
                }
                else if (cc == ","){
                    if (quoteFlag)
                        cell += cc;
                    else {
                        record[iRecord] = cell;
                        iRecord++;
                        cell = "";
                    }
                } 
                else 
                  cell += cc;

                if(i == str.length - 1)
                {
                    record[iRecord] = cell;
                    iRecord++;
                    cell = "";
                }
            }

            if(onRecord == null)
                records.push(record);
            else {
                let o:any = onRecord(record);
                if(o != null)
                    records.push(o);
            }

        });


        return records;

    }

}