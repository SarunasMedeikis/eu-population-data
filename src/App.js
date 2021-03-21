import logo from "./logo.svg";
import React from "react";
import "./App.css";
import {
  MapContainer,
  TileLayer,
  Polyline,
  FeatureGroup,
  Popup,
  GeoJSON,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

let EuCountriesBorders = require("./countries/european-union-countries.json");
let densityDataJson = require("./countries/densityData.json");
const purpleOptions = { color: "#22A7F0" };

function App() {
  const densityData =
    densityDataJson.CompactData["data:DataSet"]["data:Series"];

  // make new object with the added Density data
  let newEuCountriesBorders = EuCountriesBorders;
  EuCountriesBorders.features.map((item, index) => {
    let country = item.properties.wb_a2;
    densityData.map((densityItem) => {
      if (densityItem["-geo"] === country) {
        newEuCountriesBorders.features[index].properties.density =
          densityItem["data:Obs"][7]["-OBS_VALUE"];
      }
    });
  });

  function getColours(d) {
    return d > 200
      ? "#0868ac"
      : d > 100
      ? "#43a2ca"
      : d > 50
      ? "#7bccc4"
      : d > 10
      ? "#bae4bc"
      : "#f0f9e8";
  }
  function getStyles(feature) {
    return {
      fillColor: getColours(feature.properties.density),
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.5,
    };
  }

  function onEachFeature(feature, layer) {
    const popupContent = `
                         ${feature.properties.formal_en}
                         <br>Country code: ${feature.properties.adm0_a3}
                         <br> Population per square km: ${feature.properties.density}
                         <br> `;

    if (feature.properties && feature.properties.popupContent) {
      popupContent += feature.properties.popupContent;
    }
    layer.bindPopup(popupContent);
  }

  const geoJsonRef = React.useRef(null);

  return (
    <div id="mapid">
      <MapContainer
        center={[49.845556, 9.906111]}
        zoom={4}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          key="my-geojson"
          data={newEuCountriesBorders}
          style={getStyles}
          ref={geoJsonRef}
          onEachFeature={onEachFeature}
          eventHandlers={{
            mouseover: (event) => {
              console.log(event);
              event.layer.setStyle({
                weight: 2,
                color: "#ff6b81",
                dashArray: "",
                fillOpacity: 0.7,
                fillColor: "#ff6b81",
              });
            },
            mouseout: (event) => {
              geoJsonRef.current.resetStyle(event.layer);
            },
          }}
        />
      </MapContainer>
    </div>
  );
}

export default App;
