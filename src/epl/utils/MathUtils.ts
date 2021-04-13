import { StringUtils } from "./stringUtils/StringUtils";

export class MathUtils {


     // [Eric Perron 2019-10-10] I tested this method and it will return within 1 or 2 ms even if the number reaches into the millions at base 62. 

    public static toBaseN(num:number, base:number = 62):string{

        if(base <= 1)
            throw "Base cannot be equal or smaller than 1";

        if(Math.round(base) != base)
           throw "Base must be an integer, it cannot be a float.";
        
        // if the output is abcde
        //  baseLogic is
        //  (a × n⁴) + (b × n³) + (c × n²) + (d × n¹) + (e × n⁰)

        let pow:number = Math.floor(this.nRoot(num, base));

        // get the maximum exponent 
        let tmpNum:number = num;
        let str:string = "";
        
        while(pow >= 0)
        {
            if(tmpNum == 0){
                str = str + "0";
            }
            else 
            {
                let digitUnit:number = Math.pow(base,pow);
                let digit:number = 0;

                digit = Math.floor(tmpNum/digitUnit);

                tmpNum -= (digit * digitUnit);
            
                // update the string
                str = str + MathUtils.getBaseChar(digit);
            }

            pow -=1;
        }
        
        if(str == "")
            return "0";

        return str;
    }

    private static getBaseChar(num:number): string 
    {
        if (num < 0)
            throw "The number cannot be negative!"

        if(num > 62)
            throw "base cannot exceed 62";
        
        // 0 to 9 are as is.  (ASCII 48 to 57)
        if(num<10)
            return String(num);

        // 10 to 36 = a to z  (ASCII 97 to 122)
        if(num < 36 ) 
            return String.fromCharCode(97 + num - 10);
                
        // 37 to 63 = A to Z  (ASCII 65 to 90)
        if(num >= 36 ) 
            return String.fromCharCode(65 + num - 36);
    }

    public static nRoot(num:number, base:number):number{
        
        return Math.log10(num)/Math.log10(base);

    }

}

