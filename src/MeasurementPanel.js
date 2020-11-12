import React from 'react';
import { Slider, Input, Grid, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Typography} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


export default class MeasurementPanel extends React.Component { 


    suspensionModelComponent(modelComponent, onMeasurementChange) {
        
        return <Grid item xs={12} spacing={3}>
             <Card ><CardContent>
                 <h2>{modelComponent.getDisplayName()}</h2>
                    {modelComponent.measurements.map(measurement => this.meaurementDisplay(modelComponent, measurement, onMeasurementChange))}
            </CardContent></Card>
        </Grid>
    }


    meaurementDisplay(modelComponent, measurement, onMeasurementChange) {

        if(measurement.userAdjustable) {
            return  <Accordion>
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
            return  <Accordion>
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
            return  <Grid container spacing={2} xs={12} alignItems="center"><Grid item xs={9}><Slider
            defaultValue={measurement.getValue()}
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
                const value = event.target.value
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
        return <Grid container item xs={12} spacing={1}  direction="column">
                    {this.props.modelComponents.map( (value) => { return this.suspensionModelComponent(value, this.props.onMeasurementChange); } )}
      </Grid>
    }
}