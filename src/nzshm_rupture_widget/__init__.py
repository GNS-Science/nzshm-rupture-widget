import importlib.metadata
import pathlib

import anywidget
import traitlets
from ipywidgets import HTML, jslink, GridBox, Layout

try:
    __version__ = importlib.metadata.version("nzshm_rupture_widget")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"


class MapWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "widget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"
    _camera = traitlets.Dict().tag(sync=True)
    data = traitlets.List().tag(sync=True)
    width = traitlets.Unicode('100%').tag(sync=True, o=True)
    height = traitlets.Unicode('400px').tag(sync=True, o=True)
    selection = traitlets.Int(0).tag(sync=True)
    hover_style = traitlets.Dict().tag(sync=True)
    _hover_callback = None
    _on_msg_set = False

    def _on_msg_handler(self, widget, msg, buffer):
        if msg["msg"] == "pick" and self._hover_callback is not None:
            self._hover_callback(msg)
        else:
            self._hover_callback("success")

    def on_hover(self, callback):
        self._hover_callback = callback
        if not self._on_msg_set :
            self.on_msg(self._on_msg_handler)
            self._on_msg_set = True
        

class SliderWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "SliderWidget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"
    min = traitlets.Int(0).tag(sync=True)
    max = traitlets.Int(10).tag(sync=True)
    value = traitlets.Int(0).tag(sync=True)

class FullScreenWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "FullScreenWidget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"


class HomeWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "HomeWidget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"

    # see https://github.com/manzt/anywidget/issues/650#issuecomment-2286472536
    def __init__(self, map):
        super().__init__()
        self.on_msg(lambda widget, msg, buffer: map.send({"action" : "home"}))
    

def rupture_map(data, selection=0):
    if isinstance(data, list):
        return MapWidget(data=data, selection=selection)
    else:
        return MapWidget(data=[data], selection=0)
    
def legend(title, values):
    html = HTML()
    value = f"<b>{title}</b><br/>"
    for key, val in values.items():
        value += f"<i style=\"background-color: {val};\"></i> {key}<br/>" 
    html.value = value
    html.add_class("mapLegend")
    return html

def slider(map_widget):
    slider_widget = SliderWidget(min=0, max=len(map_widget.data)-1, value=0)
    jslink((map_widget, "selection"), (slider_widget, "value"))
    return slider_widget


def map_layout():
    gridBox = GridBox(children=[map, right_bar, left_bar],
        layout=Layout(
            width='100%',
            height='400px',
            grid_template_rows='50px auto 50px',
            grid_template_columns='100px auto 300px')
       )
    gridBox.add_class("fullScreenTarget")
    return gridBox

