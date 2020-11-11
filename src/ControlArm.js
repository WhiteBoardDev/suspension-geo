import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';


export default class ControlArm {

    constructor(container, wheelAssembly, boundedVehiclePointProvider, armLength) {
        this.container = container;
        this.wheelAssembly = wheelAssembly;
        this.boundedVehiclePointProvider = boundedVehiclePointProvider;
        this.armLength = armLength;
        this.armAngle = 175;
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
        const expectedKnuckleJointLocation = geometric.pointTranslate(vehicleJoint, this.armAngle, this.armLength);
        const vectorChange = [
            expectedKnuckleJointLocation[0] - knuckleJoint[0],
            expectedKnuckleJointLocation[1] - knuckleJoint[1]
        ]
        return vectorChange;
    }

    setArmAngle(angle) {
        this.armAngle = angle;
    }

    contraintsMet() {
        const point = this.vectorDistanceFromEndOfArmToKnucklePoint();
        return Math.abs(point[0].toFixed(3)) < 0.008 && Math.abs(point[1].toFixed(3)) < 0.008;
    }
}

