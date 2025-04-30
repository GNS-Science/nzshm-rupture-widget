# nzshm_rupture_widget

A [Jupyter Notebook](https://jupyter.org/) widget for displaying 3D data on a [Cesium](https://cesium.com/platform/cesiumjs/) map. 

![image](./docs/Screenshot%202024-09-25%20112036.png)

Developed for displaying faults and ruptures for [Te Tauira Matapae Pūmate Rū i Aotearoa • New Zealand National Seismic Hazard Model](https://nshm.gns.cri.nz/)

## Installation

```sh
pip install nzshm_rupture_widget
```

*Important*: after installing `nzshm_rupture_widget`, restart your browser. Closing and re-opening a tab is not sufficient.

## Usage

The simplest way to use the widget:

```Python
from nzshm_rupture_widget import geojson_3d_map

geojson_3d_map([geo_json_data])
```

This will return a widget that displays the `geo_json_data` on a map with default controls. `geojson_3d_map()` expects a list of GeoJSON objects, and it provides a control to switch between these objects.

Behind the scenes, `geojson_3d_map` creates a number of widgets and adds them to a `MapLayoutBuilder` which arranges the widgets in a way that makes sense. It places a map widget in the background and control widgets on top of that. Control widgets can be added in each of the four corners and will be arranged on the left-hand side and the right-hand side of the map. Here is a simple example of what that looks like:

```Python
cesium = CesiumWidget(data = [geojson_data])
homeButton = HomeWidget(cesium)
fullscreenButton = FullScreenWidget()

layout = MapLayoutBuilder(cesium)\
            .top_left(
                homeButton,
                fullscreenButton)
layout.build()
```

There is also the helper function `decorate()` that creates a layout with standard controls.

See `samples/examples.ipynb` for more complex examples.


## Development

Required tools:

- node
- pip
- docker

Setting up JavaScript development:

```
npm update
npm install
```

Setting up Python development (in your Python environment):

```
pip install -r ./requirements.txt
```

Build scripts can be found in `package.json` and can be run with

```
npm run <script-name>
```

- `dev`: Starts an `esbuild` process that watches JavaScript files for changes and bundles them so that they are available in the `WORKDIR/dev.ipynb` and `samples/examples.ipynb` notebooks.
- `serve`: Starts an `mkdocs` process that watches `.py` files, generates docs and serves them .
- `test`: Starts a `vitest` process that watches `.js` files and runs tests.
- `package`: Creates a Python package.
- `docker-build`: Creates a docker image for running the provided notebooks.
- `docker`: Creates a container and runs it, mounting this project.


Using the provided Docker image:

Use `docker-build` to create a docker image and `docker` ro create a container from this image and run it.

This will print a link of the form

```
http://127.0.0.1:8888/lab?token=9123650c1ac2ea62f0a7e85344cf70b2d0afe7a1bd8a82cd
```

Follow the link to access JupyterLab. `nzshm-rupture-widget` will automatically be installed with `pip -e`. 

See [anywidget](https://anywidget.dev/) for widget development and [CesiumJS](https://cesium.com/platform/cesiumjs/) for map development.



