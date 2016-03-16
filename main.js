// ADOBE GENERATOR WEBSERVER
//
// Based on https://github.com/tomkrcha/generator-bitmaps
// =============================================================================


(function() {
  'use strict';


  // Load node modules
  // ===================================

  const fs   = require('fs');
  const path = require('path');
  const PNG  = require('pngjs').PNG;
  const http = require('http');
  const open = require('open');
  const bs   = require('browser-sync');




  // Set global constants and variables
  // ===================================

  const menuID    = require('./package.json').name;
  const menuLabel = '$$$/JavaScripts/Generator/Webserver/Menu=Webserver';

  var _document  = null;
  var _generator = null;
  var _config    = null;

  var tempImagePath = path.resolve(__dirname + '/www/image.png');

  var browserSync = bs.create();




  // Initialize
  // ===================================

  function init(generator, config) {
    _generator = generator;
    _config = config;

    _generator.addMenuItem(menuID, menuLabel, true, false).then(
      function () {
        console.log('Added menu item:', menuID);
      }, function() {
        console.error('Menu creation failed:', menuID);
      }
    );

    // Listen to menu button change
    _generator.onPhotoshopEvent('generatorMenuChanged', handleGeneratorMenuChanged);
  }




  // Handle generator menu changed
  // ===================================

  function handleGeneratorMenuChanged(event) {
    var menu = event.generatorMenuChanged;

    // Only handle menu button change for this plugin
    if (!menu || menu.name !== menuID) {
      return
    }

    // Set menu state
    updateMenuState(true);

    // Initial image generation
    requestEntireDocument();

    browserSync.init({
      server: __dirname + '/www'
    });

    /*fs.watch(__dirname + '/www', function(event, filename) {
      console.log('File changed', filename);
      browserSync.reload();
    });*/

    _generator.onPhotoshopEvent('imageChanged', handleImageChanged);
  }




  // Update menu state
  // ===================================

  function updateMenuState(enabled) {
    _generator.toggleMenu(menuID, true, enabled);
  }




  // Handle image changed
  // ===================================

  function handleImageChanged(event) {
    requestEntireDocument();
  }




  // Request entire document
  // ===================================


  function requestEntireDocument() {
    _generator.getDocumentInfo().then(
      function (document) {
        getFlattenedDocumentBitmap(document);
      },
      function (error) {
        console.error('Error while getting document info:', error);
      }
    ).done();
  }




  // Get flattened document bitmap
  // ===================================

  function getFlattenedDocumentBitmap(document) {
    _document = document;

    // A little bit of Alchemy
    // sendDocumentThumbnailToNetworkClient (flattened preview of currently opened doc)
    var str = 'var idNS = stringIDToTypeID("sendDocumentThumbnailToNetworkClient" );' +
              'var desc1 = new ActionDescriptor();' +
              'desc1.putInteger( stringIDToTypeID( "width" ), app.activeDocument.width );' + // width
              'desc1.putInteger( stringIDToTypeID( "height" ), app.activeDocument.height );' + // height
              'desc1.putInteger( stringIDToTypeID("format"), 2 );' + // FORMAT: 2=pixmap, 1=jpeg
              'executeAction( idNS, desc1, DialogModes.NO );' +
              // Set document units to PIXELS, users often use POINTS, so we force it to PIXELS
              'app.preferences.rulerUnits = Units.PIXELS;' +
              // We return back the current width and height as string divided by a comma
              // The value of the last line always gets returned back
              'app.activeDocument.width+","+app.activeDocument.height;';

    var pixmap = {};


    _generator._photoshop.on('pixmap', function (messageID, messageBody) {
      // documentThumbnail always comes in RGB, without Alpha element
      pixmap.channelCount = 3;
      pixmap.pixels = messageBody;
      //pixmap.pixels.parent = {};
    });


    _generator.evaluateJSXString(str).then(
    function (result) {
      // Get width and height
      var obj = result.split(',');

      pixmap.width  = parseInt(obj[0]);
      pixmap.height = parseInt(obj[1]);

      // Divider value is on 12th byte
      var divider = pixmap.pixels[12]; // 16 or 32 or more

      // Rconstruct buffer by bitmap size multiplied by 4 for RGBA
      var len = pixmap.width * pixmap.height * 4;
      var rgbaPixels = new Buffer(len);

      var pixels = pixmap.pixels;

      // First 16 bytes of pixmap is header, skip it
      var n = 16;
      for (var i = 0; i < len; i += 4 ){
        rgbaPixels.writeUInt8(pixels[n], i);
        rgbaPixels.writeUInt8(pixels[n+1], i + 1);
        rgbaPixels.writeUInt8(pixels[n+2], i + 2);
        // Add Alpha
        rgbaPixels.writeUInt8(255, i + 3);
        //rgbaPixels.writeUInt8(pixels[n+3], i+3);

        n += 3;

        // Detect the new line and skip bytes by 1 (16) or 2 (32)
        if (i%pixmap.width == 1) {
          if (divider == 16) {
              n += 1;
          } else if (divider == 32) {
              n += 2;
          }
        }
      }

      var png = new PNG({
        width:  pixmap.width,
        height: pixmap.height
      });

      // set pixel data
      png.data = rgbaPixels;

      // Write file and reload browsers
      png.pack().pipe(fs.createWriteStream(tempImagePath).on('finish', browserSync.reload));
    },
    function (error) {
        console.error('Error while generating bitmap:', error);
    });
  }


  exports.init = init;

})();
