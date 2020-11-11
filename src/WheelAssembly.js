import * as PIXI from 'pixi.js'
import * as geometric from 'geometric';

const jointSize = 4;

// The Hub Face is at x=0, y=0
export default class WheelAssembly {
    constructor(container, tireWidth, tireRatio, wheelSizeInch, wheelOffset, isLeft) {
        this.container = container;
        this.tireWidth = tireWidth;
        this.tireRatio = tireRatio;
        this.wheelSizeInch = wheelSizeInch;
        this.wheelOffset = wheelOffset;
        this.hubFaceCenterOrigin = [200,  200]; 
        this.camber = 0;

        this.renderConstant = 0.4

        const topKnuckleJointVerticalOffsetMM = 100;
        const topKnuckleJointHorizontalOffsetMM = 80;
        const lowerKnuckleJointVeritcalOffsetMM = 100;
        const lowerKnuckleJointHorizontalOffsetMM = 50;

        this.topKnuckleJointVerticalOffsetPixel = topKnuckleJointVerticalOffsetMM * this.renderConstant;
        this.topKnuckleJointHorizontalOffsetPixel = topKnuckleJointHorizontalOffsetMM * this.renderConstant;
        this.lowerKnuckleJointVeritcalOffsetPixel = lowerKnuckleJointVeritcalOffsetMM * this.renderConstant;
        this.lowerKnuckleJointHorizontalOffsetPixel = lowerKnuckleJointHorizontalOffsetMM * this.renderConstant;
    }

    setCamber(camber) {
        this.camber = camber;
    }

    getCamber() { return this.camber; }

    moveRelative(point) {
        this.hubFaceCenterOrigin[0] += point[0];
        this.hubFaceCenterOrigin[1] += point[1];
    }

    render() {
        const container = this.container;
        const tireWidth = this.tireWidth;
        const tireRatio = this.tireRatio;
        const wheelSizeInch = this.wheelSizeInch;
        const wheelOffset = this.wheelOffset;
        const camber = this.camber;
        const renderConstant = this.renderConstant;
        const sideWallHeight = tireWidth * (tireRatio/100)
        const wheelSizeInMM = wheelSizeInch * 25.4
        const tireHeightMM = (sideWallHeight * 2) + wheelSizeInMM
        
        const tireHeightPixels = tireHeightMM * renderConstant
        const wheelOffsetPixles = wheelOffset * renderConstant;
        this.tireWidthPixes = tireWidth * renderConstant
    
        const hubFaceCenterOrigin = this.hubFaceCenterOrigin;
        
        
        const graphics = new PIXI.Graphics();

        if(this.graphics) {
            container.removeChild(this.graphics);      
        }
        this.graphics = graphics;

     
        //tire shape
        const tireOrigin = [
            -(this.tireWidthPixes / 2) + wheelOffsetPixles,
            -(tireHeightPixels / 2)
        ];
        graphics.lineStyle(2, 0xFF00FF, 1);
        graphics.beginFill(0x650A5A, 0.25);
        graphics.drawRoundedRect(tireOrigin[0], tireOrigin[1], this.tireWidthPixes, tireHeightPixels, 16);
        graphics.endFill();


        //hub center
        graphics.lineStyle(3, 0xEEEEEE, 0.3, 0.5);
        graphics.moveTo(0, -10);
        graphics.lineTo(0, 10);
        graphics.moveTo(-10, 0);
        graphics.lineTo(10, 0);

        //track width line
        const trackWidthXPosition = wheelOffsetPixles;
        graphics.lineStyle(2, 0x000000, 0.3, 0.5);
        graphics.moveTo(trackWidthXPosition, -200);
        graphics.lineTo(trackWidthXPosition, 200);
       
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

    getJoints() {
        const hubFaceCenterOrigin = this.hubFaceCenterOrigin;
        const camber = this.camber;
        const joints =  this.getJointsRelativeToHubFace();
        const rotatedJoints = joints.map( joint => {
            const translatedJoint = [ joint[0] + hubFaceCenterOrigin[0],  joint[1] + hubFaceCenterOrigin[1]];
            const rotated = geometric.pointRotate(translatedJoint, camber, hubFaceCenterOrigin)
            return rotated
        }
        );

        return rotatedJoints;
    }

    getJointsRelativeToHubFace() {
        return [ 
            // joint 0 - top knuckle
            [this.topKnuckleJointHorizontalOffsetPixel, -this.topKnuckleJointVerticalOffsetPixel ],
            // joint 1 - lower knuckle
            [this.lowerKnuckleJointHorizontalOffsetPixel, this.lowerKnuckleJointVeritcalOffsetPixel]
         ];
    }
}
