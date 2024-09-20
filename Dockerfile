FROM quay.io/jupyter/base-notebook:latest

RUN pip install "anywidget[dev]" geojson ipyleaflet jupyterlab-geojson pandas
# RUN npm install --save-exact --save-dev esbuild
# RUN npm install -D vitest

# USER root
# RUN apt-get update && apt-get install -y git
# USER jovyan

# RUN pip install git+https://github.com/GNS-Science/solvis.git@b2ce5bd97ff7f0d85a3fdfdf24815bec2b42cdc7
# RUN pip install git+https://github.com/GNS-Science/solvis-graphql-api@b77645d230

EXPOSE 8888

ENTRYPOINT pip install -e /home/jovyan/nzshm-rupture-widget && /usr/local/bin/start.sh start-notebook.py