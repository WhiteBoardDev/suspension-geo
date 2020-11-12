import React from 'react';
import { Slider, Input, Grid, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Typography} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


export default class MeasurementPanel extends React.Component { 

    measurementDisplay(modelComponent, measurement, onMeasurementChange) {

        if(measurement.userAdjustable) {
            return  <Accordion key={measurement.id}>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
            <Typography ><b>{measurement.getName()}</b> {measurement.getValue()} {measurement.getUnit()}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {this.adjustment(measurement, onMeasurementChange)}
            </AccordionDetails>
            </Accordion>
        } else {
            return  <Accordion key={measurement.id}>
            <AccordionSummary
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
            <Typography ><b>{measurement.getName()}</b> {measurement.getValue()} {measurement.getUnit()}</Typography>
            </AccordionSummary>
            </Accordion>
        }

       
    }

    adjustment(measurement, onMeasurementChange) {
            return  <Grid container spacing={2} alignItems="center"><Grid item xs={9}><Slider
            aria-labelledby="discrete-slider-small-steps"
            step={1}
            marks
            onChange={function(event, value) {
                onMeasurementChange(measurement.getId(), value)
            }}
            min={measurement.minValue}
            max={measurement.maxValue}
            valueLabelDisplay="off"
          /></Grid><Grid item xs={3}>
              <Input
            value={measurement.getValue()}
            margin="dense"
            onChange={function(event) {
                const value = parseInt(event.target.value)
                if(value >= measurement.minValue && value <= measurement.maxValue) {
                    onMeasurementChange(measurement.getId(), event.target.value)
                }
            }}
            inputProps={{
                step: 1,
                min: measurement.minValue,
                max:measurement.maxValue,
                type: 'number',
                'aria-labelledby': 'input-slider',
            }}
          /></Grid>
          </Grid>
    }



    render() {
        return <Grid item>
                    {this.props.modelComponents.map( (component) => { 
                        return <Grid key={component.id} item xs={12}>
                                    <Card><CardContent>
                                        <h2>{component.getDisplayName()}</h2>
                                        {component.measurements.map(measurement => this.measurementDisplay(component, measurement, this.props.onMeasurementChange))}
                                         </CardContent></Card>
                                 </Grid> } )}
      </Grid>
    }
}