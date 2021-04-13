/*
___________________________________
-----------------------------------
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
   COPYRIGHT
   ©2019 Eric Perron

   #################
   ##       ##    ##
   ####     ########
   ##       ##
   ######## ##

   This code is the property of its developer, Eric Perron. You are not allowed to use this code without a licence.
   please visit www.ericperron.com and contact Mr. Perron to obtain a licence.
___________________________________
-----------------------------------
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
*/



import {Validation} from "./Validation";
import {StringUtils} from "../utils/stringUtils/StringUtils";

export class ValidatePassword{

  public static test(password:string):Validation<any>
  {

    let validation:Validation<any> = new Validation();

    // --------------------------
    if(StringUtils.isNullOrEmpty(password))
    {
      validation.addError("eps.validation.password.nullOrEmpty",null,"VP001");
      return validation;
    }

    // -----------------------------
    // verify minimum length

    if(password.length < 4)
    {

      validation.addError("eps.validation.password.min",null,"VP002");
      return validation;
    }

    // -----------------------------
    // verify maximum length

    if(password.length > 16)
    {

      validation.addError("eps.validation.password.max",null,"VP003");
      return validation;
    }


    // -----------------------------
    // verify suggested length

    if(password.length < 8)
    {

      validation.addWarning("eps.validation.password.warnMax", null,"VP004");

    }


    // -----------------------------
    // check for numbers

    let regex:RegExp = /[0-9]/;
    if(!regex.test(password))
    {
      validation.addWarning("eps.validation.password.warnNumber", "VP005");

    }


    // -----------------------------
    // look for capital letters
    regex = /[A-Z]/;
    if(!regex.test(password))
    {
      validation.addWarning("eps.validation.password.warnCap","VP006");

    }

    // ------------------------------
    // Look for special characters

    let specialChars:string = " !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
    let arr:Array<string> = StringUtils.toArray(specialChars);
    let i:number = StringUtils.indexOfMany(password, arr);
    if( i == -1)
      validation.addWarning("eps.validation.password.warnSpecialChar","VP007", arr.toString());

    return validation;
  }

}

