/*******************************************************
 * Forest Mapping Algeria — Figures (GEE, JavaScript)
 * Figures:
 *   1) ESA WorldCover (official colors) + legend + north arrow
 *   2) Sentinel-2 RGB (median 2023) + legend + north arrow + scale bar
 *   3) DEM HSV (Aspect/Slope/Hillshade) + NDVI overlay + colorbar legend
 *
 * Usage:
 *   Set FIGURE = 1 or 2 or 3, then Run.
 *******************************************************/

var FIGURE = 1; // <-- change to 1, 2, or 3

// ------------------------------------------------------
// 0) Common: Algeria boundary + map options
// ------------------------------------------------------
var algeria = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
  .filter(ee.Filter.eq('country_na', 'Algeria'));

Map.setOptions('ROADMAP');
Map.centerObject(algeria, 5);
Map.addLayer(algeria.style({color: '000000', fillColor: '00000000', width: 2}), {}, 'Algeria border', true);

// ------------------------------------------------------
// 1) UI helpers
// ------------------------------------------------------
function addNorthArrow(position) {
  var north = ui.Panel({
    style: {
      position: position || 'top-left',
      padding: '8px 10px',
      backgroundColor: 'rgba(255,255,255,0.85)'
    }
  });
  north.add(ui.Label({value: 'N', style: {fontWeight: 'bold', fontSize: '14px', textAlign: 'center'}}));
  north.add(ui.Label({value: '↑', style: {fontSize: '18px', textAlign: 'center', margin: '-6px 0 0 0'}}));
  Map.add(north);
}

function addSimpleScaleBarKm(labelText) {
  // Manual scalebar (approx.) as GEE doesn’t always provide a true widget.
  var scalep = ui.Panel({
    style: {
      position: 'bottom-right',
      padding: '10px',
      backgroundColor: 'rgba(255,255,255,0.85)'
    }
  });

  scalep.add(ui.Label({
    value: 'Scale (approx.)',
    style: {fontWeight: 'bold', fontSize: '11px', margin: '0 0 4px 0'}
  }));

  var bar = ui.Panel({layout: ui.Panel.Layout.Flow('horizontal')});
  bar.add(ui.Label('', {backgroundColor: '#000000', padding: '4px 30px', margin: '0'}));
  bar.add(ui.Label('', {backgroundColor: '#FFFFFF', padding: '4px 30px', margin: '0', border: '1px solid #000'}));
  scalep.add(bar);

  scalep.add(ui.Label({
    value: labelText || '0            200 km',
    style: {fontSize: '10px', margin: '3px 0 0 0'}
  }));

  Map.add(scalep);
}

function makeLegendPanel(title, position) {
  var panel = ui.Panel({
    style: {
      position: position || 'bottom-left',
      padding: '10px 12px',
      backgroundColor: 'rgba(255,255,255,0.95)'
    }
  });
  panel.add(ui.Label({value: title, style: {fontWeight: 'bold', fontSize: '12px', margin: '0 0 6px 0'}}));
  return panel;
}

function addLegendRow(panel, color, name) {
  var row = ui.Panel(
    [
      ui.Label('', {backgroundColor: color, padding: '8px', margin: '0 6px 0 0'}),
      ui.Label(name, {fontSize: '11px'})
    ],
    ui.Panel.Layout.Flow('horizontal')
  );
  panel.add(row);
}

// Colourbar helper (for Figure 3)
function makeColorBar(palette, widthPx) {
  var bar = ee.Image.pixelLonLat().select(0).divide(1).clamp(0, 1);
  return ui.Thumbnail({
    image: bar,
    params: {
      bbox: [0, 0, 1, 0.1],
      dimensions: (widthPx || 280) + 'x18',
      format: 'png',
      min: 0,
      max: 1,
      palette: palette
    },
    style: {stretch: 'horizontal', margin: '4px 0 2px 0'}
  });
}

function makeMinMaxRow(minLabel, maxLabel) {
  var row = ui.Panel({layout: ui.Panel.Layout.flow('horizontal'), style: {margin: '0 0 8px 0'}});
  row.add(ui.Label(minLabel, {fontSize: '10px', margin: '0'}));
  row.add(ui.Label('', {stretch: 'horizontal'}));
  row.add(ui.Label(maxLabel, {fontSize: '10px', margin: '0'}));
  return row;
}

