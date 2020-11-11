import React from 'react';
import { Slider, Typography } from '@material-ui/core'
import { System } from 'pixi.js';

export default class MeasurementPanel extends React.Component { 


    suspensionModelComponent(modelComponent, onMeasurementChange) {
        if(!modelComponent.measurements) {
            console("crap")
        }

        return <div>{modelComponent.getDisplayName()}
            {modelComponent.measurements.map( (measurement) => {
                return this.meaurementAdjuster(modelComponent, measurement, onMeasurementChange);   
            })}
        </div>
    }


    meaurementAdjuster(modelComponent, measurement, onMeasurementChange) {
        return <div>{measurement.getName()} <Slider
            defaultValue={160}
            aria-labelledby="discrete-slider-small-steps"
            step={1}
            marks
            onChange={function(event, value) {
                onMeasurementChange(measurement.getId(), value)
            }}
            min={100}
            max={200}
            valueLabelDisplay="off"
          /></div>
    }

    render() {

        

        return <div> The PRIMARY PANEL
            {this.props.modelComponents.map( (value) => { return this.suspensionModelComponent(value, this.props.onMeasurementChange); } )}
        </div>
    }
}