import { v4 as uuidv4 } from 'uuid';

export default class Measurement {
    
    constructor(name, value, unit, userAdjustable, minValue, maxValue) {
        this.renderConstant = 0.6;
        this.userAdjustable = userAdjustable;
        this.name = name;
        this.id = uuidv4();
        this.value = value;
        this.unit = unit;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    getId() { return this.id; } 

    getValue() {
        return this.value;
    }

    getName() {
        return this.name;
    }

    getUnit() { return this.unit; }

    updateValue(value) {
        if(isNaN(value)) {
            throw new Error("Cannot set value to undefined " + this.getName());
        }
        if(value < this.minValue || value > this.maxValue) {
            throw new Error("Value is out of bounds " + value + " min=" + this.minValue + " maxValue=" + this.maxValue + " name=" + this.getName());
        }
        this.value = value;
    }

    updateValueInPixles(pixelValue) {
        const value = pixelValue / this.renderConstant;
        this.updateValue(value);
    }

    getValueAsPixles() {
        if(this.getUnit() === "mm") {
            return this.getValue() * this.renderConstant;
        }
        else if(this.getUnit() === "in") {
            return this.getValue() * this.renderConstant * 25.4; // convert to mm
        }
        else {
            console.error("Unable to convert to pixles!! " + this.getName());
        }
    }
}