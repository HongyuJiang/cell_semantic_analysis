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

        let outerRadius = this.height / 5

        let that = this

        const svg = d3.select("#topic-view").append('svg')
            .attr("viewBox", [0, 0, this.width, this.height])
            .attr("font-size", 16)
            .attr("font-family", "sans-serif")

        let groups = svg.selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', function(d,i){
            return 'translate(' +　(i *  (that.width / 6.2) + that.width / 12) + ', 60)'
        })

        let outerCircleColor = 'grey'
        let innerCircleColor = '#FFaa00'
        let starsColor = 'steelblue'

        /*
        
        groups.append('rect')
        .attr('width', outerRadius * 3.6)
        .attr('height', outerRadius * 3.3)
        .attr('rx', 10)
        .attr('fill', 'rgba(255,255,255,0.1)')
        .attr('x', -outerRadius * 1.8)
        .attr('y', -outerRadius * 2)
        */

        groups.append('circle')
        .attr('r', outerRadius)
        .attr('fill',outerCircleColor)
        .attr('cx', 0)
        .attr('cy', 0)

        groups.append('circle')
        .attr('r', outerRadius  / 2 * Math.random() + outerRadius / 4)
        .attr('fill',innerCircleColor)
        //.attr('stroke','black')
        .attr('opacity', 1)
        .attr('cx', 0)
        .attr('cy', 0)

        groups.append('text')
        .attr('fill', '#fff')
        .attr('y', outerRadius * 2)
        .attr('text-anchor', 'middle')
        .style('font-size', 13)
        .text(function(d, i){
           return 'Topic ' + i
        })
        .on('mouseover', function(d){

          groups.selectAll('rect')
          .transition()
          .attr('opacity', function(q){
            if(d.topic == q.topic) return 1
            else return 0
          })
        })
        .on('mouseout', function(d){

          groups.selectAll('rect')
          .transition()
          .attr('opacity', 0)
        })
        .on('click', function(d){

           that.$root.$emit('updateMapTopic', d.topic) 
           that.$root.$emit('updateMatTopic', d.topic) 
        })

        groups.append('rect')
        .attr('opacity', 0)
        .attr('fill', '#FF3300')
        .attr('width', 40)
        .attr('height', 2)
        .attr('x', -20)
        .attr('y', 55)

        groups.selectAll('dayBall')
        .data(d => d.day)
        .enter()
        .append('circle')
        .attr('cx', function(d,i){

            return outerRadius * 1.5 * Math.sin(i * (3.14 / 7) + 1)
        })
        .attr('cy', function(d,i){

            return outerRadius * 1.5 * Math.cos(i * (3.14 / 7) + 1)
        })
        .attr('r', d => d / 20)
        .attr('fill',starsColor)
    }   
  },
  mounted(){

    this.width = document.documentElement.clientWidth / 2.5
    this.height = this.width / 5


    d3.select('#' + 'topic-view-container')
      .style('position', 'absolute')
      .style('top', '30px')
      .style('left', '34%')
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