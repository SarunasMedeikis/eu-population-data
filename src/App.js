import React from "react";
import "./App.css";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

let EuCountriesBorders = require("./countries/european-union-countries.json");
let densityDataJson = require("./countries/densityData.json");

function Legend({ getColours }) {
  let grades = [0, 10, 50, 100, 200];

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <div className="info legend">
          <p>
            <strong>Population density</strong>
          </p>
          {grades.map((density) => {
            return (
              <div className="legend-item">
                <i style={{ background: `${getColours(density)}` }}></i>
                <span>{density}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function App() {
  const densityData =
    densityDataJson.CompactData["data:DataSet"]["data:Series"];

  // make new object with the added Density data
  let newEuCountriesBorders = EuCountriesBorders;
  EuCountriesBorders.features.map((item, index) => {
    let country = item.properties.wb_a2;
    densityData.map((densityItem) => {
      if (densityItem["-geo"] == "EL" && country === "GR") {
        newEuCountriesBorders.features[index].properties.density =
          densityItem["data:Obs"][7]["-OBS_VALUE"];
      }
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
    let popupContent = `
                         ${feature.properties.formal_en}
                         <br>Country code: ${feature.properties.adm0_a3}
                         <br> Population density per km&#178; : ${feature.properties.density}
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
        scrollWheelZoom={false}
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
        <Legend getColours={getColours} />
      </MapContainer>
    </div>
  );
}

export default App;
