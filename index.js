console.log("Huuuu")

//code altered from http://bl.ocks.org/feyderm/e6cab5931755897c2eb377ccbf9fdf18
//and https://github.com/mcnuttandrew/capp-30239/tree/master/week-8-map/soln
//and uses https://d3-legend.susielu.com/#color-examples


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





function myVis(data) { 
  

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

const dataDict = {
ntaShapes, hmda_per_nta, 
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
}


var selectedData = hmda_nta_general_2013; 

var selectedVar = 'avg_loan_amount';

var prettyVar = "Average Loan Amount";

  var div = d3.select("body") 
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

function computeDomain(data, key) { //need to know what is going on in here
  return data.reduce((acc, row) => { 
    if (!isFinite(row[key])) {
      return acc;
    }
    return {
      min: Math.min(acc.min, row[key]), //something about this is not working for some vars/races/years
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
      .attr("y", height-100)
      .attr("x", width - 400)             
      .style("text-anchor", "middle")
      .text("Source: Home Mortgage Discolure Act Data, CFPB");


console.log(selectedData); 

  function updateFunction(selectedData, selectedVar, prettyVar) {

const varDomain = computeDomain(selectedData, selectedVar); 
console.log('11111', selectedVar)
console.log(varDomain);

const varScale = d3.scaleLinear().domain([varDomain.min, varDomain.max]).range([0, 1]);
console.log(varScale);

const colorScale = d => d3.interpolateYlOrRd(Math.sqrt(varScale(d)));
console.log(colorScale);


  //color legend - won't show colors yet 
//is this one better? with just one number? otherqise people might think the splits are weirder

//   var svg2 = d3.select("svg");

// svg2.append("g")
//   .attr("class", "legendLinear")
//   .attr("transform", "translate(110,85)");

// var legend = d3.legendColor()
//   .labelFormat(d3.format(".2f"))
//   .useClass(true)
//   .title("Color Legend") //how to get this to be the name of the button that is checked
//   .titleWidth(100)
//   .scale(varScale); //need to use something here that has colors and numbers - colorScale should work but doesnt have numbers i think 

// svg2.select(".legendLinear")
//   .call(legend);

var quantize = d3.scaleQuantize()
  .domain([ varDomain.min, varDomain.max])
  .range(d3.range(5)
    .map(function(i) { return "q" + i + "-9"; })); //what is this returning? the number splits? 


var svg2 = d3.select("svg");

svg2.append("g")
  .attr("class", "legendQuant")
  .attr("transform", "translate(110,85)");

var legend = d3.legendColor()
  .labelFormat(d3.format(".2f"))
  .useClass(true)
  .title(prettyVar)
  .titleWidth(100)
  .scale(quantize);

svg2.select(".legendQuant")
  .call(legend);


console.log(svg);

const join = svg.selectAll('.ntacode')
    .data(ntaShapes.features);
  
console.log(join, ntaShapes.features);

console.log(selectedData); 
const ntaNameToVar = {}; 
  for (let i = 0; i < selectedData.length; i++){
        const row = selectedData[i];
        ntaNameToVar[row.ntacode] = row[selectedVar]; 
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
          div.text("Neighborhood Tabulation Area (NTA):  " + d.properties.ntaname + " ----"+ prettyVar +":  "+ ntaNameToVar[d.properties.ntacode]) //pretty var updates within function
            .style("left", width/5 + 210 + "px")   
            .style("top", height/30 + 50 + "px");
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
    prettyVar = d3.event.target.value;
    console.log(prettyVar);
    selectedVar = d3.event.target.id; 
    console.log(selectedVar, dataDict[selectedData], selectedData);
    updateFunction(selectedData, selectedVar, prettyVar); 
     }); 

  var dropDown = d3.select("#dropdown");

  dropDown.on("change", function() {
    checked = true;
    selectedData = dataDict[d3.event.target.value]; 
    console.log(selectedData);
    updateFunction(selectedData, selectedVar, prettyVar); 
  }); 

  // this is the first call to the update
  updateFunction(selectedData, selectedVar, prettyVar);
}


