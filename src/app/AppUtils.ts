import * as table from "text-table";
import { ArrayUtils } from "../epl/utils/ArrayUtils";
import { Utils } from "../epl/utils/Utils";

export class AppUtils {

    public static objToTableString(o: any, arr?: Array<string>) {


        let arrOut: Array<Array<string>> = [];

        if (!arr) {
            if (o instanceof Array)
                if (o[0])
                    return this.objToTableString(o, Utils.getProperties(o[0]))
                else
                    return "";

            arrOut.push(["Name", "Value"]);
            arrOut.push(["----", "-----"]);

            for (let each in o)
                arrOut.push([each, "" + o[each]]);
        }
        else {

            // create the header 
            let header: Array<string> = [];
            let headerLine: Array<string> = [];

            for (let i: number = 0; i < arr.length; i++) {

                header[i] = arr[i];

                headerLine[i] = "";
                for (let a: number = 0; a < arr[i].length; a++)
                    headerLine[i] += "-";
            }

            arrOut.push(header);
            arrOut.push(headerLine);

            ArrayUtils.forEach(o, (item: any) => {
                let line: Array<string> = [];
                for (let i: number = 0; i < arr.length; i++) {
                    line.push(item[arr[i]]);
                }
                arrOut.push(line);
            });
        }


        return table(arrOut);
    }

}