import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';
import Measurement from './Measurement';


export default class ControlArm {

    constructor(container, wheelAssembly, boundedVehiclePointProvider, armLength, displayName) {
        this.container = container;
        this.wheelAssembly = wheelAssembly;
        this.displayName = displayName;
        this.boundedVehiclePointProvider = boundedVehiclePointProvider;
        this.measurements = [
            new Measurement("armLength", armLength, "mm"),
            new Measurement("armAngle", 175, "degrees")
        ]
    }

    getDisplayName() {
        return this.displayName;
    }

    render() {
        const container = this.container;
        const graphics = new PIXI.Graphics();
        if(this.graphics) {
            container.removeChild(this.graphics);      
        }
        this.graphics = graphics;
        const knuckleJoint = this.wheelAssembly.getJoints()[1];
        const vehicleJoint = this.boundedVehiclePointProvider();
        //drawing arm
        graphics.lineStyle(3, 0xFADDFF, 1);
        graphics.moveTo(knuckleJoint[0], knuckleJoint[1]);
        graphics.lineTo(vehicleJoint[0], vehicleJoint[1]);
        container.addChild(graphics);
    }

    testConstraintsAndAdjust() {
        if(!this.contraintsMet()){
            this.wheelAssembly.moveRelative(this.vectorDistanceFromEndOfArmToKnucklePoint());
            return false;
        }
        return true;
    }

    vectorDistanceFromEndOfArmToKnucklePoint() {
        const knuckleJoint = this.wheelAssembly.getJoints()[1];
        const vehicleJoint = this.boundedVehiclePointProvider();
        const expectedKnuckleJointLocation = geometric.pointTranslate(vehicleJoint, this.measurements[1].getValue(), this.measurements[0].getValue());
        const vectorChange = [
            expectedKnuckleJointLocation[0] - knuckleJoint[0],
            expectedKnuckleJointLocation[1] - knuckleJoint[1]
        ]
        return vectorChange;
    }

    setArmAngle(angle) {
        this.measurements[1].updateValue(angle);
    }

    contraintsMet() {
        const point = this.vectorDistanceFromEndOfArmToKnucklePoint();
        return Math.abs(point[0].toFixed(3)) < 0.008 && Math.abs(point[1].toFixed(3)) < 0.008;
    }
}

