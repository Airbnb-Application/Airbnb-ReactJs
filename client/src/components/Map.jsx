import L, { map } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

// const Map = (props) => {
//   const { center } = props;

//   return (
//     <MapContainer
//       center={center || [51.505, -0.09]}
//       zoom={center ? 4 : 2}
//       scrollWheelZoom={false}
//       className="h-[35vh] rounded-lg"
//     >
//       <TileLayer
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
//       {center && (
//         <Marker
//           position={center}
//         />
//       )}
//     </MapContainer>
//   );
// };

const Map = (props) => {

  const myIcon = L.Icon.extend({
    options: {
        // shadowUrl: 'leaf-shadow.png',
        // iconSize:     [50, 50],
        // iconAnchor:   [30, 94],
        shadowSize:   [50, 64],
        shadowAnchor: [4, 62],
        popupAnchor:  [-10, -76],
        iconSize: [36,36],
        iconAnchor: [12,36]
    }
});


  const centerMarkerIcon = new myIcon({iconUrl:'../public/red_marker.png'});

  const mapContainer = useRef();
  // const [map, setMap] = useState({});
  useEffect(() => {
    const map = L.map(mapContainer.current, {
      attributionControl: false,
      scrollWheelZoom: false
    }).setView(props.center || [51.505, -0.09], 8);

    // add layer
    const mainLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      {
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://carto.com/">carto.com</a> contributors',
      }
    );
    mainLayer.addTo(map);

    // add marker
    {props.center && (
      L.marker(props.center, {icon: centerMarkerIcon}).addTo(map)
    )}


    // unmount map function
    return () => {
      map.off()
      map.remove()
    } 
  }, [props.center]);

  return (
    <div
      style={{ padding: 0, margin: 0, width: "100%", height: "60vh" }}
      ref={(el) => (mapContainer.current = el)}
    ></div>
  );
};
export default Map;
