import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';
import Measurement from './Measurement'
import { v4 as uuidv4 } from 'uuid';
//stuck at some constant angle from wheel assembly
export default class Strut {
    constructor(container, wheelAssembly, boundedVehiclePointProvider, isLeft) {
        this.id = uuidv4();
        this.isLeft = isLeft;
        this.container = container;
        this.boundedVehiclePointProvider = boundedVehiclePointProvider;
        this.wheelAssembly = wheelAssembly;
        this.measurements = [
            new Measurement("Angle On Knuckle", 10, "degrees", true, -45, 45),
            new Measurement("Length", 1, "mm", false, 1, 4000),
        ];

        if(!isLeft){
            this.measurements[0].updateValue(-10);
        }
    }

    getId() { return this.id; } 
    
    testConstraintsAndAdjust() {
        if(!this.constraintsMet()) {
            const angleOnKnuckle = this.measurements[0].getValue();
            const boundedVehiclePoint = this.boundedVehiclePointProvider();
            const knuckleJoint = this.wheelAssembly.getJoints()[0]; // TODO this is hard coded to left side
            var strutAngle = geometric.lineAngle([ knuckleJoint, boundedVehiclePoint]) + 90;
            var strutLength = geometric.lineLength([ knuckleJoint, boundedVehiclePoint]);
            this.measurements[1].updateValueInPixles(strutLength);
            var expectedCamber = strutAngle - angleOnKnuckle;
            this.wheelAssembly.setCamber(expectedCamber);
            return false;
        }
        return true;
    }

    getDisplayName() {
        var result = "Strut ";
        if(this.isLeft) {
            result += "Left ";
        } else {
            result += "Right ";
        }

        return result;
    }

    render() {
        const container = this.container;
        const graphics = new PIXI.Graphics();
        const wheelAssembly = this.wheelAssembly;
        const boundedVehiclePoint = this.boundedVehiclePointProvider();

        if(this.graphics) {
            container.removeChild(this.graphics);      
        }
        this.graphics = graphics;

        //strut shape
        const topKnucklePoint = wheelAssembly.getJoints()[0];
        graphics.lineStyle(3, 0x03a356, 1);
        graphics.moveTo(boundedVehiclePoint[0], boundedVehiclePoint[1]);
        graphics.lineTo(topKnucklePoint[0], topKnucklePoint[1]);

        container.addChild(graphics);
    }

    constraintsMet() {
            const strutAngle = geometric.lineAngle([ this.wheelAssembly.getJoints()[0], this.boundedVehiclePointProvider()]) + 90;
            const expectedCamber = strutAngle - this.measurements[0].getValue();
            const actualCamber = this.wheelAssembly.getCamber();
            return expectedCamber.toFixed(3) === actualCamber.toFixed(3)
    }

}
