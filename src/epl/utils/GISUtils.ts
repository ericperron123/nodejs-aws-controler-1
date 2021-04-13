import { Point, Rect } from "../Types";

export class GISUtils {


  // x = latitude
  // y = longitude
  public static LatLonToMercator(point: Point) {

    let rMajor: number = 6378137; //Equatorial Radius, WGS84
    let shift: number = Math.PI * rMajor;
    let x: number = point.y * shift / 180;
    let y: number = Math.log(Math.tan((90 + point.x) * Math.PI / 360)) / (Math.PI / 180);
    y = y * shift / 180;

    return new Point(x, y);
  }


  public static pointIsInFeature(point: Point, feature: any): boolean {

    for (let i: number = 0; i < feature.length; i++)
      if (this.pointIsInPolygon(point, feature[i]))
        return true;

    return false;
  }

  public static pointIsInRadius(x, y, radiusX, radiusY, radius) {
    var dist_points = (x - radiusX) * (x - radiusX) + (y - radiusY) * (y - radiusY);
    radius *= radius;
  
    return (dist_points < radius);
  }

  public static pointIsInPolygon(pIn: Point, polygon) {
    let point:[any,any] = [pIn.x, pIn.y];
    const bbox = poly => poly.reduce((b, [x, y]) =>
      ({ "miX": Math.min(x, b.miX), "maX": Math.max(x, b.maX), "miY": Math.min(y, b.miY), "maY": Math.max(y, b.maY) }),
      { "miX": poly[0][0], "maX": poly[0][0], "miY": poly[0][1], "maY": poly[0][1] });
    const inBBox = ([x, y], box) => !(x < box.miX || x > box.maX || y < box.miY || y > box.maY);
    const intersect = (xi, yi, xj, yj, u, v) =>
      ((yi > v) != (yj > v)) && (u < (xj - xi) * (v - yi) / (yj - yi) + xi);
    const nex = (i, t) => i === 0 ? t.length - 1 : i - 1;
    const insideWN = ([x, y], vs) => !!(vs.reduce((s, p, i, t) =>
      s + intersect(p[0], p[1], t[nex(i, t)][0], t[nex(i, t)][1], x, y), 0));
    return inBBox(point, bbox(polygon)) && insideWN(point, polygon);
  }


  public static getPolygonExtent(polygon:Array<Array<number>>): Array<Array<number>> {

    let rect:Rect = new Rect();

    polygon.forEach((point:Array<number>)=>{
      rect.includePoint(new Point(point[0],point[1]));
    });
    
    return rect.getPolygon();
  };



  public static getFeatureExtent(feature:Array<Array<Array<number>>>): Array<Array<number>> {
    
    let rect:Rect = new Rect();

    feature.forEach((polygon:Array<Array<number>>)=>{
      let ext:Array<Array<number>> = this.getPolygonExtent(polygon);
      rect.includeSquarePolygon(ext);
    });
    
    return rect.getPolygon();

  };


}


