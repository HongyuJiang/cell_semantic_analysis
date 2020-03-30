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

        let rect_size = [30, 11]

        const svg = d3.select("#mat-view").append('svg')
           // .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
            .attr('width', 300)
            .attr('height', 350)
            .attr("font-size", 16)
            .attr("font-family", "sans-serif")
            .append('g')
            .attr('transform','translate(50,20)')

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
        .attr('fill-opacity', 0.99)
        .attr('fill', d => d3.interpolateSpectral(heatScale(d)))
        .attr('stroke','black')
        .attr('stroke-width','1')

        let xScale = d3.scaleLinear().domain([1,7]).range([0,rect_size[0]*7])

        const xAxisContainer = svg.append("g")
        .attr("transform", `translate(0,270)`);

        const xAxis = d3.axisBottom(xScale)
        .ticks(7)

        xAxisContainer.call(xAxis);
        xAxisContainer.selectAll('text').attr('fill','white')
        xAxisContainer.selectAll('path').attr('stroke','white')
        xAxisContainer.selectAll('line').attr('stroke','white')

        let yScale = d3.scaleLinear().domain([1,24]).range([0,rect_size[1] * 24])

        const yAxisContainer = svg.append("g")
        .attr("transform", `translate(-10,0)`);

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

    this.width = 640
    this.height = 640


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
  width:70%;
  height:600px;
}

</style>