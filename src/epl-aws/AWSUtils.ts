import { StringUtils } from "../epl/utils/stringUtils/StringUtils";

export class AWSUtils {

    public static tagsToString(tags:Array<any>):string{

        if(tags == null || tags.length == 0) 
            return "";

        let str:string = "";

        for(let i:number = 0; i < tags.length; i++){
            if(i != 0) str += ","
            str += StringUtils.Format("[{0}:{1}]", [tags[i].Key, tags[i].Value]);    
        }

        return str;
    }




}