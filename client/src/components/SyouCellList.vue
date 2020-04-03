<template>

  <div id='cell-list-container'>
      <div id='cell-list'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';


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

                if(that.indexOfMax(d.score) == i)
                    filter_list.push(d)
            })

            topic_list.push(filter_list.slice(0,3))
        }

        console.log(topic_list)

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

        topic_group.selectAll('cell_circle')
        .data(d => d)
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('cx', 0)
        .attr('cy', function(d,i){
            return i * 20 - 4
        })
        .attr('fill', function(d){

            return accent(d.topic)
        })

        topic_group.selectAll('cell_name')
        .data(d => d)
        .enter()
        .append('text')
        .attr('fill','white')
        .attr('x', 10)
        .attr('y', function(d,i){
            return i * 20
        })
        .attr('font-size', 13)
        .attr('font-family','Microsoft Yahei Light')
        .text(function(d){

            if(d.name.split('_').length > 1) return d.name.split('_')[1].replace('1800','')
            return d.name
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
    }
  },
  mounted(){

    d3.select('#' + 'cell-list-container')
      .style('position', 'absolute')
      .style('top', '30%')
      .style('left', '30px')

    this.width = 340
    this.height = 640

    let that = this

    DataProvider.getCellInfo().then(response => {
              
        that.data = response.data;

        that.chartInit(that.data)

        }, error => {
            that.loading = false;
    });

  },
}
</script>

<style scoped>
#cell-list-container{
  width:20%;
  height:50%;
}

.name{

  border-left: lightsalmon solid 3px;
  color:white;
  padding-left:10px;
  margin-right: 20px;
  right:0px;
  float: right;
}


</style>