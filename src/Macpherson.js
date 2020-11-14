import * as PIXI from 'pixi.js'
import React from 'react';
import Chassis from './Chassis'
import ControlArm from './ControlArm'
import WheelAssembly from './WheelAssembly'
import Strut from './Strut'
import MeasurementPanel from './MeasurementPanel'
import Ground from './Ground'
import { Grid, Drawer } from '@material-ui/core'

const width = 1280
const height = 1000
const iterationLimitForConstraints = 1000;

export default class Macpherson extends React.Component {
    constructor(props) {
        super(props); 
        this.pixi_cnt = null;
        this.app = new PIXI.Application({
            width: width, height: height, backgroundColor: 0xFFFFFF
        })  
        
        const container = new PIXI.Container();
        this.app.stage.addChild(container);
        const ground = new Ground(container);
        const vehicle = new Chassis(container, ground)
        ground.render();
        const lWheel = new WheelAssembly(container, ground)
        const lStrut = new Strut(container, lWheel, function() { return vehicle.getJoints()[0]; }, 15)
        const lLowerControlArm = new ControlArm(container, 
            lWheel,
            function() { return vehicle.getJoints()[2]; }, 
            function() { return vehicle.measurements[0].getValue(); }, 
            function(point) { vehicle.moveRelative(point); },
            "Lower Left Control Arm"
        );
        this.state = { 
            modelComponents: [ lLowerControlArm, lStrut, lWheel, vehicle ] 
        };
        this.testConstraintsAndAdjust();
    }

    attemptConstrain(attemptNumber, modelComponents, onSuccess) {
        if(attemptNumber >= iterationLimitForConstraints) {
            throw new Error("Could not meet contraints of model");
        }
        const constrainedComps = modelComponents.filter( comp => comp.testConstraintsAndAdjust());
        if(constrainedComps.length === modelComponents.length) {
            onSuccess(constrainedComps);
        } else {
            this.testConstraintsAndAdjust(attemptNumber+1, modelComponents, onSuccess);
        }
    }

    testConstraintsAndAdjust() {
        const thisRef = this;
        this.attemptConstrain(0, this.state.modelComponents, function(constrainedComps){
            constrainedComps.forEach(function(value) {
                value.render(); 
             });
             thisRef.setState({ modelComponents: constrainedComps });
        });
    }

    onMeasurementChange(measurementId, value) {
        const modelComponents = this.state.modelComponents;
        modelComponents.forEach((component) => {
            component.measurements.forEach((measurement) => {
                if(measurement.getId() === measurementId) {
                    measurement.updateValue(value);
                }
            });
        });
        this.setState({ modelComponents: modelComponents }, () => { this.testConstraintsAndAdjust(); });
    }
        
    updatePixiCnt = (element) => {
        // the element is the DOM object that we will use as container to add pixi stage(canvas)
        this.pixi_cnt = element;    //now we are adding the application to the DOM element which we got from the Ref.
        if(this.pixi_cnt && this.pixi_cnt.children.length<=0) {
           this.pixi_cnt.appendChild(this.app.view);       //The setup function is a custom function that we created to add the sprites. We will this below
        } 
    };

    render() {
        return <Grid container direction="row" justify="center" alignItems="stretch" spacing={3}>
                    <Grid item xs={3}>
                    <Drawer variant="permanent">
                        <MeasurementPanel modelComponents={this.state.modelComponents} onMeasurementChange={(id, value) => { this.onMeasurementChange(id, value); }}></MeasurementPanel>
      </Drawer>
      </Grid>
      <Grid item xs={9}>
        <div ref={this.updatePixiCnt} /> 
      </Grid>
                </Grid>;
      }
}