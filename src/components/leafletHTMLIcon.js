
import Leaflet from 'leaflet';


const myCustomColour = '#148530';
const endColor = '#9e1b16';

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
  popupAnchor: [0, -36],
  html: `<span style="${markerHtmlStyles}">
           <span style="${whiteCircleStyles}"></span>
         </span>`
});

export const desti_icon = Leaflet.divIcon({
    className: "my-custom-pin",
    iconAnchor: [0, 3],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -36],
    html: `<span style="${markerHtmlStylese}">
             <span style="${whiteCircleStyles}"></span>
           </span>`
  });