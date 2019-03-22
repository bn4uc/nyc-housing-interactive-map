

//code altered from http://bl.ocks.org/feyderm/e6cab5931755897c2eb377ccbf9fdf18
//and https://github.com/mcnuttandrew/capp-30239/tree/master/week-8-map/soln
//and uses http://bl.ocks.org/feyderm/e6cab5931755897c2eb377ccbf9fdf18 for creating legend


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

  const width = 600;
  const height = 550;
  const margin = {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10
  };

function computeDomain(data, key) { 
  return data.reduce((acc, row) => { 
    if (!isFinite(row[key])) {
      return acc;
    }
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


console.log(selectedData); 


  function updateFunction(selectedData, selectedVar, prettyVar) {

const varDomain = computeDomain(selectedData, selectedVar); 
console.log(varDomain);

const varScale = d3.scaleLinear().domain([varDomain.min, varDomain.max]).range([0, 1]);

const colorScale = d => d3.interpolateYlOrRd(Math.sqrt(varScale(d)));


//legend start- from http://bl.ocks.org/syntagmatic/e8ccca52559796be775553b467593a9f
 var colorScale1 = d3.scaleSequential(d3.interpolateYlOrRd)
   .domain([varDomain.min, varDomain.max]);

 continuous("#legend1", colorScale1);


function continuous(selector_id, colorscale) {
  var legendheight = 200,
      legendwidth = 80,
      margin = {top: 10, right: 60, bottom: 10, left: 2};

  var svg2 = d3.select(selector_id)
    .style("height", legendheight + "px")
    .style("width", legendwidth + "px")
    .append("canvas")
    .attr("height", legendheight - margin.top - margin.bottom)
    .attr("width", 1)
    .style("height", (legendheight - margin.top - margin.bottom) + "px")
    .style("width", (legendwidth - margin.left - margin.right) + "px")
    .style("border", "1px solid #000")
    .style("position", "absolute")
    .style("top", 280  + "px") //this changes where the block of color goes 
    .style("left", 200 + "px")
    .node();

  var ctx = svg2.getContext("2d");

  var legendscale = d3.scaleLinear()
    .range([1, legendheight - margin.top - margin.bottom])
    .domain(colorscale.domain());

  // image data hack based on http://bl.ocks.org/mbostock/048d21cf747371b11884f75ad896e5a5
  var image = ctx.createImageData(1, legendheight);
  d3.range(legendheight).forEach(function(i) {
    var c = d3.rgb(colorscale(legendscale.invert(i)));
    image.data[4*i] = c.r;
    image.data[4*i + 1] = c.g;
    image.data[4*i + 2] = c.b;
    image.data[4*i + 3] = 255;
  });
  ctx.putImageData(image, 0, 0);

  var legendaxis = d3.axisRight()
    .scale(legendscale)
    .tickSize(4)
    .ticks(5);

  var svg = d3.select(selector_id)
    .append("svg")
    .attr("height", (legendheight) + "px")
    .attr("width", (legendwidth) + "px")
    .style("position", "absolute")
    .style("left", 200 + "px") //this moves the axis
    .style("top", 270 +  "px") //must be ten less than style top of the image block

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
    .call(legendaxis);
};
//legend end

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


    //creation of map 
    join.enter()
      .append('path')
      .attr('class', 'ntacode')
      .attr('stroke', 'black') 
      .attr('d', d => geoGenerator(d))
      .merge(join)
        .attr('fill', d => colorScale(ntaNameToVar[d.properties.ntacode])) 
        .on("mouseover", function(d) { 
          div.transition()    
            .duration(200)    
            .style("opacity", .9);    
          div.text("Neighborhood Tabulation Area (NTA):  " + d.properties.ntaname + " ----"+ prettyVar +":  "+ ntaNameToVar[d.properties.ntacode]) //pretty var updates within function
            .style("left",310 + "px")   //location of the tooltip
            .style("top", 280 + "px"); 
        })          
        .on("mouseout", function(d) {   
          div.transition()    
          .duration(500)    
          .style("opacity", 0); 
        });
  }
   var buttons = d3.select("#dimensions");

  buttons.on("change", function() {
    d3.select('#legend1')
   .selectAll('svg')
   .remove();

    checked = true;
    prettyVar = d3.event.target.value;
    console.log(prettyVar);
    selectedVar = d3.event.target.id; 
    console.log(selectedVar, dataDict[selectedData], selectedData);
    updateFunction(selectedData, selectedVar, prettyVar); 
     }); 

  var dropDown = d3.select("#dropdown");

  dropDown.on("change", function() {
    d3.select('#legend1')
   .selectAll('svg')
   .remove();

    checked = true;
    selectedData = dataDict[d3.event.target.value]; 
    console.log(selectedData);
    updateFunction(selectedData, selectedVar, prettyVar); 
  }); 

  // this is the first call to the update
  updateFunction(selectedData, selectedVar, prettyVar);
}


