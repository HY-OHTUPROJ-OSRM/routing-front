import React from 'react';
import { useSelector } from 'react-redux';
import './comp_styles.scss';
//Component for displaying info about generated routes, such as their distance and duration

const RouteList = () => {
  const routedata = useSelector((state) => state.routeLine.routeInfo);
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
        <div
          key={index}
          style={{
            marginBottom: '20px',
            marginLeft: '73%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <strong>{index % 2 === 0 ? 'Primary Route' : 'Secondary Route'}</strong>
          <div className="route-info">
            <p id='distval'>Distance: {formatDistance(route.distance)} km</p>
            <p id='durval'>Duration: {formatDuration(route.duration)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RouteList;