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
import {StringSearch} from "../utils/stringUtils/StringSearch";


/*
	Author: www.ericperron.com 29 Nov 2018.

	Comments:

	This is an advanced email checker that is meant to provide meaningful
	error messages.

	I have used information available on wiki pages: https://en.wikipedia.org/wiki/Email_address

	Please note that though the following could be allowed, this
	validator does not accept them:
		- (comments) in the domain or localPart
		- [IP] address in the domain.
			Exemple: jsmith@[192.168.2.1]
		- no need for a domain extension.


	Here are some sample valid and invalid emails:

		var validEmails = [
			"\"much.more unusual\"@example.com",
			"x@example.com",
			"prettyandsimple@example.com",
			"very.common@example.com",
			"disposable.style.email.with+symbol@example.com",
			"other.email-with-dash@example.com",
			"\"very.unusual.@.unusual.com\"@example.com",
			"\"very.(),:;<>[]\\\".VERY.\\\"very@\\\\ \\\"very\\\".unusual\"@strange.example.com",
			"example-indeed@strange-example.com",
			"#!$%&'*+-/=?^_`{}|~@example.org",
			"example@s.solutions"
		]

		var invalidEmails = [
			"Abc.example.com",
			"A@b@c@example.com",
			"a\"b(c)d,e:f;g<h>i[j\k]l@example.com",
			"just\"not\"right@example.com",
			"this is\"not\\allowed@example.com",
			"this\\ still\\\"not\\\\allowed@example.com",
			"1234567890123456789012345678901234567890123456789012345678901234+x@example.com",
			"john..doe@example.com",
			"john. doe@example.com",
			"john.doe@example. com",
			"john.doe@example..com",
			"john.doe@example"
		]



*/

export class ValidateEmail
{

  public static test(str:string):Validation<any>
  {

    let v:Validation<any> = new Validation();

    let iAtSign:number = str.lastIndexOf("@");

    if(iAtSign == -1)
    {
      v.addError("eps.validation.email.atCharIsMissing", null, "EV001"); // @ character is missing.
      return v;
    }

    if(iAtSign == 0)
    {
      v.addError("eps.validation.email.noLocalPart",null,"EV002"); // There is no local part. Address starts with a @.
      return v;
    }

    // --------------------------
    // Local part
    let localPart:string = str.substring(0, iAtSign); // start, end
    let lv:Validation<any> = this.validateLocalPart(localPart);
    if(!lv.valid)
      return lv;

    // --------------------------
    // domain

    let domain:string = str.substring(iAtSign + 1, str.length); // start, end

    let dv:Validation<any> = this.validateDomain(domain);
    if(!dv.valid)
      return dv;

    return v;
  }










