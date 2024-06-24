import React from 'react';
import { useSelector } from 'react-redux';

const RouteList = () => {
  const routedata = useSelector((state) => state.routeLine.routeInfo);
    //console.log("routedata", routedata);
  const formatDistance = (distance) => {
    return (distance / 1000).toFixed(2); // Convert meters to kilometers and round to 2 decimal places
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = (duration % 60).toFixed(0);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div>
      {routedata.map((route, index) => (
        <div key={index} style={{ marginBottom: '20px', marginLeft: '73%' }}>
          <h3>{index % 2 === 0 ? 'Primary Route' : 'Secondary Route'} </h3>
          <p id='distval'>Distance: {formatDistance(route.distance)} km</p>
          <p id='durval'>Duration: {formatDuration(route.duration)}</p>
        </div>
      ))}
    </div>
  );
};

export default RouteList;