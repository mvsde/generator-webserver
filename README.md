# Adobe Generator Webserver

Open the current Photoshop document as HTML with any web browser. Automatically reload HTML if the Photoshop document changes.


## Dependencies

* Adobe Photoshop
* [Node.js](https://nodejs.org)
* [Adobe Generator Core](https://github.com/adobe-photoshop/generator-core/archive/master.zip)


## Installation

### Folder Structure

This tutorial uses the following folder structure. If you know what you're doing you can easily alter this.

```
- adobe-generator
  - generator-core
  - plugins
    - generator-webserver
```

### Step-by-Step Installation

1. Activate remote connection to Photoshop Generator:
  1. In Photoshop go to **Preferences** > **Plug-Ins**.
  2. Select **Enable Remote Connections**.
  3. Set **password** as password.
  4. Restart Photoshop.
2. Unzip the contents of the [Generator Core](https://github.com/adobe-photoshop/generator-core/archive/master.zip) into **adobe-generator/generator-core**.
3. Unzip the contents of [this plugin](https://github.com/mvsde/generator-webserver/archive/master.zip) into **adobe-generator/plugins/generator-webserver**.
4. Run `npm install` inside **adobe-generator/generator-core** and **adobe-generator/plugins/generator-webserver**.


## Usage

1. Switch to **adobe-generator/generator-core**.
2. Run `node app.js -f ../plugins`.

The selected Photoshop document is available at http://localhost:1337. This address automatically opens in the default web browser.

The server establishes SSE tunnels to all clients. Photoshop document changes trigger a reload event.