  private static  validateSubLocalPart(str:string)
  {

    let v:Validation<any> = new Validation();

    // Check to see if it starts and end with a quote;
    let i:number = str.indexOf("\"");
    if(i != -1)
    {
      let firstChar:string = str[0];
      let lastChar:string = str[str.length - 1];

      if(firstChar != '\\' || lastChar != '\\')
      {
        v.addError("eps.validation.email.quotesInWrongPlace",null,"EV003");
        return v;
      }
      else
        return this.validateSubLocalPartWithQuotes(str);
    }

    let rgx:RegExp = /^[0-9a-zA-Z.!#$%&'*+\-\/=?^_`{|}~]+$/;
    if (!rgx.test(str))
    {
      v.addError("eps.validation.email.illegalLocalPart",null,"EV004") ; // The localPart "{0}" has an illegal character.
      return v;
    }

    let seqs:Array<string> = ["..", ".@", "@."];

    for(let j:number = 0; i<seqs.length;i++ )
    {
      if(str.indexOf(seqs[j]) != -1)
      {
        v.addError("eps.validation.email.illegalSequence",null,"EV005");// Illegal sequence of characters! [{0}]
        return v;
      }
    }

    return v;
  }



  private static validateSubLocalPartWithQuotes(str:string):Validation<any>
  {
    let v:Validation<any> = new Validation();

    let rgx:RegExp = /^[0-9a-zA-Z@.!#$%&'*+\-\/=?^_`{|}~""(),:;<> \[\\\]]+$/;
    if (!rgx.test(str))
    {
      v.addError("eps.validation.email.illegalLocalPart",null,"EV006");// The localPart "{0}" has an iligal character.
      return v;
    }

    return v;
  }


  private static validateDomain(str:string):Validation<any>
  {
    let v:Validation<any> = new Validation();

    if (str.length>255)
    {
      v.addError("eps.validation.email.domainTooLong",null,"EV007"); // Domain is too long (maximum of 255 characters).
      return v;
    }

    let firstChar:string = str[0];
    let lastChar:string = str[str.length - 1];

    if(firstChar == '.')
    {
      v.addError("eps.validation.email.domainStartPeriod",null,"EV008") ;// Domain may not start with a period.
      return v;
    }

    if(lastChar == '.')
    {
      v.addError("eps.validation.email.domainEndPeriod",null,"EV009"); // Domain may not end with a period.
      return v;
    }

    if(firstChar == '-')
    {
      v.addError("eps.validation.email.domainStartDash",null,"EV010"); // Domain may not start with a -.
      return v;
    }

    if(lastChar == '-')
    {
      v.addError("eps.validation.email.domainEndsDash",null,"EV011"); // Domain may not end with a -.
      return v;
    }

    if(str.indexOf("..") != -1)
    {
      v.addError("eps.validation.email.domainTwoPeriods",null,"EV012"); // Domain may not have two consecutive periods. (..)
      return v;
    }

    if(str.indexOf(".") == -1)
    {
      v.addError("eps.validation.email.domainNoPeriod",null,"EV013"); // There is no period, thus, no domain extension.
      return v;
    }


    let rgx:RegExp = /^[0-9a-zA-Z-.]+$/;
    if (!rgx.test(str))
    {
      v.addError("eps.validation.email.domainIllegalChar",null,"EV014"); // Domain has an illegal character.
      return v;
    }

    /*
      Note: This validation does not accept ip addresses and comments.
      john.smith@example.com(comment)
      jsmith@[192.168.2.1]
    */

    return v;
  }



  private static validateLocalPart(str:string):Validation<any>
  {

    let v:Validation<any> = new Validation();

    if (str.length>64)
    {
      v.addError("eps.validation.email.localPartTooLong",null,"EV015"); // The local part is too long (maximum of 64 characters).
      return v;
    }

    let firstChar:string = str[0];
    let lastChar:string = str[str.length - 1];

    if(firstChar == '.')
    {
      v.addError("eps.validation.email.localPartStartsPeriod",null,"EV016"); // // Local part may not start with a period.
      return v;
    }

    if(lastChar == '.')
    {
      v.addError("eps.validation.email.localPartEndsPeriod",null,"EV017"); // //  Local part may not end with a period.
      return v;
    }

    str = str.replace("\\\"","{$validation|backslatAndQuote$}");

    let unescapedBackSlashCount:number = StringUtils.allIndexesOf(str, "\"").length;

    if(unescapedBackSlashCount%2 != 0)
    {
      v.addError("eps.validation.email.localPartQuotes",null,"EV018") ; // There is an odd number of unescaped quotes in the local part.
      return v;
    }

    str = StringUtils.parse(new StringSearch(str, "\"", "\""),true, s =>
    {
      return s.InnerResult.Replace(".","{$validation|period$}");
    });

    if(str.indexOf("..") != -1)
    {
      v.addError("eps.validation.email.localPartPeriods",null,"EV019"); // Local part may not have two consecutive periods. (..)
      return v;
    }


    let subLocalParts:Array<string> = str.split('.');

    for(let i:number = 0; i<subLocalParts.length; i++)
    {
      let subStr:string = subLocalParts[i];
      subStr = subStr.replace("{$validation|backslatAndQuote$}", "\\\"");
      subStr = subStr.replace("{$validation|period$}", ".");

      let iValidation:Validation<any> = this.validateSubLocalPart(subStr);
      if(iValidation.valid == false)
        return iValidation;
    }

    return v;

  }


}

