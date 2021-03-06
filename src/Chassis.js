import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';
import Measurement from './Measurement'
import { v4 as uuidv4 } from 'uuid';


const xOriginLocation = 250;

export default class Chassis {
    constructor(container, ground) {
        this.id = uuidv4();
        this.container = container;
        this.ground = ground;
        this.measurements = [
            new Measurement("Rotation", 0, "degrees", true, -45, 45),
            new Measurement("Mounting Point Vertical Length", 500, "mm", true, 1, 1000),
            new Measurement("Strut Top Separation", 1000, "mm", true, 1, 2000),
            new Measurement("Lower Control Arm Separation", 400, "mm", true, 1, 2000),
            new Measurement("Left Lower Pickup Point to Ground", 200, "mm", false, 0, 1000),
            new Measurement("Right Lower Pickup Point to Ground", 200, "mm", false, 0, 1000),
            new Measurement("Ground Clearance", 150, 'mm', true, 1, 1000)
        ]
    }

    

    getId() { return this.id; } 

    testConstraintsAndAdjust() { 
        const joints = this.getJoints();
        const lowerLeft = joints[2];
        this.measurements[4].updateValueInPixles(this.ground.groundYAxis - lowerLeft[1]);
        const lowerRight = joints[3];
        this.measurements[5].updateValueInPixles(this.ground.groundYAxis - lowerRight[1]);
        return true; 
    }

    getDisplayName() { return "Chassis"; }
    getJoints() {
        const thisRef = this;
        const vehHeightPixles = this.measurements[1].getValueAsPixles()
        const vehWidthTopPixles = this.measurements[2].getValueAsPixles()
        const vehWidthBottomPixles = this.measurements[3].getValueAsPixles()
        const groundHeightPixles = this.measurements[6].getValueAsPixles()

        const joints = [
            // 0 - top left
            [ xOriginLocation, this.ground.groundYAxis - groundHeightPixles - vehHeightPixles]
           
        ];
        // 1 - top right
        joints.push([joints[0][0] + vehWidthTopPixles, joints[0][1]]);
        // 2 - lower left
        joints.push([joints[0][0] + ((vehWidthTopPixles - vehWidthBottomPixles) /2), joints[0][1] + vehHeightPixles]);
         // 3 - lower right   
        joints.push([joints[2][0] + vehWidthBottomPixles, joints[2][1]]);

        joints.forEach( function(value, index, array) {
            const rotated = geometric.pointRotate(value, thisRef.measurements[0].getValue(), [xOriginLocation, (vehHeightPixles/2) + groundHeightPixles])
            array[index] = rotated;
        });        
        return joints;
    }

    render() {
        const graphics = new PIXI.Graphics();
        if(this.graphics) {
            this.container.removeChild(this.graphics);
        }
        this.graphics = graphics;
        const joints = this.getJoints();
        graphics.beginFill(0xf2f8fa);
        graphics.lineStyle(2, 0x8cefa, 1);
        graphics.moveTo(joints[0][0], joints[0][1]);
        graphics.lineTo(joints[1][0], joints[1][1]);
        graphics.lineTo(joints[3][0], joints[3][1]);
        graphics.lineTo(joints[2][0], joints[2][1]);
        graphics.closePath();
        graphics.endFill();
        this.container.addChild(graphics)
    }
}
