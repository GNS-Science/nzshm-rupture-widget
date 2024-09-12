// src/nzshm_rupture_widget/esm/PickController.js
function PickController(Cesium2, viewer, callback) {
  if (!callback) {
    throw new Error("callback is required");
  }
  const handler = new Cesium2.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(
    function(event) {
      const picked = viewer.scene.pick(event.position);
      if (picked) {
        callback({ picked, position: event.position });
      }
    },
    Cesium2.ScreenSpaceEventType.RIGHT_DOWN
  );
}
var PickController_default = PickController;

// src/nzshm_rupture_widget/esm/CameraController.js
function CameraController(Cesium2, viewer, callback) {
  const NONE = 0;
  const LEFT = 1;
  const MIDDLE = 2;
  const RIGHT = 3;
  var mouseMode = NONE;
  var pickedPosition;
  var pickedCartographic;
  var startPosition;
  var startDirection;
  var startUp;
  var startRight;
  var startMousePosition;
  var startCamera;
  viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
  viewer.scene.screenSpaceCameraController.enableTranslate = false;
  viewer.scene.screenSpaceCameraController.enableZoom = false;
  viewer.scene.screenSpaceCameraController.enableRotate = false;
  viewer.scene.screenSpaceCameraController.enableTilt = false;
  viewer.scene.screenSpaceCameraController.enableLook = false;
  viewer.scene.pickTranslucentDepth = true;
  const leftDown = function(event) {
    const ray = viewer.camera.getPickRay(event.position);
    const picked = viewer.scene.pickFromRay(ray);
    if (picked && picked.object) {
      pickedPosition = picked.position;
    } else {
      const cartesian = viewer.camera.pickEllipsoid(
        event.position,
        viewer.scene.globe.ellipsoid
      );
      pickedPosition = cartesian;
    }
    if (pickedPosition) {
      mouseMode = LEFT;
      pickedCartographic = Cesium2.Cartographic.fromCartesian(pickedPosition);
      startMousePosition = event.position;
      startPosition = viewer.scene.camera.position.clone();
      startDirection = viewer.scene.camera.direction.clone();
      startUp = viewer.scene.camera.up.clone();
      startRight = viewer.scene.camera.right.clone();
      startCamera = new Cesium2.Camera(viewer.scene);
      startCamera.position = startPosition;
      startCamera.direction = startDirection;
      startCamera.up = startUp;
      startCamera.right = startRight;
    }
  };
  const rightDown = function(event) {
    const ray = viewer.camera.getPickRay(event.position);
    const picked = viewer.scene.pickFromRay(ray);
    if (picked && picked.object) {
      pickedPosition = picked.position;
    } else {
      const cartesian = viewer.camera.pickEllipsoid(
        event.position,
        viewer.scene.globe.ellipsoid
      );
      pickedPosition = cartesian;
    }
    if (pickedPosition) {
      mouseMode = RIGHT;
      pickedCartographic = Cesium2.Cartographic.fromCartesian(pickedPosition);
      startMousePosition = event.position;
      startPosition = viewer.scene.camera.position.clone();
      startDirection = viewer.scene.camera.direction.clone();
      startUp = viewer.scene.camera.up.clone();
      startRight = viewer.scene.camera.right.clone();
    }
  };
  const mmul = function(inVector, ...m3s) {
    return m3s.reduce(function(vec, mat) {
      return Cesium2.Matrix3.multiplyByVector(mat, vec, new Cesium2.Cartesian3());
    }, inVector);
  };
  const setCamera = function(position, direction, up, right) {
    viewer.scene.camera.position = position;
    viewer.scene.camera.direction = direction;
    viewer.scene.camera.up = up;
    viewer.scene.camera.right = right;
    if (callback) {
      callback(position, direction, up);
    }
  };
  const right_move = function(movement) {
    const pitch = Cesium2.Math.PI / 360 * -(startMousePosition.y - movement.endPosition.y);
    const roll = Cesium2.Math.PI / 360 * (startMousePosition.x - movement.endPosition.x);
    const rotQuat = Cesium2.Quaternion.fromAxisAngle(pickedPosition, roll);
    const quatRotM = Cesium2.Matrix3.fromQuaternion(rotQuat);
    const pitchAxis = mmul(startRight, quatRotM);
    const pitchQuat = Cesium2.Quaternion.fromAxisAngle(pitchAxis, -pitch);
    const pitchRotM = Cesium2.Matrix3.fromQuaternion(pitchQuat);
    const a = new Cesium2.Cartesian3();
    Cesium2.Cartesian3.subtract(startPosition, pickedPosition, a);
    const b = mmul(a, quatRotM, pitchRotM);
    Cesium2.Cartesian3.add(b, pickedPosition, a);
    const direction = mmul(startDirection, quatRotM, pitchRotM);
    const up = mmul(startUp, quatRotM, pitchRotM);
    const right = mmul(startRight, quatRotM, pitchRotM);
    setCamera(a, direction, up, right);
  };
  const left_move = function(movement) {
    const ray = startCamera.getPickRay(movement.endPosition);
    const plane = new Cesium2.Plane(Cesium2.Cartesian3.normalize(pickedPosition, new Cesium2.Cartesian3()), -Cesium2.Cartesian3.magnitude(pickedPosition));
    const point = Cesium2.IntersectionTests.rayPlane(ray, plane);
    if (!point) {
      return;
    }
    const cartographic = Cesium2.Cartographic.fromCartesian(point);
    const hpr = new Cesium2.HeadingPitchRoll(cartographic.longitude - pickedCartographic.longitude, cartographic.latitude - pickedCartographic.latitude, 0);
    const rotation = Cesium2.Matrix3.fromHeadingPitchRoll(hpr);
    setCamera(
      mmul(startPosition, rotation),
      mmul(startDirection, rotation),
      mmul(startUp, rotation),
      mmul(startRight, rotation)
    );
  };
  const stopDrag = function() {
    pickedPosition = void 0;
    mouseMode = NONE;
  };
  const wheel = function(event) {
    stopDrag();
    const cartographic = Cesium2.Cartographic.fromCartesian(
      viewer.scene.camera.position
    );
    const zoom = Math.max(Math.min(cartographic.height / 4, 5e4), 1e3);
    if (event > 0) {
      viewer.scene.camera.zoomIn(zoom);
    } else {
      viewer.scene.camera.zoomOut(zoom);
    }
  };
  const handler = new Cesium2.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(leftDown, Cesium2.ScreenSpaceEventType.LEFT_DOWN);
  handler.setInputAction(rightDown, Cesium2.ScreenSpaceEventType.RIGHT_DOWN);
  handler.setInputAction(stopDrag, Cesium2.ScreenSpaceEventType.RIGHT_UP);
  handler.setInputAction(stopDrag, Cesium2.ScreenSpaceEventType.LEFT_UP);
  handler.setInputAction(wheel, Cesium2.ScreenSpaceEventType.WHEEL);
  handler.setInputAction(function(movement) {
    if (!pickedPosition || mouseMode < 0) {
      return;
    }
    if (mouseMode == RIGHT) {
      right_move(movement);
    }
    if (mouseMode == LEFT) {
      left_move(movement);
    }
  }, Cesium2.ScreenSpaceEventType.MOUSE_MOVE);
}
var CameraController_default = CameraController;

