# Adobe Generator Webserver

Open the current Photoshop document as an HTML file with any web browser. Uses the Adobe Generator.


## Dependencies
* [Node.js](https://nodejs.org)
* [Generator Core](https://github.com/adobe-photoshop/generator-core/archive/master.zip)


## Installation
Create the following file structure somewhere:

```
- adobe-generator
  - generator-core
  - plugins
    - generator-webserver
```

1. Activate remote connection to Photoshop Generator:
  1. Go to Preferences > Plug-Ins.
  2. Select `Enable Remote Connections`.
  3. Set `password` as password.
  4. Restart Photoshop.
2. Unzip the contents of the previously downloaded Generator Core into the corresponding folder.
3. Get [this plugin](https://github.com/mvsde/generator-webserver/releases/latest) and place it in `generator-webserver`
4. Run `npm install` inside `generator-core` and `generator-webserver`.
5. `cd` into `generator-core`.
6. Run `node app.js -f ../plugins`.


## Usage
In Photoshop activate `File > Generate > Webserver`.

The selected Photoshop document is available via http://localhost:1337.

The server establishes SSE tunnels to all clients. If the Photoshop image changes all clients will be reloaded.


## ToDo
* [ ] Make plugin available from built-in Photoshop Generator. Strangely not working…
* [ ] Add option to disable the webserver once it started.
* [x] Move from filesystem-based HTML/PNG to RAM-only solution for faster file serving.
