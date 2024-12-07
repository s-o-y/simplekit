import { insideHitTestRectangle, measureText } from "../utility";
import { SKElement, SKElementProps } from "./element";
import { Style } from "./style";
import { SKEvent, SKMouseEvent } from "../events";

import { requestMouseFocus } from "../dispatch";

export type SKCheckBoxPropsNew = SKElementProps & { text?: string, status?: "checked" | "unchecked" };

export class SKCheckBox extends SKElement {
  constructor({ 
    text = "", 
    fill = "lightgrey",
    status = "unchecked",
    ...elementProps
  }: SKCheckBoxPropsNew = {}) {
    super(elementProps);
    this.padding = Style.textPadding;
    this._status = status;
    this.text = text;
    this.fill = fill;
    this.calculateBasis();
    this.doLayout();
  }

  private _darkest = "#003459"; // title theme colour 
  state: "idle" | "hover" | "down" = "idle";
  protected _status: "checked" | "unchecked" = "unchecked"
  get status() {
    return this._status;
  }
  set status(st: "checked" | "unchecked") {
    this._status = st;
  }


  protected _text = "";
  get text() {
    return this._text;
  }
  set text(t: string) {
    this._text = t;
    // console.log(`SKButton text = ${this.text} ${this.width} ${this.height}`);
    this.setMinimalSize(this.width, this.height);
  }

  protected _radius = 4;
  set radius(r: number) {
    this._radius = r;
  }
  get radius() {
    return this._radius;
  }

  protected _font = Style.font;
  set font(s: string) {
    this._font = s;
    this.setMinimalSize(this.width, this.height);
  }
  get font() {
    return this._font;
  }

  protected _fontColour = Style.fontColour;
  set fontColour(c: string) {
    this._fontColour = c;
  }
  get fontColour() {
    return this._fontColour;
  }

  protected _highlightColour = Style.highlightColour;
  set highlightColour(hc: string){
    this._highlightColour = hc;
  }


  setMinimalSize(width?: number, height?: number) {
    width = width || this.width;
    height = height || this.height;
    // need this if w or h not specified
    const m = measureText(this.text, this._font);

    if (!m) {
      console.warn(`measureText failed in SKButton for ${this.text}`);
      return;
    }

    this.height = height || m.height + this.padding * 2;

    this.width = width || m.width + this.padding * 2 + this.height;
    // enforce a minimum width here (if no width specified)
    if (!width) this.width = Math.max(this.width, 80);
  }

  handleMouseEvent(me: SKMouseEvent) {
    // console.log(`${this.text} ${me.type}`);

    switch (me.type) {
      case "mousedown":
        this.state = "down";
        requestMouseFocus(this);
        return true;
        break;
      case "mouseup":
        this.state = "hover";
        this.toggle();
        // return true if a listener was registered
        return this.sendEvent({
          source: this,
          timeStamp: me.timeStamp,
          type: "action",
        } as SKEvent);
        break;
      case "mouseenter":
        this.state = "hover";
        return true;
        break;
      case "mouseexit":
        this.state = "idle";
        return true;
        break;
    }
    return false;
  }

  draw(gc: CanvasRenderingContext2D) {
    const w = this.paddingBox.width;
    const h = this.paddingBox.height;

    gc.save();

    gc.translate(this._margin, this._margin);

    // thick highlight rect
    if (this.state == "hover" || this.state == "down") {
      gc.beginPath();
      gc.roundRect(this.x, this.y, w, h, this.radius);
      gc.strokeStyle = this._highlightColour;
      gc.fillStyle = this._darkest;
      gc.fill();
      gc.lineWidth = 8;
      gc.stroke();
      
    }

    // normal background
    gc.beginPath();
    gc.roundRect(this.x, this.y, this.width, this.height, this.radius);
    gc.fillStyle = this.state === "down" ? this._highlightColour : this.fill;
    gc.strokeStyle = this.border;
    // change fill to show down state
    gc.lineWidth = this.state === "down" ? 4 : 2;
    gc.fill();
    gc.stroke();
    gc.clip(); // clip text if it's wider than text area

    // text label
    gc.font = this._font;
    gc.fillStyle = this._fontColour;
    gc.textAlign = "center";
    gc.textBaseline = "middle";
    gc.fillText(this._text, this.x + this.width * (3/5), this.y + this.height/2 );

    // white box
    gc.beginPath();
    gc.roundRect(this.x + this.height/4, this.y + this.height/4, this.height/2, this.height/2, this.radius);
    gc.fill()
    // X mark when in checked state
    if (this._status === "checked") {
      gc.beginPath();
      gc.strokeStyle = "black"; 
      gc.moveTo(this.x + this.height/4, this.y + this.height/4);
      gc.lineTo(this.x + this.height/4 + this.height/2, this.y + this.height*(3/4));
      gc.moveTo(this.x + this.height/4 + this.height/2, this.y + this.height/4);
      gc.lineTo(this.x + this.height/4, this.y + this.height*(3/4));
      gc.stroke();
      gc.fill();
      gc.closePath();
    } 
    gc.restore();

    // element draws debug viz if flag is set
    super.draw(gc);
    

  }

  public toggle() {
    (this._status == "unchecked") 
    ? (this._status = "checked")
    : (this._status = "unchecked"); 
  }

  public toString(): string {
    return `SKCheckBox '${this.text}'`;
  }
}
