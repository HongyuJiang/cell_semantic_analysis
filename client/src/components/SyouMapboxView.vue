<template>
  <div id="map"></div>
</template>

<script>
import DataProvider from "../DataProvider";
import * as mapboxgl from "mapbox-gl";
import * as d3 from "d3";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import $ from "jquery";

export default {
  name: "mapbox-view",

  mounted() {
    this.map = "";
    this.mapInit(this);
    this.mapLoadGeojson(this);

    this.$root.$on("updateMapTopic", (counter) => {
      this.mapAddCircle(this.cell_info, counter);
      this.mapAddHeatmap();
    });

    this.$root.$on("addTopicCell", (cell) => {
      this.mapAddTopicCell(cell);
    });

    this.$root.$on("addMarker", (cell) => {
      this.mapAddMarker(cell);
    });
  },
  methods: {
    addRegion2Map(features) {
      this.map.addSource("region_json", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features.features,
        },
      });

      this.map.addLayer({
        id: "region",
        type: "fill",
        source: "region_json",
        paint: {
          "fill-color": "#fff",
          "fill-opacity": 0.15,
        },
        minzoom: 5,
        maxzoom: 20,
      });

      this.map.addLayer({
        id: "region_boundry",
        type: "line",
        source: "region_json",
        paint: {
          "line-width": 3,
          "line-color": "rgb(8,15,27)",
        },
        minzoom: 5,
        maxzoom: 20,
      });

      this.map.addLayer({
        id: "region-label",
        type: "symbol",
        source: "region_json",
        layout: {
          "text-field": "{name}",
          "text-size": 12,
        },
        paint: {
          "text-color": "#fff",
        },
      });
    },

    mapInit(that) {
      mapboxgl.accessToken =
        "pk.eyJ1IjoiaG9uZ3l1amlhbmciLCJhIjoiY2s3N202NDIxMDhkdzNpcGg3djRtdnN4dCJ9.lysys8PBG25SxeHRF-sPvA";
      this.map = new mapboxgl.Map({
        container: "map", // container id
        style: "mapbox://styles/hongyujiang/cjl1ya0sn4m0m2sqj0pbkuqor", // stylesheet location
        center: [104.849, 31.558], // starting position [lng, lat]
        zoom: 8.5, // starting zoom
      });

      d3.selectAll(".mapboxgl-control-container").style("z-index", 9999);
    },
    mapLoadGeojson(that) {
      this.map.on("load", function () {
        that.$root.$emit("updateCellList");

        that.loading = 123;
        DataProvider.getRegionJson().then((response) => {
          that.data = response.data;
          that.addRegion2Map(that.data);

          DataProvider.getCellInfo().then((response) => {
            let cell_info = response.data;
            that.cell_info = cell_info;
          });
        });

        that.map.on("move", function (e) {
          if (!d3.select("#selection").empty()) {
            let selection = d3.select("#selection");
            let lat = selection.attr("lat");
            let lng = selection.attr("lng");

            let new_pos = that.map.project(new mapboxgl.LngLat(lng, lat));

            selection.attr("cx", new_pos.x);
            selection.attr("cy", new_pos.y);

            d3.select('#ringContainer')
            .attr('transform', 'translate(' + new_pos.x + ',' + new_pos.y + ')')
          }
        });

        that.map.on("click", function (e) {
          let s_point = e.point;
          let point = e.lngLat.wrap();

          let canvas = that.map.getCanvasContainer();

          let selected_cell_list = [];

          for (let cell in that.cell_info) {
            let cc = that.cell_info[cell];

            let pos = that.map.project(new mapboxgl.LngLat(cc.lon, cc.lat));

            let dx = (s_point.x - pos.x) * (s_point.x - pos.x);

            let dy = (s_point.y - pos.y) * (s_point.y - pos.y);

            let dis = Math.sqrt(dx + dy);

            if (dis < 20) {
              selected_cell_list.push(cell);
            }
          }

          let ring_width = 150, ring_height = 150
          const radius = Math.min(ring_width, ring_height) / 2;

          let arc = d3.arc()
              .innerRadius(radius * 0.57)
              .outerRadius(radius - 1);
  
          let pie = d3
            .pie()
            .padAngle(0.005)
            .sort(null)
            .value((d) => d.value);

          $.post("http://localhost:4000/cells/", {
            cells: selected_cell_list,
          }).done(function (data) {
            let hourData = JSON.parse(data);
            d3.select("#d3-canvas").remove();

            let svg = d3
              .select(canvas)
              .append("svg")
              .attr("id", "d3-canvas")
              .style("position", "absolute")
              .attr("width", "1800px")
              .attr("height", "1000px");

            svg
              .append("circle")
              .attr("id", "selection")
              .attr("r", 20)
              .attr("cx", s_point.x)
              .attr("cy", s_point.y)
              .attr("fill", "white")
              .attr("opacity", 0.5)
              .attr("stroke", "black")
              .attr("stroke-width", 4)
              .attr("lat", point["lat"])
              .attr("lng", point["lng"]);

            let pieData = [];

            for (let hour in hourData) {
              pieData.push({ name: hour, value: hourData[hour] });
            }

            let color = d3.scaleOrdinal()
            .domain(pieData.map(d => d.name))
            .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), pieData.length).reverse())

            const arcs = pie(pieData);

            let ringContainer = svg.append('g')
            .attr('id', 'ringContainer')
            .attr('transform', 'translate(' + s_point.x + ',' + s_point.y + ')')

            ringContainer
              .selectAll(".hehe")
              .data(arcs.filter((d) => d.endAngle - d.startAngle > 0.1))
              .enter()
              .append("path")
              .attr("fill", (d) => color(d.data.name))
              .attr('stroke', 'rgb(34,38,47)')
              .attr('stroke-width', 2)
              .attr("d", arc)
              .append("title")
              .text((d) => `${d.data.name}: ${d.data.value.toLocaleString()}`);

            ringContainer
              .append("g")
              .attr("font-family", "sans-serif")
              .attr("font-size", 9)
              .attr("text-anchor", "middle")
              .selectAll(".heihei")
              .data(arcs)
              .enter()  
              .append("text")
              .attr("transform", (d) => `translate(${arc.centroid(d)})`)
              .call((text) =>
                text
                  .filter((d) => d.endAngle - d.startAngle > 0.25)
                  .append("tspan")
                  .attr("y", "0em")
                  //.attr("font-weight", "bold")
                  .text((d) => d.data.name)
              )
              /*.call((text) =>
                text
                  .filter((d) => d.endAngle - d.startAngle > 0.25)
                  .append("tspan")
                  .attr("x", 0)
                  .attr("y", "0.7em")
                  .attr("fill-opacity", 0.7)
                  .text((d) => d.data.value.toLocaleString())
              );*/
          });
        });
      });
    },

    mapAddCircle(data, counter) {
      let cell_dict = {};

      for (let cell in data) {
        let id = data[cell]["id"];

        cell_dict[id] = data[cell];
      }

      let points = [];

      for (let cell_id in counter) {
        //console.log(cell_id)

        if (cell_dict[cell_id] != undefined) {
          let cell = cell_dict[cell_id];

          let meta = {};
          meta["properties"] = {};
          if (cell.name.split("_").length > 1)
            cell.name = cell.name.split("_")[1];
          meta["properties"]["name"] = cell.name.replace("绵阳", "");
          meta["properties"]["weight"] = counter[cell_id] / 30;
          meta["type"] = "Feature";
          meta["geometry"] = {};
          meta["geometry"]["type"] = "Point";
          meta["geometry"]["coordinates"] = [cell.lon, cell.lat];

          points.push(meta);
        } else {
          //console.log(cell_id)
        }
      }

      if (this.map.getSource("cells") != null) {
        this.map.getSource("cells").setData({
          type: "FeatureCollection",
          features: points,
        });
      } else {
        this.map.addSource("cells", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: points,
          },
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
              ["*", ["get", "weight"], 1.5],
            ],
            "circle-color": "#ccc",
            "circle-stroke-width": 0,
            "circle-stroke-color": "#fff",
          },
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
            "text-anchor": "top",
          },
          paint: {
            "text-color": "#fff",
          },
          minzoom: 12,
        });
      }
    },

    mapAddHeatmap() {
      this.map.addLayer({
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
            0.2,
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
            1,
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparancy color
          // to create a blur-like effect.
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
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
            20,
          ],
          // Transition from heatmap to circle layer by zoom level
          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 9, 1, 11, 0],
        },
      });
    },

    mapAddTopicCell(cell) {
      let that = this;

      let size = 200;

      var pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),

        // get rendering context for the map canvas when layer is added to the map
        onAdd: function () {
          //let canvas = document.createElement('canvas');
          let canvas = d3.select("#animate");
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext("2d");
        },

        // called once before every frame where the icon will be used
        render: function () {
          console.log(123);
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
        },
      };

      this.map.addImage(cell.topic + "-dot", pulsingDot, { pixelRatio: 2 });

      console.log("source-" + cell.topic);

      let hehe = this.map.addSource("source-" + cell.topic, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [cell.lon, cell.lat],
              },
            },
          ],
        },
      });

      this.map.addLayer({
        id: cell.topic + "-point",
        type: "symbol",
        source: "source-" + cell.topic,
        layout: {
          "icon-image": cell.topic + "-dot",
        },
      });
    },

    mapAddMarker(cell) {
      var marker = new mapboxgl.Marker({ id: cell.name });
      marker.setLngLat([cell.lon, cell.lat]);
      //marker.setID(cell.name);
      marker.addTo(this.map);
    },
  },

  data() {
    return {
      data: [],
      loading: true,
    };
  },
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