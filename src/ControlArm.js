import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';
import Measurement from './Measurement';
import { v4 as uuidv4 } from 'uuid';

export default class ControlArm {

    constructor(container, wheelAssembly, boundedVehiclePointProvider, chassisRollProvider, displayName) {
        this.id = uuidv4();
        this.container = container;
        this.wheelAssembly = wheelAssembly;
        this.displayName = displayName;
        this.boundedVehiclePointProvider = boundedVehiclePointProvider;
        this.chassisRollProvider = chassisRollProvider;
        this.measurements = [
            new Measurement("Length", 400, "mm", true, 1, 1000),
            new Measurement("Angle From Chassis", 175, "degrees", true, 0, 200)
        ]
    }

    getId() { return this.id; } 
    
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
        graphics.lineStyle(3, 0x96303c, 1);
        graphics.moveTo(knuckleJoint[0], knuckleJoint[1]);
        graphics.lineTo(vehicleJoint[0], vehicleJoint[1]);
        container.addChild(graphics);
    }

    testConstraintsAndAdjust() {
        if(!this.contraintsMet()) {
            this.wheelAssembly.moveRelative(this.vectorDistanceFromEndOfArmToKnucklePoint());
            return false;
        }
        return true;
    }

    vectorDistanceFromEndOfArmToKnucklePoint() {
        const knuckleJoint = this.wheelAssembly.getJoints()[1];
        const vehicleJoint = this.boundedVehiclePointProvider();
        const chassisRoleAngle = this.chassisRollProvider();

        const expectedKnuckleJointLocation = geometric.pointTranslate(vehicleJoint, this.measurements[1].getValue() + chassisRoleAngle, this.measurements[0].getValueAsPixles());
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

