# nzshm_rupture_widget

A [Jupyter Notebook](https://jupyter.org/) widget for displaying 3D data on a map. 

Developed for displaying faults and ruptures for [Te Tauira Matapae Pūmate Rū i Aotearoa • New Zealand National Seismic Hazard Model](https://nshm.gns.cri.nz/)

## Installation

```sh
pip install nzshm_rupture_widget
```

## Usage

TODO

## Development

Use the docker file to create a Jupyter Notebook

Build the image:

```
docker build -t nzshm-rupture-widget .
```

Run the image, mounting the widget directory:

```
docker run -it --rm -v ${pwd}:/home/jovyan/nzshm-rupture-widget --name rupture-widget-dev -p 8888:8888 nzshm-rupture-widget
```

This will print a link of the form

```
http://127.0.0.1:8888/lab?token=9123650c1ac2ea62f0a7e85344cf70b2d0afe7a1bd8a82cd
```

Follow the link to access JupyterLab. `nzshm-rupture-widget` will be installed with `pip -e`. 

See [anywidget](https://anywidget.dev/) for widget development and [CesiumJS](https://cesium.com/platform/cesiumjs/) for map development.
