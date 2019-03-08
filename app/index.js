console.log("H")

  Promise.all([
    fetch(
      'data/nta-clean.json'
    ).then(data => data.json()),
    fetch(
      'data/hmda_per_nta.json'
     ).then(data => data.json()),
  ]).then(combined => myVis(combined[0], combined[1])); 


  d3.csv("dropdown_options.csv").then(function(dataset) {
     console.log(dataset);
        d3.select("#dropdown")
          .selectAll("option")
          .data(dataset)
          .enter()
          .append("option")
          .attr("value", function(dataset){return dataset.value;})
          .text(function(dataset){return dataset.text;});
            })
            .catch(error => {
                console.log("Error") //how can i get an error here and print console.log(dataset?????)
            });


function computeDomain(data, key) {
  return data.reduce((acc, row) => {
    return {
      min: Math.min(acc.min, row[key]),
      max: Math.max(acc.max, row[key])
    };
  }, {min: Infinity, max: -Infinity});
}

var div = d3.select("body").append("div") //does not work
    .attr("class", "tooltip")       
    .style("opacity", 0);


function myVis(ntaShapes, ntaValues) {
  console.log(ntaShapes, ntaValues)

  // this is an es6ism called a destructuring, it allows you to save and name argument
  // you tend to see it for stuff in object, (as opposed to arrays), but this is cool too
  // const [stateShapes, statePops] = data;
  const width = 1000;
  const height = 800;
  const margin = {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10
  };
  // we're going to be coloring our cells based on their population so we should compute the
  // population domain
  const incDomain = computeDomain(ntaValues, 'avg_inc');
  // the data that we will be iterating over will be the geojson array of states, so we want to be
  // able to access the populations of all of the states. to do so we flip it to a object representation
  // const stateNameToPop = statePops.reduce((acc, row) => {
  //   acc[row.state] = row.pop;
  //   return acc;
  // }, {});
  const ntaNameToInc = {};
  for (let i = 0; i < ntaValues.length; i++) {
    const row = ntaValues[i];
    ntaNameToInc[row.ntacode] = row.avg_inc;
  }
console.log(ntaNameToInc);

  const incScale = d3.scaleLinear().domain([0, incDomain.max]).range([0, 1]);
  const colorScale = d => d3.interpolateInferno(Math.sqrt(incScale(d)));
  // next we set up our projection stuff
  var projection = d3.geoAlbers()
            .scale(70000)
            .rotate([73.94, 0])
            .center([0, 40.70])
            .translate([width/2, height/2]);

  const geoGenerator = d3.geoPath(projection);
  // then our container as usual
  const svg = d3.select('.vis-container')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append("text")
      .attr("y", height/50)
      .attr("x", width/3 + 100)             
      .style("text-anchor", "middle")
      .text("Visualizing HMDA Data in New York City");

  // finally we construct our rendered states
  console.log(svg);

  const join = svg.selectAll('.ntacode')
    .data(ntaShapes.features);
  
  console.log(join, ntaShapes.features);
  
  join.enter()
    .append('path')
      .attr('class', 'ntacode')
      .attr('stroke', 'black')
      .attr('fill', d => colorScale(ntaNameToInc[d.properties.ntacode]))
      .attr('d', d => geoGenerator(d))
      .on("mouseover", function(d) {    //this does NOT WORK
            div.transition()    
                .duration(200)    
                .style("opacity", .9);    
            div.html(d.ntacode)  //I think this needs to be a function that return the inc for each polygon
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
            })          
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });

}