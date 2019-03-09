console.log("Huuuu")

//code altered from http://bl.ocks.org/feyderm/e6cab5931755897c2eb377ccbf9fdf18
//and https://github.com/mcnuttandrew/capp-30239/tree/master/week-8-map/soln


// Promise.all([
//     fetch(
//       'data/nta-clean.json'
//     ).then(data => data.json()),
//     fetch(
//       'data/hmda_per_nta.json' //need to make this dependent on selection (or just address with update fill)
//      ).then(data => data.json()),
//   ]).then(combined => myVis(combined[0], combined[1])); 


Promise.all([
  'data/nta-clean.json', 
  'data/hmda_per_nta.json', 
  'data/hmda_nta_general_2013.json', 
  'data/hmda_nta_general_2014.json', 
  'data/hmda_nta_general_2015.json', 
  'data/hmda_nta_general_2016.json', 
  'data/hmda_nta_general_2017.json',
  'data/hmda_nta_asian_2013.json', 
  'data/hmda_nta_asian_2014.json', 
  'data/hmda_nta_asian_2015.json', 
  'data/hmda_nta_asian_2016.json', 
  'data/hmda_nta_asian_2017.json', 
  'data/hmda_nta_black_2013.json', 
  'data/hmda_nta_black_2014.json', 
  'data/hmda_nta_black_2015.json', 
  'data/hmda_nta_black_2016.json', 
  'data/hmda_nta_black_2017.json', 
  'data/hmda_nta_white_2013.json', 
  'data/hmda_nta_white_2014.json', 
  'data/hmda_nta_white_2015.json', 
  'data/hmda_nta_white_2016.json', 
  'data/hmda_nta_white_2017.json', 
  'data/hmda_nta_other_2013.json', 
  'data/hmda_nta_other_2014.json', 
  'data/hmda_nta_other_2015.json', 
  'data/hmda_nta_other_2016.json', 
  'data/hmda_nta_other_2017.json'
  ].map(url => fetch(url).then(data => data.json())))
    .then(data => myVis(data))
    .catch(function(error){
      console.log("Error");
    });

 


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




function myVis(data) { //maybe this should be ntaShapes, and selectedData (but we must load it first)
  

  var [ntaShapes, hmda_per_nta, 
hmda_nta_general_2013, hmda_nta_general_2014, 
hmda_nta_general_2015, hmda_nta_general_2016, hmda_nta_general_2017,

hmda_nta_asian_2013, hmda_nta_asian_2014, 
hmda_nta_asian_2015, hmda_nta_asian_2016, hmda_nta_asian_2017, 

hmda_nta_black_2013, hmda_nta_black_2014, 
hmda_nta_black_2015, hmda_nta_black_2016, hmda_nta_black_2017,

hmda_nta_white_2013, hmda_nta_white_2014, 
hmda_nta_white_2015, hmda_nta_white_2016, hmda_nta_white_2017,

hmda_nta_other_2013, hmda_nta_other_2014, 
hmda_nta_other_2015, hmda_nta_other_2016, hmda_nta_other_2017
] = data;

var selectedData = hmda_nta_general_2013; //give it something to start with (should this be a csv)

  console.log(selectedData); //this works

  var div = d3.select("body") //trying to create a tooltip! 
    .append("div") //does not work
    .attr("class", "tooltip")       
    .style("opacity", 0);

  const width = 1000;
  const height = 800;
  const margin = {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10
  };


// const ntaNameToVar = {}; //need to be general ntaNameToVar
//   for (let i = 0; i < selectedData.length; i++) {
//     const row = selectedData[i];
//     ntaNameToVar[row.ntacode] = row.button_choice; //need this to be the chosen variable, from button
//   }
// console.log(ntaNameToVar);
const varDomain = computeDomain(selectedData, 'avg_inc');
console.log(varDomain);

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



console.log(selectedData);

  function updateFunction(selectedData) {

console.log(svg);

const join = svg.selectAll('.ntacode')
    .data(ntaShapes.features);
  
console.log(join, ntaShapes.features);


console.log(selectedData);
const ntaNameToVar = {}; //need to be general ntaNameToVar
  for (let i = 0; i < selectedData.length; i++){
        const row = selectedData[i];
        ntaNameToVar[row.ntacode] = row.avg_inc; //need to generalize this somehow so it fills with variable choice
      }
    console.log(ntaNameToVar);


    //THIS IS WORKING DO NOT TOUCH FIRST 6 lines  
    join.enter()
      .append('path')
      .attr('class', 'ntacode')
      .attr('stroke', 'black')
      .attr('d', d => geoGenerator(d))
      .merge(join)
        .attr('fill', d => colorScale(ntaNameToVar[d.properties.ntacode]))
        //.call(updateFill, selectedData) //throws error here, but also goes back to ln 49 and prints new chosen dropdown, then tries to run myvis
        .on("mouseover", function(d) {    //this does NOT WORK
          div.transition()    
            .duration(200)    
            .style("opacity", .9);    
          div.html(d.properties.ntaname)  //I think this needs to be a function that return the inc for each polygon
            .style("left", (d3.event.pageX) + "px")   
            .style("top", (d3.event.pageY - 28) + "px");  
        })          
        .on("mouseout", function(d) {   
          div.transition()    
          .duration(500)    
          .style("opacity", 0); 
        });
  }
 
  var dropDown = d3.select("#dropdown");

  dropDown.on("change", function() {
    checked = true;
    selectedData = d3.event.target.value;
    console.log(selectedData);
    updateFunction(selectedData); 
  }); 
  // this is the first call to the update
  updateFunction(selectedData);
}


