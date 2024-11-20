import {} from "../../../MapWidget";
import { SKEvent } from "../events";
import { CheckBoxModel } from "./checkBoxModel";

export class CheckBoxController {
    private _model: CheckBoxModel;
    public eventHandlers: Array<
    (
      e: SKEvent,
      model: CheckBoxModel
    ) => void
  > = [];

    constructor(m: CheckBoxModel) {
        this._model = m;
    }

    public stateSwitch(currentState: boolean) {
        this._model.state;
    }

    public runHandlers(e:SKEvent) { 
        this.eventHandlers.forEach((func)=>{
            func(e, this._model);
        });
      }
    
}