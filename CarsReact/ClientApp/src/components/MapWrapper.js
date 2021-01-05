import React, { useState, useEffect, useRef } from 'react';

import Map from 'ol/Map'
import View from 'ol/View'
import Overlay from 'ol/Overlay';
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import {fromLonLat} from 'ol/proj';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Polygon} from 'ol/geom';
import {Feature} from 'ol/index';

function MapWrapper(props) {

    const [ map, setMap ] = useState()
    const [featureSource, setFeatureSource ] = useState()
    const [selected, setSelected] = useState()
    const [previousFeatures, setPreviousFeatures] = useState()

    // initial map center point
    const latlonCenter = [24.127273, 56.991881]
    const initialCenter = fromLonLat(latlonCenter);
    // initial zoom
    const initialZoom = 15;
    
    const mapElement = useRef()
    const popup = useRef()
    const closer = useRef()
    const mapRef = useRef()
    const selectedRef = useRef()
    selectedRef.current = selected
    mapRef.current = map

    // initialize map on first render
    useEffect( () => {
        setPreviousFeatures([]);
        const sourceV = new VectorSource();
        var overlay = new Overlay({
            id : 1,
            element: popup.current,
            autoPan: true,
            autoPanAnimation: {
                duration: 100,
            },
        });

        const initalFeaturesLayer = new VectorLayer({
            source: sourceV
        })

        const initialMap = new Map({
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
                initalFeaturesLayer
            ],
            target: mapElement.current,
            view: new View({
                center: initialCenter,
                zoom: initialZoom,
            }),
            overlays: [overlay],
            controls: []
        })

        initialMap.on('click', handleMapClick)

        closer.current.onclick = function () {
            mapRef.current.getOverlayById(1).setPosition(undefined);
            closer.current.blur();
            return false;
        };        
        setMap(initialMap)
        setFeatureSource(sourceV)
    },[])
    
    useEffect( () => {
        var pointsArray = [];
        if (props.features.length) {
            // before put new vehicles clear previous vehicles from map
            if (previousFeatures.length)
            {
                while (previousFeatures.length>0)
                {
                    var removedFeat = previousFeatures.pop();
                    featureSource.removeFeature(removedFeat);
                }
            }
            props.features.map(feature => {
                pointsArray.push(feature.getGeometry().getCoordinates());
                featureSource.addFeature(feature);
                previousFeatures.push(feature);
                }                
            )
            pointsArray.push(props.features[0].getGeometry().getCoordinates());
        }
        // if we have only one vehicle on map just center it
        if (props.features.length === 1)
        {
            var point = props.features[0].getGeometry();
            map.getView().setCenter(point.getCoordinates());
        }
        // fit all vehicles on map
        if (props.features.length > 1) {
            var polygon = new Polygon([pointsArray]);
            var feat = new Feature({geometry: polygon});
            var geom = feat.getGeometry();
            var mapSize = [];
            mapSize.push(map.getSize()[0]-50);
            mapSize.push(map.getSize()[1]-50);
            map.getView().fit(geom, {size: mapSize});
        }
    },[props.features])

    // select vehicle from grid
    useEffect( () => {
        if (props.selectedVehicle != null) {
            var feat = null;
            // finding corresponding vehicle feature
            props.features.forEach((feature) => {
                if (feature.get('Car').vehicleid === props.selectedVehicle.vehicleid)
                {
                    feat = feature;
                }
            })
            if (feat != null) {
                if (selectedRef.current != null) {
                    mapRef.current.getOverlayById(1).setPosition(undefined);
                    setSelected(null);
                }
                mapRef.current.getOverlayById(1).setPosition(feat.getGeometry().getCoordinates());
                mapRef.current.getView().setCenter(feat.getGeometry().getCoordinates());
                setSelected(feat);
            }
            // clear selection
            props.clearSelectedVehicle();
        }
    },[props.selectedVehicle])

    // click on map
    const handleMapClick = (event) => {
        if (selectedRef.current != null) {
            mapRef.current.getOverlayById(1).setPosition(undefined);
            setSelected(null);
        }
        mapRef.current.forEachFeatureAtPixel(event.pixel, function (f) {
            setSelected(f);
            if (f != null) {
                mapRef.current.getOverlayById(1).setPosition(event.coordinate);
                mapRef.current.getView().setCenter(f.getGeometry().getCoordinates());
            }
            return true;
        });
    }

function RenderPopupText()
{
    if (selected == null)
    {
        return (<div/>)
    }
    else 
    {
        let addr = "";
        if (selected.get('Address') != null) {
            addr = (selected.get('Address').display_name);
        }
        return (
            <div >
                <p>Car:{(selected.get('Car').make)}</p>
                <p>Model: {(selected.get('Car').model)}</p>
                <p>Address: {addr}</p>
                <p><img alt={(selected.get('Car').make)} src={(selected.get('Car').foto)} width="100" height="100"/></p>
            </div>
        )
    }
}

    // render component
    return (
        <div>
            <div ref={mapElement} className="map-container"/>
            <div ref={popup} className="ol-popup">
                <a href="#" ref={closer} className="ol-popup-closer"/>
               <RenderPopupText/>
            </div>
        </div>
    )
}

export default MapWrapper