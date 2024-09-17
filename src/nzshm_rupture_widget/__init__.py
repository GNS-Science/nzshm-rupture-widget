import importlib.metadata
import pathlib

import anywidget
import traitlets
from ipywidgets import Box, HTML, jslink, GridBox, Layout

try:
    __version__ = importlib.metadata.version("nzshm_rupture_widget")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"


class CesiumWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "MapWidget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"
    _camera = traitlets.Dict().tag(sync=True)
    data = traitlets.List().tag(sync=True)
    selection = traitlets.Int(0).tag(sync=True)
    hover_style = traitlets.Dict().tag(sync=True)
    globe_opacity = traitlets.Float(0.5).tag(sync=True)
    _hover_callback = None
    _on_msg_set = False

    def _on_msg_handler(self, widget, msg, buffer):
        if msg["msg"] == "pick" and self._hover_callback is not None:
            self._hover_callback(msg)
        else:
            self._hover_callback("success")

    def on_hover(self, callback):
        self._hover_callback = callback
        if not self._on_msg_set:
            self.on_msg(self._on_msg_handler)
            self._on_msg_set = True

    def go_home(self):
        self.send({"action": "home"})


class SliderWidget(anywidget.AnyWidget):
    """
    A slider widget with step buttons.
    
    Attributes:
        min : int
            The minimum value
        max : int
            The maximum value
        value: int
            The value 
    """
    _esm = pathlib.Path(__file__).parent / "static" / "SliderWidget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"
    min = traitlets.Int(0).tag(sync=True)
    max = traitlets.Int(10).tag(sync=True)
    value = traitlets.Int(0).tag(sync=True)


class FullScreenWidget(anywidget.AnyWidget):
    """
    A button widget that sets the nearest ancestor with the "fullScreenTarget" class to fullscreen.
    """

    _esm = pathlib.Path(__file__).parent / "static" / "FullScreenWidget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"


class HomeWidget(anywidget.AnyWidget):
    """
    A button widget that calls the "go_home()" method on a CesiumWidget.
    """

    _esm = pathlib.Path(__file__).parent / "static" / "HomeWidget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"

    # see https://github.com/manzt/anywidget/issues/650#issuecomment-2286472536
    def __init__(self, map):
        """
        Parameters
            map : MapWidget
        """
        super().__init__()
        self.on_msg(lambda widget, msg, buffer: map.go_home())


class ValueButtonWidget(anywidget.AnyWidget):
    """
    A button widget that cycles through a list of preset values.

    Attributes:
        values : list
            a list of values to cycle through
        value : any
            the current value
        icon : str
            a CSS class. Classes already assigned to the HTML element are fa and controlButton3DMap
    """

    _esm = pathlib.Path(__file__).parent / "static" / "ValueButtonWidget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"
    values = traitlets.List([0, 1]).tag(sync=True)
    value = traitlets.Any(0).tag(sync=True)
    icon = traitlets.Unicode("fa-exclamation").tag(sync=True)


def transparency_button(map_widget, values):
    widget = ValueButtonWidget(values=values, value=values[0], icon="fa-eye")
    jslink((map_widget, "globe_opacity"), (widget, "value"))
    return widget


def rupture_map(data, selection=0):
    if isinstance(data, list):
        return CesiumWidget(data=data, selection=selection)
    else:
        return CesiumWidget(data=[data], selection=0)


def legend(title, values):
    html = HTML()
    value = f"<b>{title}</b><br/>"
    for key, val in values.items():
        value += f'<div><i style="background-color: {val};"></i> {key}</div>'
    html.value = value
    html.add_class("mapLegend")
    return html


def slider(map_widget):
    slider_widget = SliderWidget(min=0, max=len(map_widget.data) - 1, value=0)
    jslink((map_widget, "selection"), (slider_widget, "value"))
    return slider_widget


class MapLayout:
    map = None
    grid_box = None

    def __init__(self, data):
        self.map = CesiumWidget(data=data, layout=Layout(grid_area="1 / 1 / -1 / -1"))
        self.widgets = {
            "top-left": [],
            "bottom-left": [],
            "top-right": [],
            "bottom-right": [],
        }

    def add(self, widget, position="bottom-right"):
        self.widgets[position].append(widget)

    def render(self):
        if self.grid_box:
            return self.grid_box

        positions = [self.map]
        if self.widgets["top-left"]:
            bar = Box(self.widgets["top-left"])
            bar.add_class("mapLeftBar")
            bar.add_class("mapTopLeft")
            positions.append(bar)
        if self.widgets["bottom-left"]:
            bar = Box(self.widgets["bottom-left"])
            bar.add_class("mapLeftBar")
            bar.add_class("mapBottomLeft")
            positions.append(bar)
        if self.widgets["top-right"]:
            bar = Box(self.widgets["top-right"])
            bar.add_class("mapRightBar")
            bar.add_class("mapTopRight")
            positions.append(bar)
        if self.widgets["bottom-right"]:
            bar = Box(self.widgets["bottom-right"])
            bar.add_class("mapRightBar")
            bar.add_class("mapBottomRight")
            positions.append(bar)

        self.grid_box = GridBox(
            children=positions,
            layout=Layout(
                width="100%",
                height="400px",
                grid_template_rows="50px auto 50px",
                grid_template_columns="200px auto 300px",
            ),
        )
        self.grid_box.add_class("fullScreenTarget")
        return self.grid_box
