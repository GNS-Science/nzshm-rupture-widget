FROM quay.io/jupyter/base-notebook:latest

RUN pip install "anywidget[dev]" geojson ipyleaflet jupyterlab-geojson pandas

EXPOSE 8888

ENTRYPOINT pip install -e /home/jovyan/nzshm-rupture-widget && /usr/local/bin/start.sh start-notebook.py