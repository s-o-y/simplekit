import { CheckBoxModel } from "./checkBoxModel"
import { CheckBoxView } from "./checkBoxView"
import { CheckBoxController } from "./checkBoxController"
import { SKElement, SKElementProps } from "./element";
import { SKEvent, SKMouseEvent } from "../events";
import { Style } from "./style";
import { measureText } from "../utility";

export type SKCheckBoxProps = SKElementProps & { text?: string, startState?: "unchecked" | "checked" };

export type SKCheckBoxStyleProps = {radius?: number, font?: string, fontColour?: string, highlightColour?: string, padding?: number, margin?: number}

export class CheckBoxWidget extends SKElement {
    // ==========
    // PARAMETERS
    private _model: CheckBoxModel;
    private _view: CheckBoxView;
    private _controller: CheckBoxController;


    // ==========
    // CONSTRUCTOR
    // #region
    // Button Constructor
    // constructor({ 
    //     text = "", 
    //     fill = "lightgrey",
    //     ...elementProps
    //   }: SKButtonProps = {}) {
    //     super(elementProps);
    //     this.padding = Style.textPadding;
    //     this.text = text;
    //     this.fill = fill;
    //     this.calculateBasis();
    //     this.doLayout();
    //   }
    // #endregion
    constructor({
        fill = "lightgrey",
        text = "", 
        ... elementProps
    }: SKCheckBoxProps = {}, 
    {radius = 4, 
        font = Style.font, 
        fontColour = Style.fontColour, 
        highlightColour = Style.highlightColour, 
        padding = Style.textPadding,
        margin = 0,
        ... styleProps
    }: SKCheckBoxStyleProps = {}
    ) { 
        super(elementProps);
       
        this._model = new CheckBoxModel(this, elementProps, styleProps) // initially all checkboxes should be checked
        this._view = new CheckBoxView(this._model);
        this._controller = new CheckBoxController(this, this._model);
    }

    draw(gc: CanvasRenderingContext2D) {
        this._view.draw(gc);
        super.draw(gc);
    }

    newEvent(e: SKEvent) {
        return this.sendEvent({
            source: this,
            timeStamp: e.timeStamp,
            type: "action",
        } as SKEvent);
    }

    get state(): string {
        return this._model.state;
    }

    get text(): string {
        return this._model.text;
    }
    

    handleMouseEvent(me: SKMouseEvent):boolean {
        this._controller.runHandlers(me);
        return true;
    }

    // public addMapEventHandler(func: (arg1: SKEvent, arg2: CheckBoxWidget, arg3: CheckBoxModel) => void) {
    //     this._controller.eventHandlers.push(func);
    // }


}