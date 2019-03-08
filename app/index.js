console.log("H")

  Promise.all([
    fetch(
      'data/nta-clean.json'
    ).then(data => data.json()),
    fetch(
      'data/hmda_per_nta.json'
     ).then(data => data.json()),
  ]).then(combined => myVis(combined[0], combined[1])); //loading in the data and running the function on it

//seems like i need to re-call myVis everytime the selection changes, and make 

  d3.csv("dropdown_options.csv").then(function(dataset) { //loading in the csv for the dropdown options
     console.log(dataset);
        d3.select("#dropdown") //adding each name and value to each option
          .selectAll("option")
          .data(dataset)
          .enter()
          .append("option")
          .attr("value", function(dataset){return dataset.value;}) //maybe can access this later on
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

  const width = 1000;
  const height = 800;
  const margin = {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10
  };

  const incDomain = computeDomain(ntaValues, 'avg_inc'); //this needs to be made general variable responsive to buttons

  const ntaNameToInc = {};
  for (let i = 0; i < ntaValues.length; i++) {
    const row = ntaValues[i];
    ntaNameToInc[row.ntacode] = row.avg_inc; //need to generalize this somehow so it fills with variable choice
  }
console.log(ntaNameToInc);

  const incScale = d3.scaleLinear().domain([0, incDomain.max]).range([0, 1]);
  const colorScale = d => d3.interpolateInferno(Math.sqrt(incScale(d))); //need to figure out how to make a legend for this
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

var selectedData = "hmda_nta_asian_2013"; //give it something to start with (should this be a csv)

var dropDown = d3.select("#dropdown");

dropDown.on("change", function() {
            checked = true;
            selectedData = d3.event.target.value;
            plot.call(updateFill, selectedData);

        });

function updateData(selection, selectedData) {
  var d_extent = d3.extent(selection.data(), function(d) {
                return parseFloat(d.properties[selectedData]);
            });

            rescaleFill(selection, d_extent);
        };

function rescaleFill(selection, d_extent) {
   norm_fill.domain(d_extent)
    selection.transition()
     .duration(700)
     .attr("fill", function(d) {
      var datum = parseFloat(d.properties[selected_dataset]);
         return fill_viridis(norm_fill(datum));
          });
        }



//THIS IS WORKING DO NOT TOUCH FIRST 6 lines  
  join.enter()
    .append('path')
      .attr('class', 'ntacode')
      .attr('stroke', 'black')
      .attr('fill', d => colorScale(ntaNameToInc[d.properties.ntacode]))
      .attr('d', d => geoGenerator(d))
      .call(updateData, selectedData)
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