import React from 'react';
import { useSelector } from 'react-redux';
import './comp_styles.scss';
//Component for displaying info about generated routes, such as their distance and duration

const RouteList = () => {
  const routedata = useSelector((state) => state.routeLine.routeInfo);

  const formatDistance = (distance) => (distance / 1000).toFixed(2);
  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = (duration % 60).toFixed(0);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="route-list-container">
      {routedata.map((route, index) => (
        <div key={index} className="route-item">
          <strong>{index % 2 === 0 ? 'Primary Route' : 'Secondary Route'}</strong>
          <div className="route-info">
            <p>Distance: {formatDistance(route.distance)} km</p>
            <p>Duration: {formatDuration(route.duration)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RouteList;
