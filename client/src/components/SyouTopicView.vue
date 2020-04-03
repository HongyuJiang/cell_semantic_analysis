<template>

  <div id='topic-view-container'>
      <div id='topic-view'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';

let transfer_data = [
    [ 2.6697, 0,       0.9137, 0,       1.2648, -0.1355],
    [ 0,      5.4090,  0,      1.6314,  0,      -0.1002],
    [ 0.913,  0,       4.1905, 0,       2.3152, 0.2634],
    [ 0,      1.6359,  0,      2.828,   -0.950, 0.4847],
    [ 1.2650, 0,       2.3121, -0.9511, 4.3240, 0.2685],
    [-0.1336, -0.0973, 0.2625, 0.4856,  0.2665, 1.682]
]

let colors = ["#FF6600","#FFD443", "#FF6361", "#484C7F", "#BABEEA", "#E2ECF2"]

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
        let innerCircleColor = '#8afd99'
        let starsColor = '#8afd99'

       let proportions = []

       for(let i=0;i < transfer_data.length;i++){

         let group1 = 0

         for(let j=0;j < transfer_data[i].length;j++){

           if(i != j){
             group1 += transfer_data[i][j]
           }
         }

         let proportion = group1 / (group1 + transfer_data[i][i])

         proportions.push(proportion)
       }

        groups.append('circle')
        .attr('r', outerRadius)
        .attr('fill',outerCircleColor)
        .attr('opacity',0.5)
        .attr('cx', 0)
        .attr('cy', 0)

        groups.append('circle')
        .attr('r',  function(d,i){

          return outerRadius * proportions[i]
        })
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
        .attr('fill', function(d,i){

          return colors[i]
        })
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
        .attr('opacity',0.5)
    }   
  },
  mounted(){

    this.width = document.documentElement.clientWidth / 2.5
    this.height = this.width / 5


    d3.select('#' + 'topic-view-container')
      .style('position', 'absolute')
      .style('top', '30px')
      .style('left', '32%')
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