import { measureText } from "../utility";
import { Subscriber } from "../../../interfaces";
import { CheckBoxWidget, SKCheckBoxProps, SKCheckBoxStyleProps } from "./checkboxWidget";
import { Style } from "./style";

export class CheckBoxModel {
    // ==========
    // PARAMETERS
    private _subscribers: Subscriber[] = [];
    private _widget: CheckBoxWidget;
    private _state: "unchecked" | "checked";
    private _drawingState: "idle" | "hover" | "down";

    private _elems: SKCheckBoxProps;
    private _styleElems: SKCheckBoxStyleProps;
    protected _width: number = 100;
    protected _height: number = 20;
    protected _text = "Sample Text";

    protected _radius = 2;
    protected _font = Style.font;
    protected _fontColour = Style.fontColour;
    protected _highlightColour = Style.highlightColour;
    protected _padding = Style.textPadding;

    // ===========
    // CONSTRUCTOR
    constructor(widget: CheckBoxWidget, elems: SKCheckBoxProps, styleProps: SKCheckBoxStyleProps) {
        this._widget = widget;
        this._elems = elems;
        this._styleElems = styleProps;
        this._state = "unchecked";

        this._drawingState = "idle";

        if (elems.width) this._width = elems.width;
        if (elems.height) this._height = elems.height;
        if (elems.startState) this._state = elems.startState;
        if (elems.text) this._text = elems.text;

        if (styleProps.radius) this._radius = styleProps.radius; 
        if (styleProps.font) this._font = styleProps.font;
        if (styleProps.fontColour) this._fontColour = styleProps.fontColour;
        if (styleProps.highlightColour) this._highlightColour = styleProps.highlightColour;
        if (styleProps.padding) this._padding = styleProps.padding;

        this._widget.calculateBasis();
        this._widget.doLayout();
        this.setMinimalSize(this._width, this._height);
    }

    // ==============================
    // GETTERS, SETTERS AND FUNCTIONS
    // -------------
    // Getter/Setter
    get x() {
        return this._elems.x || 0;
    }
    get y() {
        return this._elems.y || 0;
    }

    get fill() {
        return this._elems.fill || "lightgrey";
    }

    get border() {
        return this._elems.border || "black";
    }

    get state() {
        return this._state;
    }
    set state(state: "unchecked" | "checked") {
        this._state = state;
    }

    get drawingState() {
        return this._drawingState;
    }
    set drawingState(state: "idle" | "hover" | "down") {
        this._drawingState = state;
    }

    get text(): string {
        return this._text;
    }
    set text(s: string) {
        this._text = s;
        this.setMinimalSize(this._elems.width, this._elems.height);
    }

    set radius(r: number) {
        this._radius = r;
    }
    get radius() {
        return this._radius;
    }

    set font(s: string) {
        this._font = s;
        this.setMinimalSize(this._elems.width, this._elems.height);
    }
    get font() {
        return this._font || Style.font;
    }

    set fontColour(c: string) {
        this._fontColour = c;
    }
    get fontColour() {
        return this._fontColour || Style.fontColour;
    }

    get highlightColour() {
        return this._highlightColour;
    }
    set highlightColour(hc: string){
        this._highlightColour = hc;
    }

    get padding() {
        return this._padding;
    }

    get margin() {
        return this._styleElems.margin || 0;
    }

    get paddingBox() {
        return this._widget.paddingBox;
    }

    get width() {
        return this._width;
    }


    get height() {
        return this._height;
    }

    setMinimalSize(width?: number, height?: number) {
        width = width || this._elems.width;
        height = height || this._elems.height;
        // need this if w or h not specified
        const m = measureText(this._text, this._font);
    
        if (!m) {
          console.warn(`measureText failed in SKCheckBox for ${this._text}`);
          return;
        }
    
        this._elems.height = height || m.height + this._padding * 2;
    
        this._elems.width = width || m.width + this._padding * 2;
        // enforce a minimum width here (if no width specified)
        if (!width) this._elems.width = Math.max(this._elems.width, 80);
    }

    // -------------------------
    // Subscriber Functionnality
    public addSubscriber(s: Subscriber): void {
        this._subscribers.push(s);
        this.notifySubscribers();
    }

    private notifySubscribers(): void {
        this._subscribers.forEach((subscriber) => subscriber.update());
    }
}