import {} from "../../../MapWidget";
import { SKEvent } from "../events";
import { SKContainer } from ".";
import { CheckBoxController } from "./checkBoxController";
import { CheckBoxModel } from "./checkBoxModel";

export class CheckBoxView {
    private _model: CheckBoxModel;

    constructor(m: CheckBoxModel) {
        this._model = m;
    }


    public setEvents(c: CheckBoxController) {
        
    }

    public draw(gc: CanvasRenderingContext2D) {
        gc.save();

        // Draw the check box

        
        // Draw the text

        gc.restore();

    }
}