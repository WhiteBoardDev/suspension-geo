import { v4 as uuidv4 } from 'uuid';

export default class Measurement {
    constructor(name, value, unit) {
        this.name = name;
        this.id = uuidv4();
        this.value = value;
        this.unit = unit;
    }

    getId() { return this.id; } 

    getValue() {
        return this.value;
    }

    getName() {
        return this.name;
    }

    updateValue(value) {
        this.value = value;
    }
}