// src/nzshm_rupture_widget/esm/SliderWidget.js
function SliderWidget(parent, min, max, selected, callback) {
  const div = document.createElement("div");
  div.classList.add("rangeWidget");
  const slider = document.createElement("input");
  slider.type = "range";
  slider.classList.add("rangeSlider");
  slider.min = min;
  slider.max = max;
  slider.value = selected;
  const sliderForward = document.createElement("div");
  sliderForward.classList.add("fa");
  sliderForward.classList.add("fa-forward");
  sliderForward.classList.add("sliderControlButton");
  const sliderBack = document.createElement("div");
  sliderBack.classList.add("fa");
  sliderBack.classList.add("fa-backward");
  sliderBack.classList.add("sliderControlButton");
  if (callback) {
    slider.addEventListener("change", function(event) {
      callback({
        type: "change",
        value: event.target.value
      });
    });
    slider.addEventListener("input", function(event) {
      callback({
        type: "input",
        value: event.target.value
      });
    });
    sliderForward.addEventListener("click", function(event) {
      console.log("max " + max + " slider " + slider.value);
      if (max > slider.value) {
        slider.value++;
        callback({
          type: "forward",
          value: slider.value
        });
      }
    });
    sliderBack.addEventListener("click", function(event) {
      if (min < slider.value) {
        slider.value--;
        callback({
          type: "back",
          value: slider.value
        });
      }
    });
  }
  div.appendChild(slider);
  div.appendChild(sliderBack);
  div.appendChild(sliderForward);
  parent.appendChild(div);
  return function(value) {
    if (value >= min && value <= max) {
      slider.value = value;
      callback({
        type: "setValue",
        value: slider.value
      });
    }
  };
}
var SliderWidget_default = SliderWidget;

