<template>
  <div id="app">
    <div class="float-layer left-float-layer">
       <fixed-attr-indicator class="fixed-attrs" name='城市人群行为模式分析系统'/>
       <dynamic-attr-indicator 
          name=基站数量
          value=9987
          top=130
          id = xiaqu
          class="dynamic-attrs"
        />
    
    </div>

    <syou-mapbox-view class="mapbox-view"/>
    <chord-view />

    <cell-emb-vis />

    <div class="float-layer right-float-layer">

      <user-emb-vis />
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
import UserEmbVis from './components/UserEmbVis';
import CellEmbVis from './components/CellEmbVis';
import TopicView from './components/SyouTopicView';
import CellList from './components/SyouCellList';
import DataProvider from './DataProvider';
import SyouChordView from './components/SyouChordView.vue';

export default {
  name: 'App',
  components: {
    SyouMapboxView,
    FixedAttrIndicator,
    DynamicAttrIndicator,
    MatView,
    UserEmbVis,
    CellEmbVis,
    ChordView
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
  width:27%;
  height:100%;

}

.left-float-layer{

  left:0px;
  height:20%;
}

.right-float-layer{

  right:0px;
  background:#F3F3F3;
  
}


body {
    margin:0; 
    padding:0;
    width:100%;
    height:100%;
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
