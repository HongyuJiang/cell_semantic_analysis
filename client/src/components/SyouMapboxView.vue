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

    this.$root.$on('addAIcon', () => {
      this.mapAddIcon()
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
            "fill-opacity": 0.1
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
            that.mapAddCircle(cell_info)
          
            }, error => {
              
              that.loading = false;
          });

      })
    },

    mapAddIcon(that){

        that.map.addLayer({
            "id": "wudu",
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [104.862946,31.333467]
                        }
                    }]
                }
            },
            "layout": {
                "icon-image": "marker-15",
                "icon-size": 1
            }
        });
    },

    mapAddCircle(data){

      let points = []

      data.forEach(d => {

        //2 > 3, 3 > 0.9, 4 > 2, 

        if(d.score[5] > 1){

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
                  10, 2,
                  12, ['*', ['get', 'weight'], 1],
                  15, ['*', ['get', 'weight'], 3],
                ],
                'circle-color': '#FE7F2D',
                "circle-stroke-width": 0,
                "circle-stroke-color": "#fff"
             
            }
            
        });
        /*
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
              
            }
        });
        */
        this.map.on('click', 'wubai-circle', function (e) {
          new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(e.features[0].properties.name)
              .addTo(that.map);
        });

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
    position:absolute; 
    width:100%; 
    height:100%;
}

body { margin:0; padding:0; }

</style>