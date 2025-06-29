
import Leaflet from 'leaflet';

//Custom icons for leaflet markers used as start and destination position. Can be modifed as needed
const myCustomColour = '#148530';
const endColor = '#9e1b16';
const disColor = '#ff001f';

const markerHtmlStyles = `
  background-color: ${myCustomColour};
  width: 2rem;
  height: 2rem;
  display: block;
  left: -1.5rem;
  top: -1.5rem;
  position: relative;
  border-radius: 3rem 3rem 0;
  transform: rotate(45deg);
  border: 1px solid #FFFFFF;
  position: relative;
`;

const markerHtmlStylese = `
  background-color: ${endColor};
  width: 2rem;
  height: 2rem;
  display: block;
  left: -1.5rem;
  top: -1.5rem;
  position: relative;
  border-radius: 3rem 3rem 0;
  transform: rotate(45deg);
  border: 1px solid #FFFFFF;
  position: relative;
`;

const markerHtmlDis = `
  background-color: ${disColor};
  width: 2rem;
  height: 2rem;
  display: block;
  left: -1.5rem;
  top: -1.5rem;
  position: relative;
  border-radius: 3rem 3rem 0;
  transform: rotate(45deg);
  border: 1px solid #FFFFFF;
  position: relative;
`;

const whiteCircleStyles = `
  content: '';
  position: absolute;
  width: 1rem;
  height: 1rem;
  background-color: white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const startti_icon = Leaflet.divIcon({
  className: "my-custom-pin",
  iconAnchor: [0, 3],
  labelAnchor: [-6, 0],
  popupAnchor: [-7, -20],
  html: `<span style="${markerHtmlStyles}">
           <span style="${whiteCircleStyles}"></span>
         </span>`
});

export const desti_icon = Leaflet.divIcon({
    className: "my-custom-pin",
    iconAnchor: [0, 3],
    labelAnchor: [-6, 0],
    popupAnchor: [-7, -20],
    html: `<span style="${markerHtmlStylese}">
             <span style="${whiteCircleStyles}"></span>
           </span>`
  });

export const dis_icon = Leaflet.divIcon({
    className: "my-custom-pin",
    iconAnchor: [0, 3],
    labelAnchor: [-6, 0],
    popupAnchor: [-7, -20],
    html: `<span style="${markerHtmlDis}">
             <span style="${whiteCircleStyles}"></span>
           </span>`
  });