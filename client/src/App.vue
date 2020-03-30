<template>
  <div id="app">
    <div class="float-layer left-float-layer">
       <fixed-attr-indicator class="fixed-attrs" name='兰咩咩的小穴'/>
       <dynamic-attr-indicator 
          name=抽插次数
          value=1303
          top=130
          id = xiaqu
          class="dynamic-attrs"
        />
    
    </div>

    <syou-mapbox-view class="mapbox-view"/>

    <div class="float-layer right-float-layer">

      <chord-view />
      <mat-view />
    </div>  

  </div>


</template>

<script>

import SyouMapboxView from './components/SyouMapboxView';
import FixedAttrIndicator from './components/FixedAttrIndicator';
import DynamicAttrIndicator from './components/DynamicAttrIndicator';
import ChordView from './components/SyouChordView';
import MatView from './components/SyouMatView';
import DataProvider from './DataProvider';

export default {
  name: 'App',
  components: {
    SyouMapboxView,
    FixedAttrIndicator,
    DynamicAttrIndicator,
    ChordView,
    MatView
  },
  data () {
    return {
      bubbleData: {}
    }
  },
  mounted: function() {

  }
}
</script>

<style>
#app {
  font-family: 'Microsoft Yahei', 'Avenir', Helvetica, Arial, sans-serif;
}

.float-layer {
  position: absolute;
  z-index:999;
  width:25%;
  height:100%;

}

.left-float-layer{

  left:0px;
}

.right-float-layer{

  right:0px;
}


body {
    margin:0; 
    padding:0;
    width:100%;
    height:100%;
    font-family: 'Microsoft Yahei';
}

.chart-name{
    color:white; 
    margin-bottom:30px;
    border-top: 3px solid #F0B04D;
    background: rgba(255,255,255,0.1);
    padding:10px;
    
}

.chart-name-right{

    float:right; 
    right:0px;
    margin: 0%;
    
}

.chart-name-left{

    float:left; 
    left:10px; 
    margin: 5%;

}
</style>
