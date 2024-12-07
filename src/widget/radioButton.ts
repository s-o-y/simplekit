import { insideHitTestRectangle, measureText } from "../utility";
import { SKElement, SKElementProps } from "./element";
import { Style } from "./style";
import { SKEvent, SKMouseEvent } from "../events";

import { invalidateLayout } from "../imperative-mode";
import { Layout, LayoutMethod, Size } from "../layout";
import { requestMouseFocus } from "../dispatch";
import { SKCheckBox } from "./checkbox";

export type SKRadioButtonProps = SKElementProps & { backFill?: string, options?: string[]};

export class SKRadioButton extends SKElement {
  constructor({
    fill = "lightgrey",
    backFill,
    options,
    ...elementProps
  }: SKRadioButtonProps = {}) {
    super(elementProps);
    this.padding = Style.textPadding;
    if (options) this._options = options;
    this._options.forEach((o) => {
      this._optionsElements.push(new SKCheckBox({text: o, status:"unchecked"}))
      invalidateLayout();
    });

    if (this._optionsElements.length > 0) {
      this._optionsElements[0].status = "checked";
    }
    
    if (backFill) this._backFill = backFill;
    if (fill) this.fill = fill;
    this._optionsElements.forEach(o => o.fill = fill);
    this.setMinimalSize();
    this.addCheckBoxEventListener();
    this.calculateBasis();
    this.doLayout();
    this._layoutMethod = Layout.makeWrapRowLayout();
  }

  protected _backFill = "lightgrey";
  set backFill(b: string) {
    this._backFill = b;
  }
  protected _optionsElements: SKCheckBox[] = [];

  protected _options: string[] = [];
  get options() {
    return this._options;
  }
  set options(strArr: string[]) {
    if (strArr.length == this._options.length) {
      for (let k = 0; k < this._options.length; k++) {
        this._options[k] = strArr[k];
      }
    }
  }

  protected _currentSelection: number = 0;
  get currentSelection() {
    return this._currentSelection;
  }
  set currentSelection(ind: number) {
    if (ind >= 0 && ind < this._optionsElements.length) {
      this._currentSelection = ind;
    }
  }

  addCheckBoxEventListener() {
    this._optionsElements.forEach((o) => {
      o.addEventListener("action", () => {
        console.log("Yes hello");
      })
    });
     
  }

  private _darkest = "#003459"; // title theme colour 
  state: "idle" | "hover" | "down" = "idle";

  protected _radius = 4;
  set radius(r: number) {
    this._optionsElements.forEach((o) => o.radius = r);
    this._radius = r;
  }
  get radius() {
    return this._radius;
  }

  protected _font = Style.font;
  set font(s: string) {
    this._font = s;
    this._optionsElements.forEach((o) => o.font = s);
  }
  get font() {
    return this._font;
  }

  protected _fontColour = Style.fontColour;
  set fontColour(c: string) {
    this._fontColour = c;
    this._optionsElements.forEach((o) => o.fontColour = c);
  }
  get fontColour() {
    return this._fontColour;
  }

  protected _highlightColour = Style.highlightColour;
  set highlightColour(hc: string){
    this._highlightColour = hc;
    this._optionsElements.forEach((o) => o.highlightColour = hc);
  }


  setMinimalSize(width?: number, height?: number) {
    width = width || this.width;
    height = height || this.height;
    // need this if w or h not specified

    this.height = height || this._optionsElements[0].height * this._optionsElements.length + this.padding * 2;

    this.width = width || this.getMaxLength() + this.padding * 2;
    // enforce a minimum width here (if no width specified)
    if (!width) this.width = Math.max(this.width, 80);
  }

  getMaxLength() {
    let max = 0;
    this._optionsElements.forEach((o) => {
      if (o.width > max) {
        max = o.width;
      } 
    });
    return max;
  }

  handleMouseEventCapture(me: SKMouseEvent) {
  switch (me.type) {
    case "click":
      console.log("in the mouse capture event");
      return this.sendEvent(
        {
          source: this,
          timeStamp: me.timeStamp,
          type: "action",
        },
        true
      );
      break;
  }
  return false;
}

handleMouseEvent(me: SKMouseEvent) {
  switch (me.type) {
    case "click":
      console.log("in the mouse event");
      return this.sendEvent({
        source: this,
        timeStamp: me.timeStamp,
        type: "action",
      });
      break;
  }
  return false;
}


draw(gc: CanvasRenderingContext2D) {
  gc.save();
  // set coordinate system to padding box
  gc.translate(this.margin, this.margin);
  
  const w = this.paddingBox.width;
  const h = this.paddingBox.height;

  // Draw the outer container essentially
  if(this.backFill){
    gc.beginPath();
    gc.roundRect(this.x, this.y, w, h, this._radius);
    gc.fillStyle =  this.backFill;
    gc.fill();
  }
  
  if(this.border){
    gc.strokeStyle = this.border;
    gc.lineWidth = 1;
    gc.stroke();
  }

  gc.restore();

  

  // now draw all the children
  gc.save();
  // set coordinate system to container content box
  gc.translate(this.x, this.y);
  gc.translate(this.margin, this.margin);
  gc.translate(this.padding, this.padding);
  // draw children
  this._optionsElements.forEach((o) => o.draw(gc));
  gc.restore();

  // let element draw debug if flag is set
  super.draw(gc);
}

protected _layoutMethod: LayoutMethod | undefined;
set layoutMethod(lm: LayoutMethod) {
  this._layoutMethod = lm;
}

doLayout(width?: number, height?: number): Size {
  let recalculate = this._recalculateBasis;
  let size = super.doLayout(width, height);
  this._recalculateBasis = recalculate;
  if (this._optionsElements.length > 0) {
    this._optionsElements.forEach((el) => el.calculateBasis());
    // do initial layout of children (might change after this container layout)
    this._optionsElements.forEach((el) => el.doLayout());
    // run the layout method
    // (it returns new bounds, but we ignore it for now)
    // console.log(
    //   `${this.id} layout in ${this.box.contentBox.width}x${this.box.contentBox.height}`
    // );
    if (this._layoutMethod) {
      size = this._layoutMethod(
        this.contentBox.width,
        this.contentBox.height,
        this._optionsElements
      );
      // this.widthLayout = Math.max(size.width, this.widthBasis);
      // this.heightLayout = Math.max(size.height, this.heightBasis);

      // do final layout of children
      // (using size assigned by this container)
      this._optionsElements.forEach((el) => el.doLayout());
    }

    return size;
  } else {
    return { width: this.widthLayout, height: this.heightLayout };
  }
}

public updateCurrentSelection(optionText: string) {
  for (let j = 0; j < this._optionsElements.length; j++) {
    if (this._optionsElements[j].text === optionText) {
      this.currentSelection = j;
      this._optionsElements[j].status = "checked";
      break; 
    }
  }
  for (let i = 0; i < this._optionsElements.length; i++) {
    if (this.currentSelection !== i) {
      this._optionsElements[i].status = "unchecked";
      break; 
    }
  }
}

  public toString(): string {
    return `SKRadioButton '${this._optionsElements.length}'`;
  }
}



