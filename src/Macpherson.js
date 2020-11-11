import * as PIXI from 'pixi.js'
import React from 'react';
import * as geometric from 'geometric';
import { Slider, Typography } from '@material-ui/core'
import Chassis from './Chassis'
import ControlArm from './ControlArm'
import WheelAssembly from './WheelAssembly'

const width = 1000
const height = 1000






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

        const vehicle = new Chassis(container)
        const lWheel = new WheelAssembly(container, 265, 45, 17, -30, true)
        const lStrut = new Struct(container, lWheel, function() { return vehicle.getJoints()[0]; }, 15)
        const lLowerControlArm = new ControlArm(container, lWheel, function() { return vehicle.getJoints()[2]; }, 200);

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