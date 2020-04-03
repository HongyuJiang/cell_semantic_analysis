<template>
  <div id="map"></div>
</template>

<script>
import DataProvider from '../DataProvider';
import * as mapboxgl from 'mapbox-gl';

export default {
  name: 'mapbox-view',

  mounted() {
    this.map = ''
    this.mapInit(this);
    this.mapLoadGeojson(this);

    this.$root.$on('updateMapTopic', topic => {
            // your code goes here
      this.mapAddCircle(this.cell_info, topic)
    })

  },
  methods: {

    addRegion2Map(features){

      this.map.addSource("region_json", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": features.features
        },
      })

      this.map.addLayer({
        "id": "region",
        "type": "fill",
        "source": "region_json",
        "paint": {
            "fill-color": "#fff",
            "fill-opacity": 0.15
        },
        minzoom: 5,
        maxzoom: 20,
      });

      this.map.addLayer({
        "id": "region_boundry",
        "type": "line",
        "source": "region_json",
        "paint": {
            'line-width': 1.5,
            'line-color': "black",
        },
        minzoom: 5,
        maxzoom: 20,
      });

      this.map.addLayer({
        "id": "region-label",
        "type": "symbol",
        "source": "region_json",
        "layout": {
          "text-field": "{name}",
          "text-size": 12,
         
        },
        "paint": {

           "text-color": '#fff'
        }
    });
    },
    
    mapInit(that){
      mapboxgl.accessToken = 'pk.eyJ1IjoiaG9uZ3l1amlhbmciLCJhIjoiY2s3N202NDIxMDhkdzNpcGg3djRtdnN4dCJ9.lysys8PBG25SxeHRF-sPvA';
      this.map = new mapboxgl.Map({
          container: 'map', // container id
          style: 'mapbox://styles/hongyujiang/cjl1ya0sn4m0m2sqj0pbkuqor', // stylesheet location
          center: [104.849,31.5580], // starting position [lng, lat]
          zoom: 8.5 // starting zoom
      });

    },
    mapLoadGeojson(that){

      this.map.on('load', function(){

          DataProvider.getRegionJson().then(response => {
              
              that.data = response.data;
              that.addRegion2Map(that.data)

              }, error => {
                that.loading = false;
          });

          DataProvider.getCellInfo().then(response => {
          
            let cell_info = response.data 
            that.cell_info = cell_info
            that.mapAddCircle(cell_info, 5)
            that.mapAddHeatmap()
          
            }, error => {
              
              that.loading = false;
          });

      })
    },

    mapAddCircle(data, index){

      let points = []

      data.forEach(d => {

        //2 > 3, 3 > 0.9, 4 > 2, 
        let threshold = 1.5

        if (index == 0) threshold = 3
        else if (index == 1) threshold = 0
        else if (index == 2) threshold = 3
        else if (index == 3) threshold = 0.4
        else if (index == 4) threshold = 4

        if(d.score[index] > threshold){

          let meta = {}
          meta['properties'] = {}
          if(d.name.split('_').length > 1) d.name = d.name.split('_')[1]
          meta['properties']['name'] = d.name
          meta['properties']['weight'] = d.score[5] * 3
          meta['type'] = 'Feature'
          meta['geometry'] = {}
          meta['geometry']['type'] = 'Point'
          meta['geometry']['coordinates'] = [d.lon, d.lat]

          points.push(meta)
        }
      })

      if(this.map.getSource('cells') != null){

        this.map.getSource('cells').setData({
              "type": "FeatureCollection",
              "features": points
        })  
      }
      else{

        this.map.addSource("cells", {
          "type": "geojson",
          "data": {
              "type": "FeatureCollection",
              "features": points
           }
        })

         this.map.addLayer({
            "id": "cells-circle",
            "type": "circle",
            "source": 'cells',
            'paint': {
                'circle-radius': [
                  'interpolate', ['linear'], ['zoom'],
                  10, 1,
                  12, ['*', ['get', 'weight'], 1],
                  13, ['*', ['get', 'weight'], 1.5],
                ],
                'circle-color': '#ccc',
                "circle-stroke-width": 0,
                "circle-stroke-color": "#fff"
             
            },
            //minzoom: 10,
        });
        
        this.map.addLayer({
            "id": "cells-text",
            "type": "symbol",
            "source": 'cells',
             layout: {
              "text-field": "{name}",
             // "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
              "text-size": 12,
              "text-offset": [0, 1.2],
              "text-anchor": "top",

            },
            "paint": {
                "text-color": '#fff',
              
            },
            minzoom: 12,
        });
      
      }
        this.map.on('click', 'wubai-circle', function (e) {
          new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(e.features[0].properties.name)
              .addTo(that.map);
        });

    },

    mapAddHeatmap(){

      this.map.addLayer(
        {
        'id': 'cells-heat',
        'type': 'heatmap',
        'source': 'cells',
        'maxzoom': 12,
        'paint': {
        // Increase the heatmap weight based on frequency and property magnitude
          'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'count'],
          8,
          1,
          12,
          2
        ],
        // Increase the heatmap color weight weight by zoom level
        // heatmap-intensity is a multiplier on top of heatmap-weight
        'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        8,
        0.5,
        12,
        1
        ],
        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
        // Begin color ramp at 0-stop with a 0-transparancy color
        // to create a blur-like effect.
        'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(33,102,172,0)',
        0.2,
        'rgb(103,169,207)',
        0.4,
        'rgb(209,229,240)',
        0.6,
        'rgb(253,219,199)',
        0.8,
        'rgb(239,138,98)',
        1,
        'rgb(178,24,43)'
        ],
        // Adjust the heatmap radius by zoom level
        'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        5,
        8,
        8,
        15,
        10,
        20
        ],
        // Transition from heatmap to circle layer by zoom level
        'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        9,
        1,
        11,
        0
        ]
        }
        },
        'waterway-label'
        );
    }

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
    position:absolute; 
    width:100%; 
    height:100%;
}

body { margin:0; padding:0; }

</style>