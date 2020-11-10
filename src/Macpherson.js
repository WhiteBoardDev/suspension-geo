import * as PIXI from 'pixi.js'
import React from 'react';
import * as geometric from 'geometric';
import { Slider, Typography } from '@material-ui/core'

const width = 1000
const height = 1000

const jointSize = 4;

class VehicleFrontProfile {
    constructor(container) {
        const vehHeight = 400
        const vehWidthTop = 400
        const vehWidthBottom = 225
        this.angle = 0;
        this.container = container;
        this.vehOrigin = [350, 300];
        
        const thisRef = this;

        
        this.joints = [
            // 0 - top left
            [ this.vehOrigin[0], this.vehOrigin[1]]
           
        ];
        // 1 - top right
        this.joints.push([this.joints[0][0] + vehWidthTop, this.joints[0][1]]);
        // 2 - lower left
        this.joints.push([this.joints[0][0] + ((vehWidthTop - vehWidthBottom) /2), this.joints[0][1] + vehHeight]);
         // 3 - lower right   
        this.joints.push( [this.joints[2][0] + vehWidthBottom, this.joints[2][1]]);

        this.joints.forEach( function(value, index, array) {
            const rotated = geometric.pointRotate(value, thisRef.angle, thisRef.vehOrigin)
            array[index] = rotated;
        });        
    }

    getJoints() {
        return this.joints;
    }

    render() {
        const graphics = new PIXI.Graphics();
        if(this.graphics) {
            this.container.removeChild(this.graphics);
        }
        this.graphics = graphics;
        graphics.beginFill(0xFF3300);
        graphics.lineStyle(4, 0xffd900, 1);
        graphics.moveTo(this.joints[0][0], this.joints[0][1]);
        graphics.lineTo(this.joints[1][0], this.joints[1][1]);
        graphics.lineTo(this.joints[3][0], this.joints[3][1]);
        graphics.lineTo(this.joints[2][0], this.joints[2][1]);
        graphics.closePath();
        graphics.endFill();
        this.container.addChild(graphics)
    }
}


class LowerControlArm {

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


//stuck at some constant angle from wheel assembly
class Struct {
    constructor(container, wheelAssembly, boundedVehiclePointProvider, angleOnKnuckle) {
        this.container = container;
        this.boundedVehiclePointProvider = boundedVehiclePointProvider;
        this.angleOnKnuckle = angleOnKnuckle;
        this.wheelAssembly = wheelAssembly;
    }

    testConstraintsAndAdjust() {
        if(!this.constraintsMet()) {
            const angleOnKnuckle = this.angleOnKnuckle;
            const boundedVehiclePoint = this.boundedVehiclePointProvider();
            var strutAngle = geometric.lineAngle([ this.wheelAssembly.getJoints()[0], boundedVehiclePoint]) + 90;
            var expectedCamber = strutAngle - angleOnKnuckle;
            this.wheelAssembly.setCamber(expectedCamber);
            return false;
        }
        return true;
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
        graphics.lineStyle(3, 0xFADDFF, 1);
        graphics.moveTo(boundedVehiclePoint[0], boundedVehiclePoint[1]);
        graphics.lineTo(topKnucklePoint[0], topKnucklePoint[1]);

        container.addChild(graphics);
    }

    constraintsMet() {
            const strutAngle = geometric.lineAngle([ this.wheelAssembly.getJoints()[0], this.boundedVehiclePointProvider()]) + 90;
            const expectedCamber = strutAngle - this.angleOnKnuckle;
            const actualCamber = this.wheelAssembly.getCamber();
            return expectedCamber.toFixed(3) === actualCamber.toFixed(3)
    }

}

// The Hub Face is at x=0, y=0
class WheelAssembly {
    constructor(container, tireWidth, tireRatio, wheelSizeInch, wheelOffset, isLeft) {
        this.container = container;
        this.tireWidth = tireWidth;
        this.tireRatio = tireRatio;
        this.wheelSizeInch = wheelSizeInch;
        this.wheelOffset = wheelOffset;
        this.hubFaceCenterOrigin = [width/2 - 300,  height/2+ 100]; 
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


export default class Macpherson extends React.Component {
    constructor(props) {
        super(props); 
        this.pixi_cnt = null;
        this.app = new PIXI.Application({
            width: width, height: height, backgroundColor: 0x1099bb
        })  
    }

    testConstraintsAndAdjust() {
        var allConstraintsMet = false;
        while(!allConstraintsMet) {
            allConstraintsMet = true;
            this.constrainingComponents.forEach(function(value){
                if(!value.testConstraintsAndAdjust()) {
                    allConstraintsMet = false;
                }
            })
        }
        this.suspensionComponents.forEach(function(value) {
           value.render(); 
        });
    }

    setup() {

        const container = new PIXI.Container();

        this.app.stage.addChild(container);

        const vehicle = new VehicleFrontProfile(container)
        const lWheel = new WheelAssembly(container, 265, 45, 17, -30, true)
        const lStrut = new Struct(container, lWheel, function() { return vehicle.getJoints()[0]; }, 15)
        const lLowerControlArm = new LowerControlArm(container, lWheel, function() { return vehicle.getJoints()[2]; }, 200);

        this.lStrut = lStrut;
        this.lLowerControlArm = lLowerControlArm;

        this.constrainingComponents = [ lStrut, lLowerControlArm];
        this.suspensionComponents = [ lStrut, lLowerControlArm, lWheel, vehicle];
        this.testConstraintsAndAdjust();

    }
        
    updatePixiCnt = (element) => {
        // the element is the DOM object that we will use as container to add pixi stage(canvas)
        this.pixi_cnt = element;    //now we are adding the application to the DOM element which we got from the Ref.
        if(this.pixi_cnt && this.pixi_cnt.children.length<=0) {
           this.pixi_cnt.appendChild(this.app.view);       //The setup function is a custom function that we created to add the sprites. We will this below
           this.setup();
        } 
    };

      
    render() {

        const componentRef = this;

        return <div>
      <Slider
        defaultValue={160}
        aria-labelledby="discrete-slider-small-steps"
        step={1}
        marks
        onChange={function(event, value) {
            componentRef.lLowerControlArm.setArmAngle(value);
            componentRef.testConstraintsAndAdjust();
        }}
        min={100}
        max={200}
        valueLabelDisplay="off"
      />
      <div ref={this.updatePixiCnt} /></div>;
      }
}