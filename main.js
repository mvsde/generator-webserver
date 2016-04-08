// ADOBE GENERATOR WEBSERVER
//
// Based on https://github.com/tomkrcha/generator-bitmaps
// =============================================================================


(function() {
  'use strict';


  // Load node modules
  // ===================================

  const fs       = require('fs');
  const PNG      = require('pngjs').PNG;
  const http     = require('http');
  const open     = require('open');
  const debounce = require('lodash.debounce');




  // Set global constants and variables
  // ===================================

  const menuID = require('./package.json').name;

  var _document  = null;
  var _generator = null;
  var _config    = null;

  var tempImage = null;

  var openConnections = [];




  // Handle image change with debounce
  // ===================================


  var handleImageChange = debounce(requestEntireDocument, 3000, {
    'leading': true,
    'trailing': true
  });




  // Initialize
  // ===================================


  function init(generator, config) {
    _generator = generator;
    _config = config;

    // Initial image generation
    requestEntireDocument();

    _generator.onPhotoshopEvent('imageChanged', handleImageChange);

    // Open webserver on port 1337
    http.createServer(function (req, res) {
      var fileName = req.url;

      if (fileName === '/stream') {

        // Initialize SSE
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        // Save open connections
        openConnections.push(res);

        // Clean closed connections
        req.connection.addListener('close', function() {
          for (var i = 0; i < openConnections.length; i++) {
            if (openConnections[i] == res) {
              openConnections.splice(i, 1);
              break;
            }
          }
        }, false);

      } else if (fileName === '/') {

        // Create Base64 encoded image
        var b64Img = '<img src="data:image/png;base64,' + tempImage + '" alt="Please wait for Photoshop...">';

        // Write HTTP header
        res.writeHead(200, {'Content-Type': 'text/html'});

        // Write HTML head
        res.write('<!DOCTYPE html>\
        <html><head>\
            <meta name="viewport" content="width=device-width, minimum-scale=1.0">\
            <title>Photoshop Generator Webserver</title>\
            <link rel="icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAA7klEQVR4Ae3Xv0qHUBTA8W8QBG71BE0ijj1DQ48hOPYQPkWbg2/wU4eWXqHVoaknSMQ/NETcICgOknK53jt1vmc7gx84gyje07SEmhHjODMtyf7jB8zBGfaIGuNhGjYbvQATmxlPo4ACCiiggO2UVCGBZy6I6EIBb1wDkLIcB0oeVptP7vgpcwbEKc55kjsKZJUzIE5xycvv7pEzZBGdKyBPEdN/7165Yl3K4gYUyG754J0b/ipzAdangHtytqqwB+QprIvosAfEKexLWeyBHJey//A2nUN//LZegFPYH5CeGPaIhunAcU7EeE7TvgBDCFYGgjAJXwAAAABJRU5ErkJggg==">\
            <style>\
              * { margin: 0; padding: 0; }\
              body { overflow-x: hidden; }\
              img { display: block; width: 100%; height: auto; }\
              @media (min-width: 860px) {\
                img { position: relative; width: auto; left: 50%; transform: translateX(-50%); }\
              }\
            </style>\
          </head><body>')

        // Write Base64 encoded image
        res.write(b64Img);

        // Write HTML foot
        res.write('<script>\
            var es = new EventSource(\'stream\');\
            es.addEventListener(\'ping\', function(event) {\
              window.location.reload();\
            }, false);\
            </script>\
        </body></html>')

        // Close file transmission
        res.end();

      } else {
        // Write HTTP header
        res.writeHead(404, {'Content-Type': 'text/html'});

        // Write HTML file
        res.write('<!DOCTYPE html>\
        <html><head>\
            <meta name="viewport" content="width=device-width, minimum-scale=1.0">\
            <title>Photoshop Generator Webserver</title>\
            <link rel="icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAA7klEQVR4Ae3Xv0qHUBTA8W8QBG71BE0ijj1DQ48hOPYQPkWbg2/wU4eWXqHVoaknSMQ/NETcICgOknK53jt1vmc7gx84gyje07SEmhHjODMtyf7jB8zBGfaIGuNhGjYbvQATmxlPo4ACCiiggO2UVCGBZy6I6EIBb1wDkLIcB0oeVptP7vgpcwbEKc55kjsKZJUzIE5xycvv7pEzZBGdKyBPEdN/7165Yl3K4gYUyG754J0b/ipzAdangHtytqqwB+QprIvosAfEKexLWeyBHJey//A2nUN//LZegFPYH5CeGPaIhunAcU7EeE7TvgBDCFYGgjAJXwAAAABJRU5ErkJggg==">\
          </head><body>\
          <h1>404 Not Found</h1>\
          <a href="/">Return to Image</a>\
        </body></html>')

        // Close file transmission
        res.end();
      }

    }).listen(1337);

    // Open default web browser
    open('http://localhost:1337');
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
              'desc1.putInteger( stringIDToTypeID( "format"), 2 );' + // FORMAT: 2=pixmap, 1=jpeg
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
        rgbaPixels.writeUInt8(pixels[n + 1], i + 1);
        rgbaPixels.writeUInt8(pixels[n + 2], i + 2);
        // Add Alpha
        rgbaPixels.writeUInt8(255, i + 3);

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

      // Set image dimensions
      var png = new PNG({
        width:  pixmap.width,
        height: pixmap.height
      });

      // Set pixel data
      png.data = rgbaPixels;

      // Write temporary PNG image for HTML file generation
      tempImage = PNG.sync.write(png).toString('base64');

      // Ping connected clients to reload
      openConnections.forEach(function(res) {
        res.write('event: ping\n');
        res.write('data: Reload browsers…\n\n');
      });
    },
    function (error) {
        console.error('Error while generating bitmap:', error);
    });
  }


  exports.init = init;
})();
