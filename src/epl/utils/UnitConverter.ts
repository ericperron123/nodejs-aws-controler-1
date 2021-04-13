
import { StringUtils } from "./stringUtils/StringUtils";

/**
 * Author: www.ericperron.com, 2018.
 */

export class UnitConverter
{


  public static convert(from:string, to:string, value:number):number
  {
    if(value == null || value == 0)
      return 0;

      console.debug(StringUtils.Format("EPL UnitConverter: converting {0} from {1} to {2}", [value, from, to]));

    let length:number;
    let mass:number;
    let temp:number;
    let volume:number;

    let convertingFromAVolumeUnit:Function = function():boolean{

      let units:Object = {};
      units[Unit.PINT_US] = true;
      units[Unit.GALLON] = true;
      units[Unit.CUBIC_METER] = true;
      units[Unit.QUART_US] = true;
      units[Unit.GALLON_US] = true;
      units[Unit.CUP] = true;

      return (units[from] == true);

    };


    /*
     converting

     distances 	to 	meters
     mass		to 	grams
     temperature to 	celcius
     volume 		to 	cups

     */

    switch (from){

      case Unit.MM 	: length = value / 1000;	break;
      case Unit.CM 	: length = value / 100; 	break;
      case Unit.M 	: length = value; 			break;
      case Unit.KM	: length = value * 1000;	break;
      case Unit.MILE	: length = value * 1609.344;break;
      case Unit.IN	: length = value * 0.0254;	break;
      case Unit.FT	: length = value * 0.3048;	break;
      case Unit.YARD	: length = value * 0.91440; break;

      case Unit.LB 	: mass = value * 453.59237;	break;
      case Unit.MG 	: mass = value * 0.001;		break;
      case Unit.G	 	: mass = value;				break;
      case Unit.KG	: mass = value * 1000;		break;
      case Unit.TON_US: mass = value * 907184.74; break;

      case Unit.C	 :	temp = value;				break;
      case Unit.F :	temp = (value - 32) * 5/9;	break;
      case Unit.K	 :	temp = value - 273.15;		break;

      case Unit.PINT_US	  :	volume = value * 0.50000;	break;
      case Unit.GALLON	  : volume = value * 0.05204;	break;
      case Unit.CUBIC_METER : volume = value * 0.00024;	break;
      case Unit.QUART_US	  : volume = value * 0.25000;	break;
      case Unit.GALLON_US	  : volume = value * 0.06250; 	break;
      case Unit.CUP		  : volume = value; 			break;

      case Unit.OZ :
      {
        mass = value * 28.3495231;
        volume = value * 8.00000;
        break;
      }

    }
    switch (to){

      // distances (converting from meters)
      case Unit.MM 	: return length * 1000;
      case Unit.CM 	: return length * 100;
      case Unit.M 	: return length;
      case Unit.KM 	: return length / 1000;
      case Unit.MILE	: return length / 1609.344;
      case Unit.IN	: return length / 0.0254;
      case Unit.FT	: return length / 0.3048;
      case Unit.YARD	: return length / 0.91440;

      case Unit.LB 	: return mass / 453.59237;
      case Unit.MG 	: return mass / 0.001;
      case Unit.G		: return mass;
      case Unit.KG 	: return mass / 1000;
      case Unit.TON_US: return mass / 907184.74;


      case Unit.F 	: return temp * 9/5 + 32;
      case Unit.C 		: return temp;
      case Unit.K		: return temp + 273.15 ;

      case Unit.PINT_US		: return volume / 0.50000;
      case Unit.GALLON		: return volume / 0.05204;
      case Unit.CUBIC_METER	: return volume / 0.00024;
      case Unit.QUART_US		: return volume / 0.25000;
      case Unit.GALLON_US		: return volume / 0.06250;
      case Unit.CUP			: return volume;

      // an ouce can represent mass or volume.
      case Unit.OZ :
      {
        if(convertingFromAVolumeUnit())
          return volume / 8.00000;
        else
          return mass / 28.3495231;
      }

    }

    return Number.NaN;

  }

  constructor(){}

}





export class Unit
{

  // distance
  public static MM:string = "MM";         // milimeter
  public static CM:string = "CM";         // centimeter
  public static M:string = "M";           // Meter
  public static KM:string = "KM";         // kilometer

  public static YARD:string = "YARD";

  public static MILE:string = "MILE";
  public static KM_ISO:string = "KM_ISO";

  public static IN:string = "IN";         // INCH
  public static FT:string = "FT";         // FEET

  public static OZ:string = "OZ";         // ounces
  public static LB:string = "LB";         // pound
  public static TON_US:string = "TON_US";

  public static MG:string = "MG";         // miligram
  public static G:string = "G";           // grams
  public static KG:string = "KG";         // kilogram

  public static C:string = "C";           // celcius
  public static F:string = "F";           // fahrenheit
  public static K:string = "K";           // kelvin;

  public static PINT_US:string = "PINT_US";
  public static GALLON:string = "GALLON";
  public static CUBIC_METER:string = "CUBIC_METER";
  public static QUART_US:string = "QUART_US";
  public static GALLON_US:string = "GALLON_US";
  public static CUP:string = "CUP";

  public static DIST_UNIT:string = "MI";
  public static CATEGORY_UNIT:string = "%";

  constructor(){}
}
