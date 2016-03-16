# Adobe Generator Webserver

Open the current Photoshop document as an HTML file with any web browser. Uses the Adobe Generator.


## Dependencies
* [Node.js](https://nodejs.org)
* [Generator Core](https://github.com/adobe-photoshop/generator-core/archive/master.zip)


## Installation
1. Create the following file structure somewhere on your machine:

```
- adobe-generator
  - generator-core
  - plugins
    - generator-webserver
```

2. Activate remote connection to Photoshop Generator:
  1. Go to Preferences > Plug-Ins.
  2. Select `Enable Remote Connections`.
  3. Set `password` as password.
  4. Restart Photoshop.
3. Unzip the contents of the previously downloaded Generator Core into the corresponding folder.
4. Get [this plugin](https://github.com/mvsde/generator-webserver/archive/master.zip) and place it in `generator-webserver`
5. Run `npm install` inside `generator-core` and `generator-webserver`.
6. `cd` into `generator-core`.
7. Run `node app.js -f ../plugins`.


## Usage
In Photoshop activate `File > Generate > Webserver`.

Generator Webserver automatically opens the default web browser via a BrowserSync instance. If the Photoshop document is changed the web browser will be reloaded.


## ToDo
* [ ] Add option to disable the webserver once it started.
