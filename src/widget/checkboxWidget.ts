import { CheckBoxModel } from "./checkBoxModel"
import { CheckBoxView } from "./checkBoxView"
import { CheckBoxController } from "./checkBoxController"
import { SKElement } from "./element";
import { SKEvent, SKMouseEvent } from "../events";

export class CheckBoxWidget extends SKElement {
    // ==========
    // PARAMETERS
    private _model: CheckBoxModel;
    private _view: CheckBoxView;
    private _controller: CheckBoxController;

    // ==========
    // CONSTRUCTOR
    constructor(startState: boolean, txt: string, {x = 0, y = 0, width = 400, height = 400, fill = "lightgrey", border = "black",} = {}) {
        super({
          x: x,
          y: y,
          width: width,
          height: height,
          fill: fill,
          border: border,
        });
        this._model = new CheckBoxModel(startState, txt); // initially all checkboxes should be checked
        this._view = new CheckBoxView(this._model);
        this._controller = new CheckBoxController(this._model);
    }

    draw(gc: CanvasRenderingContext2D) {
        super.draw(gc);
        this._view.draw(gc);
    }

    handleMouseEvent(me: SKMouseEvent):boolean {
        this._controller.runHandlers(me);
        return true;
    }


    public addMapEventHandler(func: (arg1: SKEvent, arg2: CheckBoxModel) => void) {
        this._controller.eventHandlers.push(func);
    }


}