<template>

  <div id='chord-view-container'>
    <div class='name'>基站主题之间转移关系</div>
      <div id='chord-view'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';

let data = [
    [ 2.6697, 0,       0.9137, 0,       1.2648, -0.1355],
    [ 0,      5.4090,  0,      1.6314,  0,      -0.1002],
    [ 0.913,  0,       4.1905, 0,       2.3152, 0.2634],
    [ 0,      1.6359,  0,      2.828,   -0.950, 0.4847],
    [ 1.2650, 0,       2.3121, -0.9511, 4.3240, 0.2685],
    [-0.1336, -0.0973, 0.2625, 0.4856,  0.2665, 1.682]
]

export default {
  name:'chord-view',
  data () {
    return {
      lineData: data
    }
  },
  methods:{
    chartInit(){

        const svg = d3.select("#chord-view").append('svg')
            .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
            .attr("font-size", 16)
            .attr("font-family", "sans-serif");

        const chords = this.chord(this.lineData);

        const group = svg.append("g")
            .selectAll("g")
            .data(chords.groups)
            .enter()
            .append('g')

        group.append("path")
            .attr('opacity', 1)
            .attr("fill", d => d3.rgb(this.color(d.index)))
            .attr("stroke", d => d3.rgb(this.color(d.index)))
            .attr("d", this.arc);

        const groupName = group.append("g")
            .attr("transform", d => `rotate(${(d.startAngle + d.endAngle) / 2 * 180 / Math.PI - 90}) translate(${this.outerRadius - 50},0)`);

        svg.append("g")
            .attr("fill-opacity", 0.67)
            .selectAll("path")
            .data(chords)
            .enter()
            .append("path") 
            .attr('opacity',0.8)
            .attr("d", this.ribbon)
            .attr("fill", d => d3.rgb(this.color(d.target.index)))
            .attr("stroke", d => d3.rgb(this.color(d.target.index)))
            .attr('stroke-width', 0)

        groupName
            .append("text")
            .attr("x", 8)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr('fill','black')
            .attr('font-size', 20)
            .text(d => 'Topic ' + d.index)
    }
  },
  mounted(){

    d3.select('#' + 'chord-view-container')
      .style('position', 'absolute')
      .style('top', '70px')
      .style('right', '30px')

    this.width = 640
    this.height = 640

    this.outerRadius = Math.min(this.width, this.height) * 0.5 - 30
    this.innerRadius = this.outerRadius - 20

    this.formatValue = d3.formatPrefix(",.0", 1e3)

    this.chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending)

    this.arc = d3.arc()
    .innerRadius(this.innerRadius)
    .outerRadius(this.outerRadius)

    this.ribbon = d3.ribbon()
    .radius(this.innerRadius)

    this.color = d3.scaleOrdinal()
    .domain(d3.range(6))    
    .range(["#FF6600","#FFD443", "#FF6361", "#484C7F", "#BABEEA", "#E2ECF2"])

    this.groupTicks = function(d, step) {
        const k = (d.endAngle - d.startAngle) / d.value;
        return d3.range(0, d.value, step).map(value => {
            return {value: value, angle: value * k + d.startAngle};
        });
    }

    for(let i=0;i<this.lineData.length;i+=1){

        for(let j=0;j<this.lineData[i].length;j+=1){

            if (this.lineData[i][j] != 0)
              this.lineData[i][j] = Math.pow(Math.pow(Math.E, this.lineData[i][j]), 0.7)
        }
    }
    
    this.chartInit()
  },
}
</script>

<style scoped>
#chord-view-container{
  width:90%;
  height:600px;
}

.name{
  border-left: lightsalmon solid 3px;
  color:black;
  padding-left:10px;
  margin-right: 20px;
  right:0px;
  float: right;
}

</style>