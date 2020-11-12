import * as PIXI from 'pixi.js'
import React from 'react';
import Chassis from './Chassis'
import ControlArm from './ControlArm'
import WheelAssembly from './WheelAssembly'
import Strut from './Strut'
import MeasurementPanel from './MeasurementPanel'
import { Grid, Drawer } from '@material-ui/core'

const width = 1280
const height = 1000

export default class Macpherson extends React.Component {
    constructor(props) {
        super(props); 
        this.pixi_cnt = null;
        this.app = new PIXI.Application({
            width: width, height: height, backgroundColor: 0xFFFFFF
        })  
        
        const container = new PIXI.Container();
        this.app.stage.addChild(container);
        const vehicle = new Chassis(container)
        const lWheel = new WheelAssembly(container)
        const lStrut = new Strut(container, lWheel, function() { return vehicle.getJoints()[0]; }, 15)
        const lLowerControlArm = new ControlArm(container, 
            lWheel,  // TODO push the chassis around instead of the wheel assembly
            function() { return vehicle.getJoints()[2]; }, 
            function() { return vehicle.measurements[0].getValue(); }, 
            "Lower Left Control Arm"
        );
        this.state = { 
            modelComponents: [ lLowerControlArm, lStrut, lWheel, vehicle ] 
        };
        this.testConstraintsAndAdjust();
    }

    testConstraintsAndAdjust() {
        var allConstraintsMet = false;
        const modelComponents = this.state.modelComponents;
        while(!allConstraintsMet) {
            allConstraintsMet = true;
            modelComponents.forEach(function(value){
                if(!value.testConstraintsAndAdjust()) {
                    allConstraintsMet = false;
                }
            })
        }
        modelComponents.forEach(function(value) {
           value.render(); 
        });

        this.setState({ modelComponents: modelComponents });
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

      //<Grid item xs={3}><MeasurementPanel modelComponents={this.state.modelComponents} onMeasurementChange={(id, value) => { this.onMeasurementChange(id, value); }}></MeasurementPanel></Grid>
              
      
    render() {



        return <Grid container direction="row" justify="left" alignItems="stretch" spacing={3}>
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