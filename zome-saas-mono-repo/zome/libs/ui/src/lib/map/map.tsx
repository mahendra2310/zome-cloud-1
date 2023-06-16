import React, { useState } from 'react';
//  import ReactMapboxGl, { Layer, Feature,  } from 'react-mapbox-gl';

import './map.module.less';
import Map, { Marker, Popup } from 'react-map-gl';
import Link from 'next/link';
import Pin from './mapgl/pin';
import { Router } from 'next/router';


/* eslint-disable-next-line */
export interface MapProps { }
// const Maps = ReactMapboxGl({
//   accessToken:
//     'pk.eyJ1IjoicHJpdGVzaGFraGFqYTAxIiwiYSI6ImNrcHF3dmx1YTAycjMybm1uejdmOTZ4bmwifQ.Ovmm2aEo1qr88lpD3x1dBA',
// });


export function MapComponent({ locations }) {
  const [viewport, setViewport] = useState({
    // The latitude and longitude of the usa
    latitude: 43.031757,
    longitude: -104.183039,
    zoom: 3,
  });

  const [selectLocation, setSelectedLocation] = useState<{ [key: string]: any; }>({});
  return (
    <Map
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxApiAccessToken="pk.eyJ1IjoicHJpdGVzaGFraGFqYTAxIiwiYSI6ImNrcHF3dmx1YTAycjMybm1uejdmOTZ4bmwifQ.Ovmm2aEo1qr88lpD3x1dBA"
      width="100vw"
      height="100vh"
      {...viewport}
      onViewportChange={(nextViewport) => setViewport(nextViewport)}
    >
      {locations.map((location) => (
        <div key={location._id}>
          <Marker latitude={location.latitude} longitude={location.longitude}>
            <a
              onClick={() => {
                setSelectedLocation(location);
              }}
            >
              <span role="img" aria-label="push-pin">
                <Pin />
              </span>
            </a>
          </Marker>
          {selectLocation._id === location._id ? (
            <Popup
              onClose={() => setSelectedLocation({})}
              closeOnClick={false}
              latitude={location.latitude}
              longitude={location.longitude}
            >
              {location.name}
              <br />
              {<Link href="/properties">click here to view property</Link>}
            </Popup>
          ) : (
            false
          )}
        </div>
      ))}
    </Map>
  );
}

export default MapComponent;
