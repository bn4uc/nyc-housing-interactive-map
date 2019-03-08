console.log("H")

//code based on http://bl.ocks.org/feyderm/e6cab5931755897c2eb377ccbf9fdf18
//and https://github.com/mcnuttandrew/capp-30239/tree/master/week-8-map/soln


Promise.all([
    fetch(
      'data/nta-clean.json'
    ).then(data => data.json()),
    fetch(
      'data/hmda_per_nta.json' //need to make this dependent on selection (or just address with update fill)
     ).then(data => data.json()),
  ]).then(combined => myVis(combined[0], combined[1])); 
 


d3.csv("dropdown_options.csv").then(function(dataset) { //loading in the csv for the dropdown options
     console.log(dataset);
        d3.select("#dropdown") //adding each name and value to each option
          .selectAll("option")
          .data(dataset)
          .enter()
          .append("option")
          .attr("value", function(dataset){return dataset.value;})
          .text(function(dataset){return dataset.text;});
            })
            .catch(error => {
                console.log("Error")
            });

function computeDomain(data, key) {
  return data.reduce((acc, row) => {
    return {
      min: Math.min(acc.min, row[key]),
      max: Math.max(acc.max, row[key])
    };
  }, {min: Infinity, max: -Infinity});
}

var div = d3.select("body") //trying to create a tooltip! 
    .append("div") //does not work
    .attr("class", "tooltip")       
    .style("opacity", 0);



function myVis(ntaShapes, selectedData) { //selectedData (but we must load it first)
  console.log(ntaShapes, selectedData);

  const width = 1000;
  const height = 800;
  const margin = {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10
  };

const varDomain = computeDomain(selectedData, button_choice); //how to access button choice??

const ntaNameToVar = {}; //need to be general ntaNameToVar
  for (let i = 0; i < selectedData.length; i++) {
    const row = selectedData[i];
    ntaNameToVar[row.ntacode] = row.button_choice; //need this to be the chosen variable, from button
  }
console.log(ntaNameToVar);

const varScale = d3.scaleLinear().domain([0, varDomain.max]).range([0, 1]);

const colorScale = d => d3.interpolateInferno(Math.sqrt(varScale(d))); //need to figure out how to make a legend for this

var projection = d3.geoAlbers()
            .scale(70000)
            .rotate([73.94, 0])
            .center([0, 40.70])
            .translate([width/2, height/2]);

const geoGenerator = d3.geoPath(projection);

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

// function updateFill(selection, selectedData){ //choosing the new data and the variable then using rescale fill
// //need this to take the selection from the buttons and from the drop down, run 
// varDomain = computeDomain(selectedData, button_choice);
// };

function updateFill(selection, selectedData) { //this is for choosing the variable, based on the buttons
  var d_extent = d3.extent(selection.data(), function(d) {
                return parseFloat(d.properties[selectedData]);
            });

            rescaleFill(selection, d_extent);
        };

function rescaleFill(selection, d_extent) { //why do these ^need to be in separate functions? 
   varDomain.domain(d_extent)
    selection.transition()
     .duration(700)
     .attr("fill", function(d) {
      var data = parseFloat(d.properties[selectedData]);
         return colorScale(data);
          });
        }

var selectedData = "hmda_nta_general_2013.json"; //give it something to start with (should this be a csv)

var dropDown = d3.select("#dropdown");

dropDown.on("change", function() {
            checked = true;
            selectedData = d3.event.target.value; //selectedData is the ".json" we need!! BUT NEED as input to myVis??
            myVis.call(ntaShapes, selectedData); //this is being triggered so it is working - maybe this is where I need to call myVis

        }); //this works within myVis function, but not outside of it hmmm 

//THIS IS WORKING DO NOT TOUCH FIRST 6 lines  
  join.enter()
    .append('path')
      .attr('class', 'ntacode')
      .attr('stroke', 'black')
      .attr('fill', d => colorScale(ntaNameToVar[d.properties.ntacode]))
      .attr('d', d => geoGenerator(d))
      .call(updateFill, selectedData)
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



