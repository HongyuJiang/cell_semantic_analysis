<template>

  <div id='cell-list-container'>
      <div class='name'>基站主题列表</div>
      <div id='cell-list'>
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';

let colors = ["#FF6600","#FFD443", "#FF6361", "#484C7F", "#BABEEA", "#E2ECF2"]


export default {
  name:'cell-list',
  data () {
    return { }
  },
  methods:{
    chartInit(data){

        let that = this

        var accent = d3.scaleOrdinal(d3.schemeAccent);
        
        let topic_list = []

        for(let i=0;i<6;i++){
                
            let temp_list = data.sort(function(a, b){
                return b.score[i] - a.score[i]
            })

            let filter_list = []    

            temp_list.forEach(d=>{

                let topic = that.indexOfMax(d.score)

                if(topic == i){
                    d.topic = topic
                    filter_list.push(d)
                }
                    
            })

            topic_list.push(filter_list.slice(0,3))

            that.$root.$emit('addTopicCell', filter_list[0]) 
        }

        d3.select("#cell-list").select('svg').remove()

        const svg = d3.select("#cell-list").append('svg')
            .attr("viewBox", [-20, -50, this.width + 20, this.height + 50])
            .attr("font-size", 16)
            .attr("font-family", "sans-serif")

        let topic_group = svg.selectAll('list')
        .data(topic_list)
        .enter()
        .append('g')
        .attr('transform', function(d,i){
            return 'translate(0' + ',' + (i * 80) + ')' 
        })

        topic_group.append('rect')
        .attr('x', 0)
        .attr('y', -15)
        .attr('width', 10)
        .attr('height', 60)
        .attr('fill', function(d,i){

            return colors[i]
        })

        topic_group.selectAll('cell_name')
        .data(d => d)
        .enter()
        .append('text')
        .attr('fill','white')
        .attr('x', 20)
        .attr('y', function(d,i){
            return i * 20
        })
        .attr('font-size', 13)
        .attr('font-family','Microsoft Yahei Light')
        .on('click', function(d){

            that.$root.$emit('addMarker', d)
        })
        .text(function(d){

          if(d.name.indexOf('室分') < 0){
            if(d.name.split('_').length > 1) return d.name.split('_')[1].replace('1800','')
            return d.name
          }
          else{
            return d.name.split('_')[2]
          }

            
        })
        

    },
    indexOfMax(arr) {
        if (arr.length === 0) {
            return -1;
        }

        var max = arr[0];
        var maxIndex = 0;

        for (var i = 1; i < arr.length; i++) {
            if (arr[i] > max) {
                maxIndex = i;
                max = arr[i];
            }
        }

        return maxIndex;
    },
    update(){

        let that = this

        DataProvider.getCellInfo().then(response => {
                
            that.data = response.data;

            that.chartInit(that.data)

            }, error => {
                that.loading = false;
        });
    }
  },
  mounted(){

    d3.select('#' + 'cell-list-container')
      .style('position', 'absolute')
      .style('top', '30%')
      .style('left', '30px')

    this.width = 340
    this.height = 640

    //this.$root.$on('updateCellList', d => {
    this.update()
    //})

  },
}
</script>

<style scoped>
#cell-list-container{
  width:70%;
  height:50%;
}

.name{

  border-left: lightsalmon solid 3px;
  color:white;
  padding-left: 10px; 
  margin-left: 20px;
  margin-bottom: 10px;
  left:0px;
 
}


</style>