// ------------------------------------------------------
// FIGURE 1 — ESA WorldCover (official colors)
// ------------------------------------------------------
function figure1_WorldCover() {
  var wc = ee.ImageCollection('ESA/WorldCover/v100').first().select('Map');

  var wcVis = {
    min: 10,
    max: 95,
    palette: [
      '006400', // Trees
      'FFBB22', // Shrubland
      'FFFF4C', // Grassland
      'F096FF', // Cropland
      'FA0000', // Built-up
      'B4B4B4', // Bare
      'F0F0F0', // Snow/Ice
      '0064C8', // Water
      '0096A0', // Wetlands
      '00CF75'  // Mangroves
    ]
  };

  Map.addLayer(wc.clip(algeria), wcVis, 'ESA WorldCover 2020', true);

  var legend = makeLegendPanel('ESA WorldCover 2020', 'bottom-left');
  addLegendRow(legend, '#006400', 'Trees');
  addLegendRow(legend, '#FFBB22', 'Shrubland');
  addLegendRow(legend, '#FFFF4C', 'Grassland');
  addLegendRow(legend, '#F096FF', 'Cropland');
  addLegendRow(legend, '#FA0000', 'Built-up');
  addLegendRow(legend, '#B4B4B4', 'Bare');
  addLegendRow(legend, '#F0F0F0', 'Snow/Ice');
  addLegendRow(legend, '#0064C8', 'Water');
  addLegendRow(legend, '#0096A0', 'Wetlands');
  addLegendRow(legend, '#00CF75', 'Mangroves');
  Map.add(legend);

  addNorthArrow('top-left');
}

// ------------------------------------------------------
// FIGURE 2 — Sentinel-2 RGB (median 2023) + legend + scale
// ------------------------------------------------------
function figure2_SentinelRGB() {
  var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    .filterBounds(algeria)
    .filterDate('2023-01-01', '2023-12-31')
    .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', 10));

  var s2med = s2.median().clip(algeria);

  var rgbVis = {
    bands: ['B4', 'B3', 'B2'],
    min: 0,
    max: 3000,
    gamma: 1.1
  };

  Map.addLayer(s2med, rgbVis, 'Sentinel-2 RGB (median 2023)', true);

  var legend = makeLegendPanel('Sentinel-2 (RGB composite)', 'bottom-left');
  var swatch = ui.Label('', {backgroundColor: '#dddddd', padding: '10px', margin: '0 6px 0 0'});
  var legText = ui.Label('B4 (R), B3 (G), B2 (B) • median 2023', {fontSize: '11px'});
  legend.add(ui.Panel([swatch, legText], ui.Panel.Layout.Flow('horizontal')));
  Map.add(legend);

  addNorthArrow('top-left');
  addSimpleScaleBarKm('0            200 km');
}

