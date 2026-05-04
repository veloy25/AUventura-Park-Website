import {EventEmitter} from 'events';

class EventBus extends EventEmitter{
    constructor(){
        super()
    }
}
const EventBus = new EventBus();
export default EventBus;