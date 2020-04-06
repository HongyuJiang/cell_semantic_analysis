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
            .attr("viewBox", [-100, 0, this.width + 100, this.height])
            .attr("font-size", 16)
            .attr("font-family", "sans-serif")

        let groups = svg.selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', function(d,i){
            return 'translate(' +　(i *  (that.width / 6.2) + that.width / 12) + ', 60)'
        })

        let first = d3.select(groups.nodes()[0])

        first.append('line')
        .attr('x1', -60)
        .attr('x2', 0)
        .attr('y1', 30)
        .attr('y2', 30)
        .attr('stroke', 'white')
        .attr('stroke-opacity', '0.5')
        .attr('stroke-width', 1)

        first.append('line')
        .attr('x1', -60)
        .attr('x2', 0)
        .attr('y1', 3)
        .attr('y2', 3)
        .attr('stroke', 'white')
        .attr('stroke-opacity', '0.5')
        .attr('stroke-width', 1)

        first.append('line')
        .attr('x1', -60)
        .attr('x2', -20)
        .attr('y1', -37)
        .attr('y2', -37)
        .attr('stroke', 'white')
        .attr('stroke-opacity', '0.5')
        .attr('stroke-width', 1)

        first.append('text')
        .attr('x', -65)
        .attr('text-anchor', 'end')
        .attr('y', 5)
        .attr('fill', 'white')
        .attr('font-size', 12)
        .attr('font-weight', 100)
        .text('流入人群')

        first.append('text')
        .attr('x', -65)
        .attr('text-anchor', 'end')
        .attr('y', 34)
        .attr('fill', 'white')
        .attr('font-weight', 100)
        .attr('font-size', 12)
        .text('流出人群')

        first.append('text')
        .attr('x', -65)
        .attr('text-anchor', 'end')
        .attr('y', -32)
        .attr('fill', 'white')
        .attr('font-weight', 100)
        .attr('font-size', 12)
        .text('分日统计')

        let outerCircleColor = 'grey'
        let innerCircleColor = '#8afd99'
        let starsColor = '#999'

       let proportions = []

       for(let i=0;i < transfer_data.length;i++){

         let group1 = 0

         for(let j=0;j < transfer_data[i].length;j++){

           if(i != j){
             group1 += transfer_data[i][j]
           }
         }

         let proportion = group1 / transfer_data[i][i]

         proportions.push(proportion)
       }

        groups.append('circle')
        .attr('r', outerRadius)
        .attr('stroke', outerCircleColor)
        .attr('stroke-width', 4)
        .attr('fill', 'none')
        .attr('opacity',0.5)
        .attr('cx', 0)
        .attr('cy', 0)

        groups.append('circle')
        .attr('r',  function(d,i){
          return outerRadius * proportions[i]
        })
        .attr('fill',innerCircleColor)
        .attr('opacity', 0.7)
        .attr('cx', 0)
        .attr('cy', 0)

        groups.on('mouseover', function(d){

          groups.selectAll('.dayBall')
          .attr('fill', function(q){
            let topic = d3.select(this).attr('topic')
            if(d.topic == topic){
              d3.select(this)
              .selectAll('circle')
              .transition()
              .attr('fill','#D95284')
            }
          })
        })
        .on('mouseout', function(d){
          groups.selectAll('.dayBall')
          .selectAll('circle')
          .transition()
          .attr('fill', starsColor)
        })
        .on('click', function(d){

           that.$root.$emit('updateMapTopic', d.topic) 
           that.$root.$emit('updateMatTopic', d.topic) 
        })

        groups.append('rect')
        .attr('opacity', 0.7)
        .attr('fill', 'black')
        .attr('width', 60)
        .attr('height', 15)
        .attr('x', -25)
        .attr('y', 47)

        groups.append('rect')
        .attr('opacity', 1)
        .attr('fill', function(d,i){
          return colors[i]
        })
        .attr('width', 5)
        .attr('height', 15)
        .attr('x', -30)
        .attr('y', 47)

         groups.append('text')
        .attr('fill', '#ccc')
        .attr('x', 5)
        .attr('y', outerRadius * 2 )
        .attr('text-anchor', 'middle')
        .attr('font-size', 13)
        .attr('font-weight', 50)
        .text(function(d, i){
           return '主题 ' + i
        })

        groups.append('g')
        .attr('class','dayBall')
        .attr('topic', d => d.topic)
        .selectAll('dayBall')
        .data(d => d.day)
        .enter()
        .append('circle')
        .attr('cx', function(d,i){

            return outerRadius * 1.5 * Math.sin(i * (3.14 / 7) + 1)
        })
        .attr('cy', function(d,i){

            return outerRadius * 1.5 * Math.cos(i * (3.14 / 7) + 1)
        })
        .attr('r', d => d / 18)
        .attr('fill',starsColor)
        .attr('stroke', d3.rgb('#F2F2F2').brighter())
        .attr('stroke-width', 2)
        .attr('opacity', 0.7)
        .attr('class', 'day')
    }   
  },
  mounted(){

    this.width = document.documentElement.clientWidth / 2.3
    this.height = this.width / 5


    d3.select('#' + 'topic-view-container')
      .style('position', 'absolute')
      .style('top', '30px')
      .style('left', '26%')
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