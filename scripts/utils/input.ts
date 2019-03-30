export default class Input {
    private my_keys: {[key: string] : DOMHighResTimeStamp} = {};
    private handlers: {[key: string] : (elapsed_time: DOMHighResTimeStamp) => void} = {};
    private press_handlers: {[key: string] : (elapsed_time: DOMHighResTimeStamp) => void} = {};

    constructor(){
        window.addEventListener('keydown', (e) => this.onKeydown(e));
        window.addEventListener('keyup', (e) => this.onKeyup(e));
    }

    onKeydown(e: KeyboardEvent){
        this.my_keys[e.key] = e.timeStamp;
    }

    onKeyup(e: KeyboardEvent){
        delete this.my_keys[e.key];
    }

    register_hold(key: string, handler: {(elapsed_time: DOMHighResTimeStamp): void}){
        this.handlers[key] = handler;
    }

    register_press(key: string, handler: {(elapsed_time: DOMHighResTimeStamp): void}){
        this.press_handlers[key] = handler;
    }

    update(elapsed_time: DOMHighResTimeStamp){
        // Update held buttons
        for(let key in this.my_keys){
            if(this.my_keys.hasOwnProperty(key)){
                if(this.handlers[key]){
                    this.handlers[key](elapsed_time);
                }
                if(this.press_handlers[key]){
                    this.press_handlers[key](elapsed_time);
                    delete this.my_keys[key];
                }
            }
        }
    }

    getHandlers(): {[key: string] : (elapsed_time: DOMHighResTimeStamp) => void}{
        return this.handlers;
    }

    getKeys(): {[key: string] : DOMHighResTimeStamp}{
        return this.my_keys;
    }
}