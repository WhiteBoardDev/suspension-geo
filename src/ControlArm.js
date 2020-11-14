import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';
import Measurement from './Measurement';
import { v4 as uuidv4 } from 'uuid';

export default class ControlArm {

    constructor(container, wheelAssembly, boundedVehiclePointProvider, chassisRollProvider, chassisTranslateRequest, displayName) {
        this.id = uuidv4();
        this.container = container;
        this.wheelAssembly = wheelAssembly;
        this.displayName = displayName;
        this.boundedVehiclePointProvider = boundedVehiclePointProvider;
        this.chassisRollProvider = chassisRollProvider;
        this.chassisTranslateRequest = chassisTranslateRequest;
        this.measurements = [
            new Measurement("Length", 400, "mm", true, 1, 1000),
            new Measurement("Angle From Chassis", 175, "degrees", true, 100, 240)
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
            this.chassisTranslateRequest(this.translationRequiredFromChassisToLinkToArm());
            return false;
        }
        return true;
    }

    translationRequiredFromChassisToLinkToArm() {
        const knuckleJoint = this.wheelAssembly.getJoints()[1];
        const vehicleJoint = this.boundedVehiclePointProvider();
        const chassisRoleAngle = this.chassisRollProvider();
        const angle = 180 - this.measurements[1].getValue() + chassisRoleAngle

        const expectedChassisJointLocation = geometric.pointTranslate(knuckleJoint, angle, this.measurements[0].getValueAsPixles());
        const vectorChange = [
            expectedChassisJointLocation[0] - vehicleJoint[0],
            expectedChassisJointLocation[1] - vehicleJoint[1]
        ]
        return vectorChange;
    }

    setArmAngle(angle) {
        this.measurements[1].updateValue(angle);
    }

    contraintsMet() {
        const point = this.translationRequiredFromChassisToLinkToArm();
        return Math.abs(point[0].toFixed(3)) < 0.008 && Math.abs(point[1].toFixed(3)) < 0.008;
    }
}