// src/nzshm_rupture_widget/esm/GeoJSON.js
function correctElevation(coords, elevationCorrection) {
  if (typeof coords[0] === "number") {
    if (coords[2]) {
      coords[2] = coords[2] * elevationCorrection;
    }
  } else {
    for (const coord of coords) {
      correctElevation(coord, elevationCorrection);
    }
  }
}
function removeElevation(coords) {
  if (typeof coords[0] === "number") {
    if (coords[2]) {
      coords.pop();
    }
  } else {
    for (const coord of coords) {
      removeElevation(coord);
    }
  }
}
function loadGeoJSON(geojson) {
  const elevationCorrection = geojson.elevationToMeters || -1e3;
  for (const feature of geojson.features) {
    const extrusion = feature.properties?.style?.extrusion;
    if (extrusion) {
      removeElevation(feature.geometry.coordinates);
    } else if (elevationCorrection !== 1) {
      correctElevation(feature.geometry.coordinates, elevationCorrection);
    }
    const style = feature.properties.style;
    if (style) {
      const mappings = [
        ["color", "stroke"],
        ["weight", "stroke-width"],
        ["opacity", "stroke-opacity"],
        ["fillColor", "fill"],
        ["fillOpacity", "fill-opacity"]
      ];
      for (var [from, to] of mappings) {
        if (style[from]) {
          feature.properties[to] = style[from];
        }
      }
    }
  }
  const dataSource = Cesium.GeoJsonDataSource.load(geojson);
  dataSource.then(function(ds) {
    for (const entity of ds.entities.values) {
      const style = entity.properties.getValue().style;
      const extrusion = style?.extrusion;
      if (extrusion) {
        entity.polygon.extrudedHeight = extrusion;
        entity.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
      }
      const stroke = style?.stroke;
      if (typeof stroke !== "undefined") {
        if (entity.polygon) {
          entity.polygon.outline = stroke;
        }
        if (entity.polyline) {
          entity.polyline.show = stroke;
        }
      }
      const weight = style?.weight;
      if (weight && entity.polygon) {
        entity.polygon.outlineWidth = weight;
      }
      const fill = style?.fill;
      if (typeof fill !== "undefined") {
        if (entity.polygon) {
          entity.polygon.fill = fill;
        }
      }
    }
  });
  return dataSource;
}
var GeoJSON_default = loadGeoJSON;

