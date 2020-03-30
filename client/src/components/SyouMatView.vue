<template>

  <div id='mat-view-container'>
      <div id='mat-view'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';


export default {
  name:'mat-view',
  data () {
    return { }
  },
  methods:{
    chartInit(data){

        let mat_data = data.rect

        let data_max = 0
        let data_min = 0

        data_max = d3.max(mat_data, d => d3.max(d))

        let heatScale = d3.scaleLinear().domain([data_min, data_max]).range([1,0])

        let rect_size = [(this.width) / 8, (this.height) / 26]

        const svg = d3.select("#mat-view").append('svg')
            .attr("viewBox", [-50, -50, this.width + 50, this.height + 50])
            .attr("font-size", 16)
            .attr("font-family", "sans-serif")

        let groups = svg.selectAll('rect_group')
        .data(mat_data)
        .enter()
        .append('g')
        .attr('transform',function(d,i){
           return 'translate(' + (i * rect_size[0]) + ',0)'
        })

        groups.selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('y', function(d,i){
            return i * rect_size[1]
        })
        .attr('width', rect_size[0])
        .attr('height', rect_size[1])
        .attr('fill-opacity', 0.8)
        .attr('fill', d => d3.interpolateSpectral(heatScale(d)))
        .attr('stroke','rgb(8,15,27)')
        .attr('stroke-width','2')

        let xScale = d3.scaleLinear().domain([1,7]).range([0,rect_size[0]*7])

        const xAxisContainer = svg.append("g")
        .attr("transform", `translate(0,` + (this.height - 20) + `)`);

        const xAxis = d3.axisBottom(xScale)
        .ticks(7)

        xAxisContainer.call(xAxis);
        xAxisContainer.selectAll('text').attr('fill','white')
        xAxisContainer.selectAll('path').attr('stroke','white')
        xAxisContainer.selectAll('line').attr('stroke','white')

        let yScale = d3.scaleLinear().domain([1,24]).range([0,rect_size[1] * 24])

        const yAxisContainer = svg.append("g")
        .attr("transform", `translate( ` + -20 + `,0)`);

        const yAxis = d3.axisLeft(yScale)
        .ticks(24)

        yAxisContainer.call(yAxis);
        yAxisContainer.selectAll('text').attr('fill','white')
        yAxisContainer.selectAll('path').attr('stroke','white')
        yAxisContainer.selectAll('line').attr('stroke','white')

    }   
  },
  mounted(){

    d3.select('#' + 'mat-view-container')
      .style('position', 'absolute')
      .style('top', '500px')
      .style('left', '50px')

    this.width = 340
    this.height = 340

    let that = this

    DataProvider.getCellFeatures().then(response => {
              
        that.data = response.data;
        
        this.chartInit(that.data[3])

        }, error => {
            that.loading = false;
    });
    
  },
}
</script>

<style scoped>
#mat-view-container{
  width:80%;
  height:40%;
}

</style>