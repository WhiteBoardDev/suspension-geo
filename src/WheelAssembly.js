import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';
import Measurement from './Measurement';
import { v4 as uuidv4 } from 'uuid';
const jointSize = 4;

// The Hub Face is at x=0, y=0
export default class WheelAssembly {
    constructor(container, ground, isLeft) {
        this.id = uuidv4();
        this.container = container;
        this.ground = ground;
        this.isLeft = isLeft;
        this.hubFaceCenterOrigin = [200,  200]; 
        this.measurements = [
            new Measurement("Tire Width", 215, "mm", true, 0, 500),
            new Measurement("topKnuckleJointVerticalOffset", 120, "mm", true, 0, 1000),
            new Measurement("topKnuckleJointHorizontalOffset", 80, "mm", true, 0, 1000),
            new Measurement("lowerKnuckleJointVeritcalOffset", 50, "mm", true, 0, 1000),
            new Measurement("lowerKnuckleJointHorizontalOffset", 50, "mm", true, 0, 1000),
            new Measurement("camber", 0, "degrees", false, -60, 60),
            new Measurement("Wheel Diameter", 17, "in", true, 5, 25),
            new Measurement("Tire Ratio", 65, "percent", true, 10, 80),
            new Measurement("Wheel Offset", -30, "mm", true, -200, 200)
        ];
    }

    getId() { return this.id; } 
    
    getDisplayName() {
        var side = "Right";
        if(this.isLeft) {
            side = "Left";
        }
        return "Wheel Assembly " + side;
    }

    setCamber(camberAngle) {
        this.measurements[5].updateValue(camberAngle);
    }

    getCamber() { return this.measurements[5].getValue(); }

    render() {
        const container = this.container;
        const tireRatio = this.measurements[7].getValue();
        const wheelSize = this.measurements[6];
        const wheelSizePixles = wheelSize.getValueAsPixles();
        const wheelOffset = this.measurements[8];
        const camber = this.measurements[5].getValue();
        const tireWidthPixes = this.measurements[0].getValueAsPixles();
        const sideWallHeightPixels = tireWidthPixes * (tireRatio/100)
        const tireHeightPixels = (sideWallHeightPixels * 2) + wheelSizePixles
        
        var wheelOffsetPixles = wheelOffset.getValueAsPixles();
        if(!this.isLeft) {
            wheelOffsetPixles = -wheelOffsetPixles;
        }

        const hubFaceCenterOrigin = this.hubFaceCenterOrigin;
        
        
        const graphics = new PIXI.Graphics();

        if(this.graphics) {
            container.removeChild(this.graphics);      
        }
        this.graphics = graphics;

     
        //tire shape
        const tireOrigin = [
            -(tireWidthPixes / 2) + wheelOffsetPixles,
            -(tireHeightPixels / 2)
        ];
        graphics.lineStyle(2, 0x141414, 0.3);
        graphics.beginFill(0x141414, 0.1);
        graphics.drawRoundedRect(tireOrigin[0], tireOrigin[1], tireWidthPixes, tireHeightPixels, 16);
        graphics.endFill();

        //wheel
        const wheelOrigin = [
            -(tireWidthPixes / 2) + wheelOffsetPixles,
            -(wheelSizePixles / 2)
        ];
        graphics.lineStyle(1, 0xf5f5f2, 2);
        graphics.beginFill(0x51707a, 0.40);
        graphics.drawRoundedRect(wheelOrigin[0], wheelOrigin[1], tireWidthPixes, wheelSizePixles, 1);
        graphics.endFill();


        //hub center
        graphics.lineStyle(1, 0xe00408, 0.9);
        graphics.moveTo(0, -20);
        graphics.lineTo(0, 20);
        graphics.moveTo(-20, 0);
        graphics.lineTo(20, 0);

        //track width line
        const trackWidthXPosition = wheelOffsetPixles;
        graphics.lineStyle(2, 0x000000, 0.3, 0.5);
        graphics.moveTo(trackWidthXPosition, -tireHeightPixels * 0.7);
        graphics.lineTo(trackWidthXPosition, tireHeightPixels * 0.7);
       
        graphics.endFill();

        this.getJointsRelativeToHubFace().forEach(function(value) {
            graphics.lineStyle(0);
            graphics.beginFill(0xDE3249, 1);
            graphics.drawCircle(value[0], value[1], jointSize);
            graphics.endFill();

        });
        graphics.position.x = hubFaceCenterOrigin[0];
        graphics.position.y = hubFaceCenterOrigin[1];
        graphics.angle = camber;
        container.addChild(graphics);
    }

    xMoveRequest(value) {
        this.hubFaceCenterOrigin[0] += value;
    }

    getJoints() {
        const hubFaceCenterOrigin = this.hubFaceCenterOrigin;
        
        const tireRatio = this.measurements[7].getValue();
        const wheelSize = this.measurements[6];
        const wheelSizePixles = wheelSize.getValueAsPixles();
        const camber = this.measurements[5].getValue();
        const tireWidthPixes = this.measurements[0].getValueAsPixles();
        const sideWallHeightPixels = tireWidthPixes * (tireRatio/100)
        const tireHeightPixels = (sideWallHeightPixels * 2) + wheelSizePixles
        hubFaceCenterOrigin[1] = this.ground.groundYAxis - (tireHeightPixels / 2);
        
        const joints =  this.getJointsRelativeToHubFace();
        const rotatedJoints = joints.map( joint => {
            const translatedJoint = [ joint[0] + hubFaceCenterOrigin[0],  joint[1] + hubFaceCenterOrigin[1]];
            const rotated = geometric.pointRotate(translatedJoint, camber, hubFaceCenterOrigin)
            return rotated
        });

        return rotatedJoints;
    }

    testConstraintsAndAdjust() { return true; }

    getJointsRelativeToHubFace() {
        const topKnuckleJointVerticalOffsetPixel = this.measurements[1].getValueAsPixles();
        const topKnuckleJointHorizontalOffsetPixel = this.measurements[2].getValueAsPixles();
        const lowerKnuckleJointVeritcalOffsetPixel = this.measurements[3].getValueAsPixles();
        const lowerKnuckleJointHorizontalOffsetPixel = this.measurements[4].getValueAsPixles();
        if(this.isLeft) {
            return [ 
                // joint 0 - top knuckle
                [topKnuckleJointHorizontalOffsetPixel, -topKnuckleJointVerticalOffsetPixel],
                // joint 1 - lower knuckle
                [lowerKnuckleJointHorizontalOffsetPixel, lowerKnuckleJointVeritcalOffsetPixel]
             ];
        } else {
            return [ 
                // joint 0 - top knuckle
                [-topKnuckleJointHorizontalOffsetPixel, -topKnuckleJointVerticalOffsetPixel],
                // joint 1 - lower knuckle
                [-lowerKnuckleJointHorizontalOffsetPixel, lowerKnuckleJointVeritcalOffsetPixel]
             ];
        }
        
    }
}
