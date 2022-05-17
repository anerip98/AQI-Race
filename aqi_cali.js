//time frame for analysis
var t1_1 = '2021-01-01'
var t1_2 = '2021-12-31'

//pallettes
var no2_viz = {"min":0,"max":0.0002,"palette":["black","blue","purple","cyan","green","yellow","red"]};
var aerosol_viz = {"min":-1.5,"max":-1,"palette":["black","blue","purple","cyan","green","yellow","red"]};
var co_viz = {"min":0.035,"max":0.036,"palette":["black","blue","purple","cyan","green","yellow","red"]};
// var data_viz = no2_viz

// ------------------ ROI --------------------
// var ROI = ee.FeatureCollection("users/aneripatel/la").geometry();
// var ROI = ee.FeatureCollection("users/aneripatel/sandiego").geometry();
var ROI = ee.FeatureCollection("projects/ee-aneripatel/assets/sanfran").geometry();
print(ROI.area().divide(1e6).round(),"km2");
Map.centerObject(ROI, 10);

// // -------------------------------------------------------------------

// Data Collection - Offline data
var co = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_CO')
  .filterBounds(ROI)
  .select('CO_column_number_density')
  .filterDate(t1_1, t1_2)
  .mean()
  .clip(ROI);
  
var aerosol = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_AER_AI')
  .filterBounds(ROI)
  .select('absorbing_aerosol_index')
  .filterDate(t1_1, t1_2)
  .mean()
  .clip(ROI);
  
var no2 = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_NO2')
  .filterBounds(ROI)
  .filterDate(t1_1, t1_2)
  .select('tropospheric_NO2_column_number_density')
  .mean()
  .clip(ROI);
  
// run for each of the 3 - SD, SF, LA for CO, AEROSOL
var data = aerosol

// reprojecting the data to required crs for further analysis
data = data.reproject({crs:"EPSG:4326", scale:100})
print(data)

//mean of a spatially distributed value
// var mean= data.reduceRegion({
//   reducer: ee.Reducer.mean(),
//   geometry: ROI,
//   scale:1000
// });

// print(mean)

Map.addLayer(no2, no2_viz, 'S5P N02');
Map.addLayer(aerosol, aerosol_viz, 'S5P Aerosol');
Map.addLayer(co, co_viz, 'S5P CO');

// adding a colorscale legend
// var vis = data_viz
// var palette = vis;
// function makeColorBarParams(palette) {
//   return {
//     bbox: [0, 0, 1, 0.1],
//     dimensions: '100x10',
//     format: 'png',
//     min: 0,
//     max: 1,
//     palette: palette,
//   };
// }
// // Create the color bar for the legend.
// var colorBar = ui.Thumbnail({
//   image: ee.Image.pixelLonLat().select(0),
//   params: makeColorBarParams(vis.palette),
//   style: {stretch: 'horizontal', margin: '0px 8px', maxHeight: '24px'},
// });
// // Create a panel with three numbers for the legend.
// var legendLabels = ui.Panel({
//   widgets: [
//     ui.Label(vis.min, {margin: '4px 8px'}),
//     ui.Label(
//         ((vis.max-vis.min) / 2+vis.min),
//         {margin: '4px 8px', textAlign: 'center', stretch: 'horizontal'}),
//     ui.Label(vis.max, {margin: '4px 8px'})
//   ],
//   layout: ui.Panel.Layout.flow('horizontal')
// });
// var legendTitle = ui.Label({
//   value: 'NO2 Concentration',
//   style: {fontWeight: 'bold'}
// });
// // Add the legendPanel to the map.
// var legendPanel = ui.Panel([legendTitle, colorBar, legendLabels]);
// Map.add(legendPanel);


// replace column name here to get projection
var projection = data.select("absorbing_aerosol_index").projection().getInfo();
print(projection)

// exporting image to drive as a geotiff
Export.image.toDrive({
      image: data,
      maxPixels: 1e13,
      description: 'AE_SF',
      crs: projection.crs,
      crsTransform: projection.transform,
      region: ROI,
      fileFormat: 'GeoTIFF',
      formatOptions: {
        cloudOptimized: true
      } 
    });
