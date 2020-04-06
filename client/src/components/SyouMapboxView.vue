<template>
  <div id="map"></div>
</template>

<script>
import DataProvider from "../DataProvider";
import * as mapboxgl from "mapbox-gl";
import * as d3 from 'd3';

export default {
  name: "mapbox-view",

  mounted() {

    this.map = "";
    this.mapInit(this);
    this.mapLoadGeojson(this);

    this.$root.$on("updateMapTopic", topic => {
      this.mapAddCircle(this.cell_info, topic);
    });

    this.$root.$on("addTopicCell", cell => {
      this.mapAddTopicCell(cell);
    });

    this.$root.$on("addMarker", cell => {
      this.mapAddMarker(cell);
    });

  },
  methods: {
    addRegion2Map(features) {
      this.map.addSource("region_json", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features.features
        }
      });

      this.map.addLayer({
        id: "region",
        type: "fill",
        source: "region_json",
        paint: {
          "fill-color": "#fff",
          "fill-opacity": 0.1
        },
        minzoom: 5,
        maxzoom: 20
      });

      this.map.addLayer({
        id: "region_boundry",
        type: "line",
        source: "region_json",
        paint: {
          "line-width": 3,
          "line-color": "rgb(8,15,27)"
        },
        minzoom: 5,
        maxzoom: 20
      });

      this.map.addLayer({
        id: "region-label",
        type: "symbol",
        source: "region_json",
        layout: {
          "text-field": "{name}",
          "text-size": 12
        },
        paint: {
          "text-color": "#fff"
        }
      });
    },

    mapInit(that) {
      mapboxgl.accessToken =
        "pk.eyJ1IjoiaG9uZ3l1amlhbmciLCJhIjoiY2s3N202NDIxMDhkdzNpcGg3djRtdnN4dCJ9.lysys8PBG25SxeHRF-sPvA";
      this.map = new mapboxgl.Map({
        container: "map", // container id
        style: "mapbox://styles/hongyujiang/cjl1ya0sn4m0m2sqj0pbkuqor", // stylesheet location
        center: [104.849, 31.558], // starting position [lng, lat]
        zoom: 8.5 // starting zoom
      });
    },
    mapLoadGeojson(that) {

      this.map.on("load", function() {

        that.$root.$emit('updateCellList') 

        that.loading = 123
        DataProvider.getRegionJson().then(response => {
          that.data = response.data;
          that.addRegion2Map(that.data);

          DataProvider.getCellInfo().then(response => {
            let cell_info = response.data;
            that.cell_info = cell_info;
            that.mapAddCircle(cell_info, 5);
            that.mapAddHeatmap();
          });
        });
      });
    },

    mapAddCircle(data, index) {
      let points = [];

      data.forEach(d => {
        //2 > 3, 3 > 0.9, 4 > 2,
        let threshold = 1;

        if (index == 0) threshold = 1;
        else if (index == 1) threshold = 1;
        else if (index == 2) threshold = 1;
        else if (index == 3) threshold = 1;
        else if (index == 4) threshold = 1;

        if (d.score[index] > threshold) {
          let meta = {};
          meta["properties"] = {};
          if (d.name.split("_").length > 1) d.name = d.name.split("_")[1];
          meta["properties"]["name"] = d.name;
          meta["properties"]["weight"] = d.score[5] * 3;
          meta["type"] = "Feature";
          meta["geometry"] = {};
          meta["geometry"]["type"] = "Point";
          meta["geometry"]["coordinates"] = [d.lon, d.lat];

          points.push(meta);
        }
      });

      if (this.map.getSource("cells") != null) {
        this.map.getSource("cells").setData({
          type: "FeatureCollection",
          features: points
        });
      } else {
        this.map.addSource("cells", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: points
          }
        });

        this.map.addLayer({
          id: "cells-circle",
          type: "circle",
          source: "cells",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              1,
              12,
              ["*", ["get", "weight"], 1],
              13,
              ["*", ["get", "weight"], 1.5]
            ],
            "circle-color": "#ccc",
            "circle-stroke-width": 0,
            "circle-stroke-color": "#fff"
          }
          //minzoom: 10,
        });

        this.map.addLayer({
          id: "cells-text",
          type: "symbol",
          source: "cells",
          layout: {
            "text-field": "{name}",
            // "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
            "text-offset": [0, 1.2],
            "text-anchor": "top"
          },
          paint: {
            "text-color": "#fff"
          },
          minzoom: 12
        });
      }
      this.map.on("click", "wubai-circle", function(e) {
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features[0].properties.name)
          .addTo(that.map);
      });
    },

    mapAddHeatmap() {
      this.map.addLayer(
        {
          id: "cells-heat",
          type: "heatmap",
          source: "cells",
          maxzoom: 12,
          paint: {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["get", "weight"],
              8,
              0.1,
              12,
              0.2
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              8,
              0.5,
              12,
              1
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              'rgba(0,0,0,0)',
              0.2,
              d3.interpolateSpectral(0.5),
              0.4,
              d3.interpolateSpectral(0.4),
              0.6,
              d3.interpolateSpectral(0.3),
              0.8,
              d3.interpolateSpectral(0.2),
              1,
              d3.interpolateSpectral(0.1),
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              5,
              8,
              8,
              15,
              10,
              20
            ],
            // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              9,
              1,
              11,
              0
            ]
          }
        },
      );
    },

    mapAddTopicCell(cell) {

      let that = this
   
      let size = 200;
  
      var pulsingDot = {
        
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),

        // get rendering context for the map canvas when layer is added to the map
        onAdd: function() {

          console.log(123)

          //let canvas = document.createElement('canvas');
          let canvas = d3.select('#animate');
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext('2d');
        },

        // called once before every frame where the icon will be used
        render: function() {
          console.log(123)
          var duration = 1000;
          var t = (performance.now() % duration) / duration;

          var radius = (size / 2) * 0.3;
          var outerRadius = (size / 2) * 0.7 * t + radius;
          var context = this.context;

          // draw outer circle
          context.clearRect(0, 0, this.width, this.height);
          context.beginPath();
          context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
          );
          context.fillStyle = "rgba(255, 200, 200," + (1 - t) + ")";
          context.fill();

          // draw inner circle
          context.beginPath();
          context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
          context.fillStyle = "rgba(255, 100, 100, 1)";
          context.strokeStyle = "white";
          context.lineWidth = 2 + 4 * (1 - t);
          context.fill();
          context.stroke();

          // update this image's data with data from the canvas
          this.data = context.getImageData(0, 0, this.width, this.height).data;

          // continuously repaint the map, resulting in the smooth animation of the dot
          this.map.triggerRepaint();

          // return `true` to let the map know that the image was updated
          return true;
        }
      };

      console.log(pulsingDot)

      this.map.addImage(cell.topic + '-dot', pulsingDot, { pixelRatio: 2 });

      console.log('source-' + cell.topic)

      let hehe = this.map.addSource('source-' + cell.topic, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [cell.lon, cell.lat]
              }
            }
          ]
        }
      });

      console.log(hehe)

      this.map.addLayer({
        id: cell.topic + '-point',
        type: "symbol",
        source: 'source-' + cell.topic,
        layout: {
          "icon-image": cell.topic + '-dot'
        }
      });
    },

    mapAddMarker(cell){

      var marker = new mapboxgl.Marker({'id':cell.name});
      marker.setLngLat([cell.lon, cell.lat]);
      //marker.setID(cell.name);
      marker.addTo(this.map);

    }
  },

  data() {
    return {
      data: [],
      loading: true
    };
  }
};
</script>

<style lang="css">
div #map {
  position: absolute;
  width: 100%;
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
}
</style>