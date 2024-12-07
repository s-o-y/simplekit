import { requestMouseFocus } from "../dispatch";
import {} from "../../../MapWidget";
import { SKEvent } from "../events";
import { CheckBoxModel } from "./checkBoxModel";
import { CheckBoxWidget } from "./checkboxWidget";


export class CheckBoxController {
  private _checkBox: CheckBoxWidget;
  private _model: CheckBoxModel;
  public eventHandlers: Array<
    (
      e: SKEvent,
      checkBox: CheckBoxWidget,
      model: CheckBoxModel
    ) => void
  > = [];

  constructor(widget: CheckBoxWidget, m: CheckBoxModel) {
    this._checkBox = widget;
    this._model = m;
  }

  public newEvent(e: SKEvent) {
    switch (e.type) {
      case "mousedown":
        this._model.drawingState = "down";
        requestMouseFocus(this._checkBox);
        return true;
        break;
      case "mouseup":
        this._model.drawingState = "hover";
        // return true if a listener was registered
        return this._checkBox.newEvent(e);
        break;
      case "mouseenter":
        this._model.drawingState = "hover";
        return true;
        break;
      case "mouseexit":
        this._model.drawingState = "idle";
        return true;
        break;
    }
    return false;
  }

  public stateSwitch(currentState: "unchecked" | "checked") {
      this._model.state = currentState;
  }

  public runHandlers(e:SKEvent) { 
    this.eventHandlers.forEach((func)=>{
      func(e, this._checkBox, this._model);
    });
  }
    
}