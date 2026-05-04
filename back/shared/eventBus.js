import {EventEmitter} from 'events';

class EventBus extends EventEmitter{
    constructor(){
        super()
    }
}
const eventBusInstance = new EventBus();
export default EventBus;