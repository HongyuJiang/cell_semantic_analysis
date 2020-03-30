<template>

  <div id='topic-view-container'>
      <div id='topic-view'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';

export default {
  name:'topic-view',
  data () {
    return { }
  },
  methods:{
    chartInit(data){

        let rect_size = [(this.width) / 8, (this.height) / 26]

        console.log(data)

        const svg = d3.select("#topic-view").append('svg')
            .attr("viewBox", [0, 0, this.width, this.height])
            .attr("font-size", 16)
            .attr("font-family", "sans-serif")

        svg.append('rect')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('fill','white')
        .attr('opacity','0.2')

        let groups = svg.selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', function(d,i){
            return 'translate(' +　(i * 110 + 70) + ', 60)'
        })

        groups.append('circle')
        .attr('r', 20)
        .attr('fill','orange')
        .attr('cx', 0)
        .attr('cy', 0)

        groups.append('circle')
        .attr('r', 10 * Math.random() + 5)
        .attr('fill','#000')
        .attr('cx', 0)
        .attr('cy', 0)

        groups.append('text')
        .attr('fill','#fff')
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text(function(d,i){

            return 'Topic ' + i
        })

        groups.selectAll('dayBall')
        .data(d => d.day)
        .enter()
        .append('circle')
        .attr('cx', function(d,i){

            return 30 * Math.sin(i * (3.14 / 7) + 1)
        })
        .attr('cy', function(d,i){

            return 30 * Math.cos(i * (3.14 / 7) + 1)
        })
        .attr('r', d => d / 20)
        .attr('fill','#cc3300')
    }   
  },
  mounted(){

    this.width = 700
    this.height = 120


    d3.select('#' + 'topic-view-container')
      .style('position', 'absolute')
      .style('top', '50px')
      .style('left', '30%')
      .style('width', this.width + 'px')
      .style('height', this.height + 'px')

    let that = this

    DataProvider.getCellFeatures().then(response => {
              
        that.data = response.data;
        
        this.chartInit(that.data)

        }, error => {
            that.loading = false;
    });
    
  },
}
</script>

<style scoped>

</style>