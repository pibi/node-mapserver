var assert = require('assert'),
    util = require('util'),
    mapserver = require('./mapserver'),
    fs = require('fs'),
    path = require('path'),
    datadir = './data',
    mapfile = 'test.map',
    nomapfile = 'missing.map',
    errormapfile = 'error.map',
    map,
    err;

// test constants
assert.equal(mapserver.MS_OFF, 0, 'MS_OFF not defined');
assert.equal(mapserver.MS_ON, 1, 'MS_ON not defined');

// test accessing basic info about the mapserver build
console.log('mapserver version number: ' + mapserver.getVersionInt());
console.log('mapserver version information: ' + mapserver.getVersion());

// quick error test
err = mapserver.getError();
assert.equal(err.code, 0, 'should be no errors');

// Test default mapfile pattern (must end in .map)
assert.throws(function() { 
  mapserver.loadMap(path.join(datadir), nomapfile);  
}, Error, 'attempting to load a non-existent map should throw an error.');

// check error
err = mapserver.getError();
assert.equal(err.code, 5, 'Default mapfile pattern test failed')

// test resetErrorList
mapserver.resetErrorList();
err = mapserver.getError();
assert.equal(err.code, 0, 'should be no errors');

// test loadMap with missing file
assert.throws(function() { 
  mapserver.loadMap(path.join(datadir, 'missing.map'), nomapfile);  
}, Error, 'attempting to load a non-existent map should throw an error.');

err = mapserver.getError();
assert.equal(err.code, 1, 'Mapserver should complain about a mapfile that does not exist.');

assert.doesNotThrow(function() {
  map = mapserver.loadMap(path.join(datadir, mapfile),datadir);
}, Error, 'loading a valid map file should not throw an error.');

// test getting map properties
assert.equal(map.name, "GMAP_DEMO", 'map name is incorrect');
assert.equal(map.status, mapserver.MS_ON, 'map status is not ON');
assert.equal(map.width, 400, 'getting map width failed');
assert.equal(map.height, 300, 'getting map height failed');
assert.equal(map.cellsize, 0, 'default map cellsize should be 0, got ' + map.cellsize);
assert.equal(map.scaledenom, -1, 'default map scaledenom should be -1, got ' + map.scaledenom);
assert.equal(map.maxsize, 2048, 'getting map maxsize failed');
assert.equal(map.units, mapserver.MS_METERS, 'getting map units failed');
assert.equal(map.resolution, 72, 'getting map resolution failed');
assert.equal(map.defresolution, 72, 'getting map defresolution failed');
assert.equal(map.shapepath, './', 'getting map defresolution failed');
assert.equal(path.normalize(map.mappath), path.normalize(path.join(process.cwd(), 'data')), 'getting map defresolution failed');

// test effect of recompute on cellsize and scaledenom
// todo 
// console.log(map.cellsize);
// 
// map.recompute();
// assert.equal(map.cellsize, 12182.712374581939, 'recomputing map cellsize failed');
// todo
// 
// map.recompute();
// assert.equal(map.scaledenom, 34533691.52101404, 'recomputing map scaledenom failed');

// test setting map properties
map.name = "test_set";
assert.equal(map.name, "test_set", "map name could not be set");  

map.width = 600;
assert.equal(map.width, 600, 'setting map width failed');

map.height = 600;
assert.equal(map.height, 600, 'setting map height failed');

map.maxsize = 4096;
assert.equal(map.maxsize, 4096, 'setting map maxsize failed');

map.units = mapserver.MS_FEET;
assert.equal(map.units, mapserver.MS_FEET, 'setting map units failed');

map.resolution = 96;
assert.equal(map.resolution, 96, 'setting map defresolution failed');

map.defresolution = 96;
assert.equal(map.defresolution, 96, 'setting map defresolution failed');

// test indexed accessor to map.layers
assert.equal(map.layers.foo, undefined, 'map.layers should not expose arbitrary properties');
assert.equal(typeof map.layers.length, 'number', 'map.layers.length should be an integer');
assert.equal(map.layers.length, 1, 'map.layers.length should be 1');

// test accessor for layer name
assert.notEqual(map.layers[0].name,'test', 'layer name should not be test before we change it');
map.layers[0].name = 'test';
assert.equal(map.layers[0].name, 'test', 'layer name should have changed.');

var buffer = map.drawMap();
buffer = buffer.slice(0,buffer.length);
fs.writeFile('test_buffer.gif', buffer, function(err) {
  if (err) throw err;
});

function printError(err) {
  if (err != undefined) {
    try {
      console.log('Error code ' + err.code + ' (' + err.codeStr + ') in ' + err.routine + ': ' + err.message);
      return true;
    } catch (e) {
      return false;
    }
  }
}