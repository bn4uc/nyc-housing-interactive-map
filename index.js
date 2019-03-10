console.log("Huuuu")

//code altered from http://bl.ocks.org/feyderm/e6cab5931755897c2eb377ccbf9fdf18
//and https://github.com/mcnuttandrew/capp-30239/tree/master/week-8-map/soln
//and https://d3-legend.susielu.com/#color-examples


// Promise.all([
//     fetch(
//       'data/nta-clean.json'
//     ).then(data => data.json()),
//     fetch(
//       'data/hmda_per_nta.json' //need to make this dependent on selection (or just address with update fill)
//      ).then(data => data.json()),
//   ]).then(combined => myVis(combined[0], combined[1])); 


//NEED TO REMOVE PARKS AND CEMETERIES

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

// Promise.all([
//   'jsons_for_map/nta-clean.json', 
//   'jsons_for_map/hmda_per_nta.json', 
//   'jsons_for_map/hmda_nta_general_2013.json', 
//   'jsons_for_map/hmda_nta_general_2014.json', 
//   'jsons_for_map/hmda_nta_general_2015.json', 
//   'jsons_for_map/hmda_nta_general_2016.json', 
//   'jsons_for_map/hmda_nta_general_2017.json',
//   'jsons_for_map/hmda_nta_asian_2013.json', 
//   'jsons_for_map/hmda_nta_asian_2014.json', 
//   'jsons_for_map/hmda_nta_asian_2015.json', 
//   'jsons_for_map/hmda_nta_asian_2016.json', 
//   'jsons_for_map/hmda_nta_asian_2017.json', 
//   'jsons_for_map/hmda_nta_black_2013.json', 
//   'jsons_for_map/hmda_nta_black_2014.json', 
//   'jsons_for_map/hmda_nta_black_2015.json', 
//   'jsons_for_map/hmda_nta_black_2016.json', 
//   'jsons_for_map/hmda_nta_black_2017.json', 
//   'jsons_for_map/hmda_nta_white_2013.json', 
//   'jsons_for_map/hmda_nta_white_2014.json', 
//   'jsons_for_map/hmda_nta_white_2015.json', 
//   'jsons_for_map/hmda_nta_white_2016.json', 
//   'jsons_for_map/hmda_nta_white_2017.json', 
//   'jsons_for_map/hmda_nta_other_2013.json', 
//   'jsons_for_map/hmda_nta_other_2014.json', 
//   'jsons_for_map/hmda_nta_other_2015.json', 
//   'jsons_for_map/hmda_nta_other_2016.json', 
//   'jsons_for_map/hmda_nta_other_2017.json'
//   ].map(url => fetch(url).then(data => data.json())))
//     .then(data => myVis(data))
//     .catch(function(error){
//       console.log("Error");
//     });
 


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

var selectedData = hmda_nta_general_2013; //this is working --give it something to start with (should this be a csv)

var selectedVar = 'avg_inc' //this is needed, but doesnt update

  var div = d3.select("body") //trying to create a tooltip! 
    .append("div") 
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

function computeDomain(data, key) {
  return data.reduce((acc, row) => { //this is where the dropdown update gets stuck because it isnt a dataset
    return {
      min: Math.min(acc.min, row[key]),
      max: Math.max(acc.max, row[key])
    };
  }, {min: Infinity, max: -Infinity});
}

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

    svg.append("text")
      .attr("y", height/30 + 50)
      .attr("x", width/5 )             
      .style("text-anchor", "middle")
      .text("Neighborhood Tabulation Area: ");



console.log(selectedData); //once changed this is just a name??? but when we have the equals above, it treats it as data

  function updateFunction(selectedData, selectedVar) {

const varDomain = computeDomain(selectedData, selectedVar); //this works with selectedVar and changes the domain, but the ntaNametoVar still uses avg_inc
console.log(varDomain);

const varScale = d3.scaleLinear().domain([0, varDomain.max]).range([0, 1]);

const colorScale = d => d3.interpolateInferno(Math.sqrt(varScale(d)));

const colorScaleTry = d3.scaleLinear().domain([0, varDomain.max]).range(d3.range(9).map(function(d){
  return d3.interpolateInferno(Math.sqrt(varScale(d)))
})); //attempt 

// COLOR LEGEND - code from https://d3-legend.susielu.com/#color-examples

// var linear = d3.scaleLinear() //this is what they use on line 212 in .scale()
//   .domain([0,10])
//   .range(["rgb(46, 73, 123)", "rgb(71, 187, 94)"]);

var svg2 = d3.select("svg");

svg2.append("g")
  .attr("class", "legendLinear")
  .attr("transform", "translate(110,150)");

var legend = d3.legendColor()
  .labelFormat(d3.format(".2f"))
  .useClass(true)
  .title("Color Legend") //how to get this to be the name of the button that is checked
  .titleWidth(100)
  .scale(varScale); //need to use something here that has colors and numbers - colorScale should work but doesnt have numbers i think 

svg2.select(".legendLinear")
  .call(legend);

  //END LEGEND 

console.log(svg);

const join = svg.selectAll('.ntacode')
    .data(ntaShapes.features);
  
console.log(join, ntaShapes.features);

console.log(selectedData); //this is updated, but just in name, not with the json!!!!
const ntaNameToVar = {}; 
  for (let i = 0; i < selectedData.length; i++){
        const row = selectedData[i];
        ntaNameToVar[row.ntacode] = row.avg_inc; //need to generalize but this doesnt work as selectedVar!!!!
      }
    console.log(ntaNameToVar);


    //THIS IS WORKING DO NOT TOUCH FIRST 6 lines  
    join.enter()
      .append('path')
      .attr('class', 'ntacode')
      .attr('stroke', 'black')  //how to do like if na then fill = grey??
      .attr('d', d => geoGenerator(d))
      .merge(join)
        .attr('fill', d => colorScale(ntaNameToVar[d.properties.ntacode]))
        .on("mouseover", function(d) { 
          div.transition()    
            .duration(200)    
            .style("opacity", .9);    
          div.text(d.properties.ntaname)
            .style("left", width/5 + 140 + "px")   
            .style("top", height/30 + 53 + "px");
          div.text(ntaNameToVar[d.properties.ntacode]) //this is still avg income only
            .style("left", width/5 + 140 + "px")   
            .style("top", height/30 + 53 + "px");
        })          
        .on("mouseout", function(d) {   
          div.transition()    
          .duration(500)    
          .style("opacity", 0); 
        });
  }
   var buttons = d3.select("#dimensions");

  buttons.on("change", function() {
    checked = true;
    selectedVar = d3.event.target.id; //this is pulling the value, but then I need it to recognize as name of data
    console.log(selectedVar);
    updateFunction(selectedData, selectedVar); //this works to recall, but need to use selectedVar above!!
     }); 

  var dropDown = d3.select("#dropdown");

  dropDown.on("change", function() {
    checked = true;
    selectedData = d3.event.target.value; //this is pulling the value, but then I need it to recognize as name of data
    console.log(selectedData);
    updateFunction(selectedData, selectedVar); //maybe this is stored as a string and thus not triggering name of dataset
  }); 

  // this is the first call to the update
  updateFunction(selectedData, selectedVar);
}


