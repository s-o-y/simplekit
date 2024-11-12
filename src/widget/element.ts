import { SKEvent, SKKeyboardEvent, SKMouseEvent } from "../events";

import { Settings } from "../settings";
import { Style } from "./style";
import { insideHitTestRectangle } from "../utility";

import { invalidateLayout } from "../imperative-mode";

import { Size } from "../layout";

type EventHandler = (me: SKEvent) => boolean | void;

type BindingRoute = {
  type: string; // event type
  handler: EventHandler;
  capture: boolean;
};

export type SKElementProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  border?: string;
};

export abstract class SKElement {
  constructor({
    x = 0,
    y = 0,
    width = undefined,
    height = undefined,
    fill = "",
    border = "",
  }: SKElementProps = {}) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.width = width ?? 0;
    this.height = height ?? 0;
    this.fill = fill ?? "";
    this.border = border ?? "";
  }

  // top-left corner of element bounding box
  protected _x: number = 0;
  protected _y: number = 0;

  public set x(x: number) {
    if (x !== this._x) {
      this._x = x;
    }
  }

  public get x(): number {
    return this._x;
  }

  public set y(y: number) {
    if (y !== this._y) {
      this._y = y;
    }
  }

  public get y(): number {
    return this._y;
  }

  protected _width: number = 400;
  public set width(w: number) {
    if (w !== this._width) {
      this._width = w;
      this.recalculateBasis();
    }
  }
  public get width(): number {
    return this._width;
  }

  protected _height: number = 400;
  public set height(h: number) {
    if (h !== this._height) {
      this._height = h;
      this.recalculateBasis();
    }
  }
  public get height(): number {
    return this._height;
  }

  // box: BoxModel = new BoxModel(this.recalculateBasis);

  //#region basis and layout calculation

  // basis size calculation flag
  _recalculateBasis = false;
  recalculateBasis() {
    this._recalculateBasis = true;
    invalidateLayout();
  }

  widthBasis = 0;
  heightBasis = 0;

  // calculate minimum layout size of element
  // (total minimum size including margin and padding)
  calculateBasis(): [number, number] {
    const recalc = this._recalculateBasis;
    if (this._recalculateBasis) {
      const w = Math.max(this.width || 0, 2 * this.padding);
      this.widthBasis = w + 2 * this.margin;
      const h = Math.max(this.height || 0, 2 * this.padding);
      this.heightBasis = h + 2 * this.margin;
      this._recalculateBasis = false;
      this.recalculateLayout = true;
    }
    if (Settings.debugLayout)
      console.log(
        ` calculateBasis ${this.id} ${recalc ? "CALC" : ""} => ${
          this.widthBasis
        }x${this.heightBasis}`
      );
    return [this.widthBasis, this.heightBasis];
  }

  // proportion to grow and shrink in some layouts
  // (0 means do not grow or shrink)
  fillWidth = 0;
  fillHeight = 0;

  // layout calculation flag
  recalculateLayout = false;

  widthLayout = 0;
  heightLayout = 0;

  // do layout for element using available width and height
  doLayout(width?: number, height?: number): Size {
    if (Settings.debugLayout) console.log(`doLayout ${this.id}`);
    if (this.recalculateLayout || width || height) {
      const [w, h] = this.calculateBasis();
      this.widthLayout = width || w;
      this.heightLayout = height || h;
      this.recalculateLayout = false;
    }
    if (Settings.debugLayout)
      console.log(
        ` SKElement ${this.id} ${this.widthLayout}x${this.heightLayout}`
      );
    return { width: this.widthLayout, height: this.heightLayout };
  }

  //#endregion

  //#region box model

  // border colour (assume 1 px solid)
  protected _border: string = "1px solid";

  public get border(): string {
    return this._border;
  }
  public set border(b: string) {
    this._border = b;
  }

  // margin
  protected _margin = 0;
  public set margin(m: number) {
    if (m !== this.margin) {
      m = Math.max(0, m);
      this._margin = m;
      this.recalculateBasis();
    }
  }
  public get margin() {
    return this._margin;
  }
  public get marginBox(): Size {
    return {
      width: this.widthLayout,
      height: this.heightLayout,
    };
  }

  // padding
  protected _padding = 0;
  public set padding(p: number) {
    if (p !== this.padding) {
      p = Math.max(0, p);
      this._padding = p;
      this.recalculateBasis();
    }
  }
  public get padding() {
    return this._padding;
  }
  public get paddingBox(): Size {
    return {
      width: this.widthLayout - 2 * this.margin,
      height: this.heightLayout - 2 * this.margin,
    };
  }

  public get contentBox(): Size {
    return {
      width: this.widthLayout - 2 * this.margin - 2 * this.padding,
      height: this.heightLayout - 2 * this.margin - 2 * this.padding,
    };
  }

  // draw box model for debugging
  drawBoxModel(gc: CanvasRenderingContext2D) {
    gc.save();
    gc.lineWidth = 1;

    // margin
    if (this.margin > 0) {
      gc.strokeStyle = "red";
      gc.setLineDash([2, 2]);
      gc.strokeRect(0, 0, this.widthLayout, this.heightLayout);
    }

    // padding
    if (this.padding > 0) {
      gc.strokeStyle = "green";
      gc.setLineDash([2, 2]);
      gc.strokeRect(
        this.margin,
        this.margin,
        this.paddingBox.width,
        this.paddingBox.height
      );
    }

    // content
    gc.strokeStyle = "blue";
    gc.setLineDash([2, 2]);
    gc.strokeRect(
      this.margin + this.padding,
      this.margin + this.padding,
      this.contentBox.width,
      this.contentBox.height
    );

    gc.restore();
  }

  //#endregion

  //#region widget event binding

  private bindingTable: BindingRoute[] = [];

  protected sendEvent(e: SKEvent, capture = false): boolean {
    let handled = false;
    this.bindingTable.forEach((d) => {
      if (d.type == e.type && d.capture == capture) {
        handled ||= d.handler(e) as boolean;
      }
    });
    return handled;
  }

  addEventListener(type: string, handler: EventHandler, capture = false) {
    this.bindingTable.push({ type, handler, capture });
  }

  removeEventListener(type: string, handler: EventHandler, capture = false) {
    this.bindingTable = this.bindingTable.filter(
      (d) => !(d.type == type && d.handler == handler && d.capture == capture)
    );
  }

  //#endregion

  //#region event handling

  handleKeyboardEvent(ke: SKKeyboardEvent): boolean {
    return false;
  }

  handleMouseEvent(ms: SKMouseEvent): boolean {
    return false;
  }

  handleMouseEventCapture(ms: SKMouseEvent): boolean {
    return false;
  }

  //#endregion

  hitTest(mx: number, my: number): boolean {
    return insideHitTestRectangle(
      mx,
      my,
      (this.x ?? 0) + this.margin,
      (this.y ?? 0) + this.margin,
      this.paddingBox.width,
      this.paddingBox.height
    );
  }

  // background colour
  protected _fill: string = "";

  public get fill(): string {
    return this._fill;
  }

  public set fill(f: string) {
    this._fill = f;
  }

  // for debugging
  id = "";
  debug = false;

  draw(gc: CanvasRenderingContext2D): void {
    if (Settings.debug || this.debug) {
      gc.save();
      gc.translate(this.x ?? 0, this.y ?? 0);
      // draw the box model visualization
      this.drawBoxModel(gc);

      // display element id
      gc.strokeStyle = "white";
      gc.lineWidth = 2;
      gc.textBaseline = "top";
      gc.textAlign = "left";
      gc.font = "7pt sans-serif";
      gc.strokeText(this.id, 2, 2);
      gc.fillStyle = "black";
      gc.fillText(this.id, 2, 2);
      gc.restore();
    }
  }

  public boxModelToString(): string {
    // const s = JSON.stringify({
    //   margin: this.margin,
    //   padding: this.padding,
    //   marginBox: this.marginBox,
    //   paddingBox: this.paddingBox,
    //   contentBox: this.contentBox,
    //   width: this.widthLayout,
    //   this.height
    // }
    return `width:${this._width} height:${this._height} margin:${this.margin} padding:${this.padding} basis:${this.widthBasis}x${this.heightBasis} layout:${this.widthLayout}x${this.heightLayout}`;
  }

  public toString(): string {
    return `SKElement id:${this.id}`;
  }
}