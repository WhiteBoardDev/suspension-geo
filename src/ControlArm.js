import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';
import Measurement from './Measurement';
import { v4 as uuidv4 } from 'uuid';

export default class ControlArm {

    constructor(container, wheelAssembly, boundedVehiclePointProvider, chassisRollProvider, chassisTranslateRequest, displayName, isLeft) {
        this.id = uuidv4();
        this.container = container;
        this.isLeft = isLeft;
        this.wheelAssembly = wheelAssembly;
        this.displayName = displayName;
        this.boundedVehiclePointProvider = boundedVehiclePointProvider;
        this.chassisRollProvider = chassisRollProvider;
        this.chassisTranslateRequest = chassisTranslateRequest;
        this.measurements = [
            new Measurement("Length", 400, "mm", true, 1, 1000),
            new Measurement("Angle", 0, "degrees", false, -1000, 2400)
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
        
        const expectedKnuckleXJointLocation = this.expectedKnuckleXJointLocation();
        const actualKnuckleJointXLocation = this.wheelAssembly.getJoints()[1][0];
        const difference = expectedKnuckleXJointLocation - actualKnuckleJointXLocation;
        if(Math.abs(difference.toFixed(3)) > 0.008) {
            // the control arm is doing all the pushing and pulling
            // assuming the wheels are "stuck" to the ground, we move the wheel assembly in X
            // and move chassis in Y
            this.wheelAssembly.xMoveRequest(difference);
            return false;
        }

        const knuckleJoint = this.wheelAssembly.getJoints()[1];
        const vehicleJoint = this.boundedVehiclePointProvider();
        const armAngle = geometric.lineAngle([knuckleJoint, vehicleJoint]);
        this.measurements[1].updateValue(armAngle);
        return true;
    }


    expectedKnuckleXJointLocation() {
        const knuckleJoint = this.wheelAssembly.getJoints()[1];
        const vehicleJoint = this.boundedVehiclePointProvider();
        const armLengthPixles = this.measurements[0].getValueAsPixles();

        //assumption, we aren't going to move the vehicle in the Y direction.
        if(vehicleJoint[1] + armLengthPixles < knuckleJoint[1] || vehicleJoint[1] - armLengthPixles > knuckleJoint[1] ) {
            throw new Error("Chassis too High in Y Axis!");
        }
        const yLength = Math.abs(vehicleJoint[1] - knuckleJoint[1]);
    
        var xLength = Math.sqrt(Math.pow(armLengthPixles, 2)  - Math.pow(yLength,2))

        if(this.isLeft) {
            return vehicleJoint[0] - xLength;
        } else {
            return vehicleJoint[0] + xLength;
        }
    }

}