// src/nzshm_rupture_widget/esm/widget.js
function loadScript(src) {
  return new Promise((resolve, reject) => {
    let script = Object.assign(document.createElement("script"), {
      type: "text/javascript",
      async: true,
      src
    });
    script.addEventListener("load", resolve);
    script.addEventListener("error", reject);
    document.body.appendChild(script);
  });
}
await loadScript("https://cesium.com/downloads/cesiumjs/releases/1.116/Build/Cesium/Cesium.js");
function render({ model, el }) {
  const div = document.createElement("div");
  div.id = "cesiumContainer";
  div.style.width = model.get("width");
  div.style.height = model.get("height");
  const viewer = new Cesium.Viewer(div, {
    animation: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    sceneModePicker: false,
    homeButton: true,
    geocoder: false,
    fullscreenButton: true,
    fullscreenElement: div,
    timeline: false,
    baseLayer: new Cesium.ImageryLayer(new Cesium.OpenStreetMapImageryProvider({
      url: "https://tile.openstreetmap.org/",
      credit: new Cesium.Credit("Cesium: OpenStreetMap", true)
    })),
    // large negative value to render large underground structures
    depthPlaneEllipsoidOffset: -1e5
  });
  const oldCamera = model.get("_camera");
  if (oldCamera && Object.keys(oldCamera).length > 0) {
    viewer.camera.setView({
      destination: oldCamera.position,
      orientation: {
        direction: oldCamera.direction,
        up: oldCamera.up
      }
    });
  } else {
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(175.57716369628906, -41.35120773, 95e3)
    });
  }
  viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
    function(e) {
      e.cancel = true;
      viewer.zoomTo(dataSources[selected]);
    }
  );
  viewer.scene.mode = Cesium.SceneMode.SCENE3D;
  viewer.scene.globe.translucency.enabled = true;
  viewer.scene.globe.translucency.frontFaceAlpha = 0.5;
  viewer.scene.globe.undergroundColor = Cesium.Color.WHITE;
  const cameraCallback = function(position, direction, up) {
    model.set("_camera", {
      "position": position,
      "direction": direction,
      "up": up
    });
    model.save_changes();
  };
  new CameraController_default(Cesium, viewer, cameraCallback);
  new PickController_default(
    Cesium,
    viewer,
    function({ picked, position }) {
      console.log(picked);
      const canvas = document.createElement("canvas");
      canvas.classList.add("sampleCanvas");
      canvas.width = 200;
      canvas.height = 200;
      var ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.arc(100, 100, 40, 0, 2 * Math.PI);
      ctx.stroke();
      el.appendChild(canvas);
    }
  );
  const data = model.get("data");
  var selected = model.get("selection") || 0;
  const dataSources = [];
  for (const geojson of data) {
    const dataSource = GeoJSON_default(geojson);
    const show = selected === -1 || dataSources.length == selected;
    dataSource.then(function(ds) {
      ds.show = show;
    });
    dataSources.push(dataSource);
    viewer.dataSources.add(dataSource);
  }
  viewer.zoomTo(dataSources[selected]);
  if (dataSources.length > 1 && selected > -1) {
    const updateFunction = new SliderWidget_default(div, 0, dataSources.length - 1, selected, function(event) {
      if (event.value !== selected) {
        dataSources[selected].then(function(source) {
          source.show = false;
        });
        selected = event.value;
        dataSources[selected].then(function(source) {
          source.show = true;
        });
        viewer.zoomTo(
          dataSources[selected]
          // ,
          // new Cesium.HeadingPitchRange(
          //     viewer.scene.camera.heading,
          //     viewer.scene.camera.pitch,
          //     500000
          // )
        );
      }
      if (model.get("selection") !== selected) {
        model.set("selection", selected);
        model.save_changes();
      }
    });
    model.on("change:selection", function() {
      updateFunction(model.get("selection"));
    });
  }
  div.addEventListener("contextmenu", function(ev) {
    ev.stopPropagation();
  });
  el.appendChild(div);
  return function() {
    console.log("destroy map_3d_widget");
    while (dataSources.length) {
      dataSources.pop();
    }
    viewer.entities.removeAll();
    viewer.destroy();
  };
}
var widget_default = { render };
export {
  widget_default as default
};
