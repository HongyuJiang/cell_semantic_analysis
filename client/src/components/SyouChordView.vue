<template>

  <div id='chord-view-container'>
    <div class='name'>基站动态信息</div>
      <div id='chord-view'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';

export default {
  name:'chord-view',
  data () {
    return { }
  },
  methods:{
    chartInit(cell_relations){

      d3.select("#chord-view").selectAll('*').remove()

      const svg = d3.select("#chord-view").append('svg')
          .attr("height", this.height)
          .attr("width", this.width)
          .attr("font-size", 16)
          .attr("font-family", "sans-serif");

      let yRecorder = {}

      let cell_dict = {}

      cell_relations.forEach(function(relation){

        let source = relation.source

        let target = relation.target

        if (cell_dict[source.code] == undefined){
          cell_dict[source.code] = source
        }
        if (cell_dict[target.code] == undefined){
          cell_dict[target.code] = target
        }
      })

      let cell_list = []
      let hullData = []

      for(let cell in cell_dict){

        cell_list.push(cell_dict[cell])
        //hullData.push([cell_dict[cell].pos.x, cell_dict[cell].pos.y/10 + 100])
      }

      let yMin = d3.min(cell_list, d => d.pos.y)
      let yMax = d3.max(cell_list, d => d.pos.y)

      let cell_position_assigner = {}

      cell_list.forEach(function(d){

        let y = (d.pos.y - yMin) / (yMax - yMin) * 180 + 20

        hullData.push([d.pos.x, y])

        d.pos.y = y

        cell_position_assigner[d.code] = d.pos 
      })

      let relation_lines = []

      cell_relations.forEach(function(d){

        if(cell_position_assigner[d.source.code] && cell_position_assigner[d.target.code]){

          let source_pos = cell_position_assigner[d.source.code]
          let target_pos = cell_position_assigner[d.target.code]

          let link = {'source': source_pos, 'target': target_pos, 'count': d.count}
          relation_lines.push(link)
        }
        
      })

      let area = d3.polygonHull(hullData)

      svg
      .append("path")
      .datum(area)
      .style("fill", "white")
      .style("stroke", "white")
      .style("stroke-width", "20")
      .style("opacity", "0.2")
      .attr('d', d => "M" + d.join("L") + "Z")

      let selected = []

      let candidates = []

      cell_list.forEach(function(d){

        candidates.push(d)
      })

      candidates.forEach(function(d){

        if(selected.length == 0){
          selected.push(d)
        }
        else{

          let label = true

          selected.forEach(function(q){

            let dis = (q.pos.x - d.pos.x) * (q.pos.x - d.pos.x) + (q.pos.y - d.pos.y) * (q.pos.y - d.pos.y)

            if(q.name.split('_').length > 1){

              q.name = q.name.split('_')[1]
            }

            if(q.name.split('-').length > 1){

              q.name = q.name.split('-')[0]
            }

            if(dis < 1000) label = false
            
          })

          if(label)
            selected.push(d)
        }
      })

      let cell_name = svg.append('g')
      .selectAll('.name')
      .data(selected)
      .enter()
      .append('text')
      .attr('x', d => d.pos.x + 5)
      .attr('y', d => d.pos.y + 15)
      .attr('fill', 'white')
      .text(d => d.name)
      .attr('font-size', 12)

      let relation_links = svg.append('g')
      .selectAll('.link')
      .data(relation_lines)
      .enter()
      .append('line')
      .attr('x1', d => d.source.x)
      .attr('x2', d => d.target.x)
      .attr('y1', d => d.source.y)
      .attr('y2', d => d.target.y)
      .attr('stroke-width', d => Math.sqrt(d.count) / 10)
      .attr('stroke', 'white')
      .attr('opacity', '0.3')

      let cell_points = svg.append('g')
      .selectAll('.point')
      .data(cell_list)
      .enter()
      .append('circle')
      .attr('opacity', 0.5)
      .attr('fill','red')
      .attr('cx', d => d.pos.x)
      .attr('cy', d => d.pos.y)
      .attr('r', 5)


    }
  },
  mounted(){

    d3.select('#' + 'chord-view-container')
      .style('position', 'absolute')

    this.width = 1580
    this.height = 300

    this.$root.$on('updateDynamicCells', cells => {
      this.chartInit(cells)
    })
 
  },
}
</script>

<style scoped>
#chord-view-container{
  width:75%;
  height:300px;
  bottom: 0px;
  left: 0px;
}

.name{
  border-left: lightsalmon solid 3px;
  color:white;
  padding-left: 10px;
  margin-left: 50px;
  float: left;
}

</style>