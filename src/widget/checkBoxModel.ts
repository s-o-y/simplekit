import { Subscriber } from "../../../interfaces";

export class CheckBoxModel {
    // ==========
    // PARAMETERS
    private _subscribers: Subscriber[] = [];
    private _state: boolean; // true = on; false = off
    private _text: string;

    // ===========
    // CONSTRUCTOR
    constructor(state: boolean, txt: string) {
        this._state = state;
        this._text = txt;
    }

    // ==============================
    // GETTERS, SETTERS AND FUNCTIONS
    // -------------
    // Getter/Setter
    get state() {
        return this._state;
    }
    
    set state(state: boolean) {
        this._state = state;
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