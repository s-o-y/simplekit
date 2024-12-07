import {} from "../../../MapWidget";
import { SKEvent, SKMouseEvent } from "../events";
import { SKContainer } from ".";
import { CheckBoxController } from "./checkBoxController";
import { CheckBoxModel } from "./checkBoxModel";
import { Subscriber } from "../../../interfaces/";
import { setSKEventListener } from "../canvas-mode";
import { requestMouseFocus } from "dispatch";

export class CheckBoxView implements Subscriber {
    private _model: CheckBoxModel;

    private _state: "checked" | "unchecked";
    private _drawingState: "idle" | "hover" | "down";

    private _lightest = "#E95394";
    private mediumest = "#007ea7"; // button theme colour
    private _darkest = "#003459"; // title theme colour 
    
    constructor(m: CheckBoxModel) {
        this._model = m;
        this._state = this._model.state;
        this._drawingState = this._model.drawingState;
    }

    public setEvents(c: CheckBoxController) {
        const newEvent = c.newEvent.bind(this);
        setSKEventListener(newEvent);
    }

    public draw(gc: CanvasRenderingContext2D) {
        gc.save();

        // gc.translate(this._model.margin, this._model.margin);
    
        // // thick highlight rect
        // if (this._drawingState == "hover" || this._drawingState == "down") {
        //   gc.beginPath();
        //   gc.roundRect(this._model.x, this._model.y, this._model.width, this._model.height, this._model.radius);
        //   gc.strokeStyle = this._model.highlightColour;
        //   gc.fillStyle = this._darkest;
        //   gc.fill();
        //   gc.lineWidth = 8;
        //   gc.stroke();
        // }
    
        // // normal background
        // gc.beginPath();
        // gc.roundRect(this._model.x, this._model.y, this._model.width, this._model.height, this._model.radius);
        // gc.fillStyle = this._drawingState === "down" ? this._model.highlightColour : this._model.fill;
        // gc.strokeStyle = this._model.border;
        // // change fill to show down state
        // gc.lineWidth = this._drawingState === "down" ? 4 : 2;
        // gc.fill();
        // gc.stroke();
        // gc.clip(); // clip text if it's wider than text area
    
        // // button label
        // gc.font = this._model.font;
        // gc.fillStyle = this._model.fontColour;
        // gc.textAlign = "center";
        // gc.textBaseline = "middle";
        // gc.fillText(this._model.text, this._model.x + this._model.width / 2, this._model.y + this._model.height / 2);
    
        gc.restore();
    }

    update(): void {
        this._state = this._model.state;
        console.log("Updating Checkbox View");
    }
}