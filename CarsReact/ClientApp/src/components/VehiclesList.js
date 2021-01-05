import './Map.css'
import React, { Component } from 'react';
import {Circle, Fill, Style} from 'ol/style';
import {fromLonLat} from 'ol/proj';
import {Feature} from 'ol/index';
import {Point} from 'ol/geom';
import { Col, Grid, Row } from 'react-bootstrap';


import MapWrapper from "./MapWrapper";

export class VehiclesList extends Component {
  displayName = VehiclesList.name
  intervalID = 0;
  //  radius of features that display vehicles
  vehicleRadius = 7;

  constructor(props) {
    super(props);
    this.state = { carsstore: null, loading: true, selectedVehicle : null, featureArray: [] };
    this.vehicleSelect = this.vehicleSelect.bind(this);
    this.vehicleSelectClear = this.vehicleSelectClear.bind(this);
  }

    componentDidMount() {
        // initial data fetching
        this.getData();

        // fetch vehicles coordinates every minute
        this.intervalID = setInterval(this.getData, 60000);
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }    

    getData = () => {
      if (this.props.user != null) {
          console.log(this.props.user.userid);
          fetch(`api/Data/GetCarsCoords?userId=${this.props.user.userid}`)
              .then(response => response.json())
              .then(data => {
                  this.setState({carsstore: data, loading: false});
                  this.buildFeatures();
              });
      }
    }    
 
   buildFeatures()
    {
        var featureArray = [];
        if (this.state.carsstore != null) {
            {this.state.carsstore.data.map(car => {

                    var lonlat = [car.lon, car.lat]
                    var place = fromLonLat(lonlat);
                    var point = new Point(place);
                    var feature = new Feature(point);
                    // finding information about vehicle (make, model, color, etc) 
                    let newcar = this.props.user.vehicles.find(element => element.vehicleid === car.vehicleid);
                    feature.set('Car', newcar);
                    
                    // get address from coordinates by reverse geo
                    fetch(`api/Data/GetAddress?lat=${car.lat}&lon=${car.lon}`)
                        .then(response => response.json())
                        .then(data => {
                            feature.set('Address', data);
                    });
                    // creating vehicle style on map
                    var style =  new Style({
                        image: new Circle({
                            radius: this.vehicleRadius,
                            fill: new Fill({color: newcar.color}),
                        }),
                    });
                    feature.setStyle(style);
                    featureArray.push(feature);
                }
            )}}
        // put vehicles on map
        this.setState({featureArray: featureArray});
    }

    vehicleSelect(vehicle) 
    {
        this.setState({selectedVehicle : vehicle});
    }
    
    vehicleSelectClear()
    {
        this.setState({selectedVehicle : null});
    }

    renderCarsTable() {
     return (
            <div>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Make</th>
                            <th>Model</th>
                            <th>Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.user.vehicles.map(car => {
                            return <tr key={car.vehicleid}>
                                <td><img alt={car.make} src={car.foto} width="100" height="100"/></td>
                                <td>{car.make}</td>
                                <td>{car.model}</td>
                                <td>{car.year}</td>
                                <td><input type="button" value="Select" onClick={() => this.vehicleSelect(car)}/></td>
                            </tr>
                            }
                        )}
                    </tbody>
                </table>
                <input type="button" value="Back" onClick={this.props.back}/>
            </div>
        );
    }
  
  render() {
      let contents = this.state.loading
          ? <p><em>Loading...</em></p>
          :  this.renderCarsTable();
      return (
   
        <Grid fluid>
            <Row>
                <Col sm={3}>
                    {contents}
                </Col>
                <Col sm={9}>
                    <MapWrapper features={this.state.featureArray} selectedVehicle={this.state.selectedVehicle} clearSelectedVehicle={this.vehicleSelectClear}/>
                </Col>
            </Row>
        </Grid>
    )
  }
}