// ------------------------------------------------------
// FIGURE 3 — DEM HSV + NDVI overlay + colorbar legend
// ------------------------------------------------------
function figure3_DEMHSV_NDVI() {
  // Sentinel-2: select only needed bands
  var s2 = ee.ImageCollection('COPERNICUS/S2')
    .filterBounds(algeria)
    .filterDate('2023-01-01', '2023-12-31')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
    .select(['B2', 'B3', 'B4', 'B8']);

  var sentinel2 = s2.median().clip(algeria);

  // DEM
  var dem = ee.Image('USGS/SRTMGL1_003').select('elevation').clip(algeria);

  // NDVI
  var ndvi = sentinel2.normalizedDifference(['B8', 'B4']).rename('NDVI');

  // Slope + Aspect
  var slope  = ee.Terrain.slope(dem).rename('slope');
  var aspect = ee.Terrain.aspect(dem).rename('aspect');

  // Hillshade + stretch
  var hillshade = ee.Terrain.hillshade(dem).rename('hillshade');

  var hsStats = hillshade.reduceRegion({
    reducer: ee.Reducer.percentile([2, 98]),
    geometry: algeria.geometry(),
    scale: 90,
    maxPixels: 1e9,
    bestEffort: true
  });

  var hsMin = ee.Number(hsStats.get('hillshade_p2'));
  var hsMax = ee.Number(hsStats.get('hillshade_p98'));

  var val = hillshade.subtract(hsMin).divide(hsMax.subtract(hsMin)).clamp(0, 1);

  // Saturation from slope
  var sat = slope.divide(60).clamp(0, 1);
  sat = sat.pow(0.75).multiply(0.90);

  // Darken a bit
  val = val.pow(1.20);

  // Hue from aspect
  var hue = aspect.divide(360).clamp(0, 1);

  // HSV -> RGB
  var demRGB = ee.Image.cat([hue, sat, val]).hsvToRgb();

  // NDVI overlay visualization
  var ndviColor = ndvi.visualize({
    min: -1, max: 1,
    palette: ['0000ff', 'ffffff', '00ff00']
  });

  // “alpha” mask (fade in)
  var ndviAlpha = ndvi.subtract(0.15).divide(0.6).clamp(0, 1).multiply(0.55);

  // Composite
  var composite = ee.ImageCollection([
    demRGB.visualize({min: 0, max: 1}),
    ndviColor.updateMask(ndviAlpha)
  ]).mosaic();

  Map.addLayer(composite, {}, 'DEM HSV + NDVI overlay', true);

  // Optional toggles
  Map.addLayer(ndvi, {min: -1, max: 1, palette: ['0000ff', 'ffffff', '00ff00']}, 'NDVI (raw)', false);
  Map.addLayer(slope, {min: 0, max: 60, palette: ['ffffff', 'a52a2a']}, 'Slope', false);
  Map.addLayer(aspect, {min: 0, max: 360, palette: ['0000ff', '00ff00', 'ffff00', 'ff0000', '0000ff']}, 'Aspect', false);

  // Big legend panel
  var panel = ui.Panel({
    style: {
      position: 'bottom-left',
      padding: '12px 12px 10px 12px',
      width: '360px',
      backgroundColor: 'rgba(255,255,255,0.95)'
    }
  });

  panel.add(ui.Label({
    value: 'Algeria – NDVI & DEM (HSV)',
    style: {fontWeight: 'bold', fontSize: '16px', margin: '0 0 8px 0'}
  }));

  panel.add(ui.Label('DEM (HSV encoding)', {fontWeight: 'bold', margin: '2px 0 2px 0'}));
  panel.add(ui.Label('Hue = Aspect • Saturation = Slope • Value = Hillshade',
    {fontSize: '10px', color: '555555', margin: '0 0 8px 0'}));

  panel.add(ui.Label('NDVI (overlay)', {fontWeight: 'bold', margin: '4px 0 0 0'}));
  panel.add(makeColorBar(['0000ff', 'ffffff', '00ff00'], 280));
  panel.add(makeMinMaxRow('Low / water, bare', 'High / dense veg'));

  panel.add(ui.Label('Aspect (Hue)', {fontWeight: 'bold', margin: '2px 0 0 0'}));
  panel.add(makeColorBar(['0000ff', '00ff00', 'ffff00', 'ff0000', '0000ff'], 280));
  panel.add(makeMinMaxRow('0°', '360°'));

  panel.add(ui.Label('Slope (Saturation)', {fontWeight: 'bold', margin: '2px 0 0 0'}));
  panel.add(makeColorBar(['ffffff', 'a52a2a'], 280));
  panel.add(makeMinMaxRow('Flat', 'Steep (~60°)'));

  panel.add(ui.Label('Data: Sentinel-2 (2023) • SRTM 30m',
    {fontSize: '10px', color: '555555', margin: '8px 0 0 0'}));

  Map.add(panel);

  addNorthArrow('top-left');
}

// ------------------------------------------------------
// Run selected figure
// ------------------------------------------------------
if (FIGURE === 1) figure1_WorldCover();
if (FIGURE === 2) figure2_SentinelRGB();
if (FIGURE === 3) figure3_DEMHSV_NDVI();
