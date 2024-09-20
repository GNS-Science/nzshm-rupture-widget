// src/nzshm_rupture_widget/esm/CameraController.js
var pick = function(viewer, windowPosition) {
  const ray = viewer.camera.getPickRay(windowPosition);
  const picked = viewer.scene.pickFromRay(ray);
  if (picked?.object) {
    return picked;
  }
  const position = viewer.camera.pickEllipsoid(
    windowPosition,
    viewer.scene.globe.ellipsoid
  );
  if (position) {
    position.isEllipsoid = true;
    return {
      source: "ellipsoid",
      position
    };
  }
};
function CameraController(viewer, callback) {
  const NONE = 0;
  const LEFT = 1;
  const MIDDLE = 2;
  const RIGHT = 3;
  let mouseMode = NONE;
  let mouseMovePosition;
  let pickedPosition;
  let pickedCartographic;
  let startPosition;
  let startDirection;
  let startUp;
  let startRight;
  let startMousePosition;
  let startCamera;
  let canZoom = false;
  viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
  viewer.scene.screenSpaceCameraController.enableTranslate = false;
  viewer.scene.screenSpaceCameraController.enableZoom = false;
  viewer.scene.screenSpaceCameraController.enableRotate = false;
  viewer.scene.screenSpaceCameraController.enableTilt = false;
  viewer.scene.screenSpaceCameraController.enableLook = false;
  viewer.scene.pickTranslucentDepth = true;
  const isUnderground = function(camera) {
    const cartographic = Cesium.Cartographic.fromCartesian(camera.position);
    return cartographic.height < 0;
  };
  const leftDown = function(event) {
    canZoom = true;
    pickedPosition = pick(viewer, event.position)?.position;
    if (pickedPosition) {
      mouseMode = LEFT;
      pickedCartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
      startMousePosition = event.position;
      startPosition = viewer.scene.camera.position.clone();
      startDirection = viewer.scene.camera.direction.clone();
      startUp = viewer.scene.camera.up.clone();
      startRight = viewer.scene.camera.right.clone();
      startCamera = new Cesium.Camera(viewer.scene);
      startCamera.position = startPosition;
      startCamera.direction = startDirection;
      startCamera.up = startUp;
      startCamera.right = startRight;
    }
  };
  const rightDown = function(event) {
    canZoom = true;
    pickedPosition = pick(viewer, event.position)?.position;
    if (pickedPosition) {
      mouseMode = RIGHT;
      pickedCartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
      startMousePosition = event.position;
      startPosition = viewer.scene.camera.position.clone();
      startDirection = viewer.scene.camera.direction.clone();
      startUp = viewer.scene.camera.up.clone();
      startRight = viewer.scene.camera.right.clone();
    }
  };
  const mmul = function(inVector, ...m3s) {
    return m3s.reduce(function(vec, mat) {
      return Cesium.Matrix3.multiplyByVector(mat, vec, new Cesium.Cartesian3());
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
    const pitch = Cesium.Math.PI / 360 * -(startMousePosition.y - movement.endPosition.y);
    const roll = Cesium.Math.PI / 360 * (startMousePosition.x - movement.endPosition.x);
    const rotQuat = Cesium.Quaternion.fromAxisAngle(pickedPosition, roll);
    const quatRotM = Cesium.Matrix3.fromQuaternion(rotQuat);
    const pitchAxis = mmul(startRight, quatRotM);
    const pitchQuat = Cesium.Quaternion.fromAxisAngle(pitchAxis, -pitch);
    const pitchRotM = Cesium.Matrix3.fromQuaternion(pitchQuat);
    const a = new Cesium.Cartesian3();
    Cesium.Cartesian3.subtract(startPosition, pickedPosition, a);
    const b = mmul(a, quatRotM, pitchRotM);
    Cesium.Cartesian3.add(b, pickedPosition, a);
    const direction = mmul(startDirection, quatRotM, pitchRotM);
    const up = mmul(startUp, quatRotM, pitchRotM);
    const right = mmul(startRight, quatRotM, pitchRotM);
    setCamera(a, direction, up, right);
  };
  const left_move = function(movement) {
    const ray = startCamera.getPickRay(movement.endPosition);
    const plane = new Cesium.Plane(Cesium.Cartesian3.normalize(pickedPosition, new Cesium.Cartesian3()), -Cesium.Cartesian3.magnitude(pickedPosition));
    const point = Cesium.IntersectionTests.rayPlane(ray, plane);
    if (!point) {
      return;
    }
    const angle = Cesium.Cartesian3.angleBetween(point, pickedPosition);
    const axis = Cesium.Cartesian3.cross(point, pickedPosition, new Cesium.Cartesian3());
    const quat = Cesium.Quaternion.fromAxisAngle(axis, angle);
    const rotM = Cesium.Matrix3.fromQuaternion(quat);
    const position = mmul(startPosition, rotM);
    const direction = mmul(startDirection, rotM);
    const up = mmul(startUp, rotM);
    const right = mmul(startRight, rotM);
    setCamera(position, direction, up, right);
  };
  const stopDrag = function() {
    pickedPosition = void 0;
    mouseMode = NONE;
  };
  const wheel = function(event) {
    stopDrag();
    const target = pick(viewer, mouseMovePosition)?.position;
    if (target) {
      const scratchDirection = new Cesium.Cartesian3();
      const direction = new Cesium.Cartesian3();
      Cesium.Cartesian3.subtract(target, viewer.scene.camera.position, scratchDirection);
      Cesium.Cartesian3.normalize(scratchDirection, direction);
      const magnitude = Cesium.Cartesian3.magnitude(scratchDirection);
      const useDefaultZoom = target.isEllipsoid && isUnderground(viewer.scene.camera);
      let zoom = useDefaultZoom ? 1e3 : Math.max(magnitude / 4, 1e3);
      if (event > 0) {
        viewer.scene.camera.move(direction, zoom);
      } else {
        viewer.scene.camera.move(direction, -zoom);
      }
    }
  };
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(leftDown, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  handler.setInputAction(rightDown, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
  handler.setInputAction(stopDrag, Cesium.ScreenSpaceEventType.RIGHT_UP);
  handler.setInputAction(stopDrag, Cesium.ScreenSpaceEventType.LEFT_UP);
  handler.setInputAction(wheel, Cesium.ScreenSpaceEventType.WHEEL);
  handler.setInputAction(function(movement) {
    mouseMovePosition = movement.endPosition;
    if (!pickedPosition || mouseMode < 0) {
      return;
    }
    if (mouseMode == RIGHT) {
      right_move(movement);
    }
    if (mouseMode == LEFT) {
      left_move(movement);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  viewer.scene.canvas.addEventListener("pointerleave", (event) => canZoom = false);
}
var CameraController_default = CameraController;

// src/nzshm_rupture_widget/esm/styles.js
var styleEntity = function(entity, style) {
  if (!style) {
    return;
  }
  const { extrusion, stroke, weight, fill, color, opacity, fillColor, fillOpacity } = style;
  if (entity.polygon) {
    const polygon = entity.polygon;
    const oldStyle = {};
    polygon.oldStyle = oldStyle;
    if (extrusion) {
      polygon.extrudedHeight = extrusion;
    }
    if (typeof stroke !== "undefined") {
      oldStyle.outline = polygon.outline;
      polygon.outline = stroke;
    }
    if (weight) {
      oldStyle.outlineWidth = polygon.outlineWidth;
      polygon.outlineWidth = weight;
    }
    if (typeof fill !== "undefined") {
      oldStyle.fill = fill;
      polygon.fill = fill;
    }
    if (color) {
      oldStyle.outlineColor = polygon.outlineColor;
      polygon.outlineColor = color;
    }
    if (opacity) {
      oldStyle.outlineColor = polygon.outlineColor;
      let cesiumColor = Cesium.Color.fromCssColorString(polygon.outlineColor);
      const alpha = typeof opacity === "string" ? parseFloat(opacity) : opacity;
      polygon.outlineColor = cesiumColor.withAlpha(alpha);
    }
    if (fillColor) {
      oldStyle.material = polygon.material;
      let cesiumColor = Cesium.Color.fromCssColorString(fillColor);
      if (fillOpacity) {
        const alpha = typeof fillOpacity === "string" ? parseFloat(fillOpacity) : fillOpacity;
        cesiumColor = cesiumColor.withAlpha(alpha);
      }
      polygon.material = new Cesium.ColorMaterialProperty(cesiumColor);
    }
  }
  if (typeof stroke !== "undefined") {
    if (entity.polyline) {
      entity.polyline.show = stroke;
    }
  }
};
var recoverEntityStyle = function(entity) {
  if (!entity) {
    return;
  }
  if (entity.polygon?.oldStyle) {
    for (const style in entity.polygon.oldStyle) {
      entity.polygon[style] = entity.polygon.oldStyle[style];
    }
    entity.polygon.oldStyle = void 0;
  }
};

// src/nzshm_rupture_widget/esm/PickController.js
function PickController(viewer, style, callback) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  let lastPicked;
  const getMessage = function(picked, windowPosition) {
    if (!picked) {
      return void 0;
    }
    if (picked?.source === "ellipsoid") {
      return picked;
    }
    if (picked?.object?.id instanceof Cesium.Entity) {
      const entity = picked.object.id;
      if (lastPicked == entity) {
        return void 0;
      }
      if (style) {
        styleEntity(entity, style);
      }
      recoverEntityStyle(lastPicked);
      lastPicked = entity;
      const props = entity.properties;
      const properties = props.propertyNames.reduce((result, k) => {
        result[k] = props[k].getValue();
        return result;
      }, {});
      return {
        source: "entity",
        entity,
        properties,
        windowPosition,
        position: picked.position
      };
    }
  };
  handler.setInputAction(function(event) {
    const picked = pick(viewer, event.endPosition);
    const message = getMessage(picked, event.endPosition);
    if (message) {
      callback(message);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}
var PickController_default = PickController;

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
      for (const [from, to] of mappings) {
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

// src/nzshm_rupture_widget/esm/CesiumWidget.js
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
await loadScript("https://cesium.com/downloads/cesiumjs/releases/1.121/Build/Cesium/Cesium.js");
function render({ model, el }) {
  const div = document.createElement("div");
  div.id = "cesiumContainer";
  div.style.width = "100%";
  div.style.height = "100%";
  const viewer = new Cesium.Viewer(div, {
    animation: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    sceneModePicker: false,
    homeButton: false,
    geocoder: false,
    fullscreenButton: false,
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
  viewer.scene.mode = Cesium.SceneMode.SCENE3D;
  viewer.scene.globe.translucency.enabled = true;
  viewer.scene.globe.translucency.frontFaceAlpha = model.get("globe_opacity");
  viewer.scene.globe.undergroundColor = Cesium.Color.WHITE;
  viewer.selectedEntityChanged.addEventListener(function(selectedEntity) {
    if (selectedEntity) {
      if (model.get("no_info")) {
        viewer.selectedEntity = void 0;
      }
    }
  });
  const cameraCallback = function(position, direction, up) {
    model.set("_camera", {
      "position": position,
      "direction": direction,
      "up": up
    });
    model.save_changes();
  };
  CameraController_default(viewer, cameraCallback);
  const hover_style = model.get("hover_style");
  PickController_default(viewer, hover_style, (picked) => {
    const { source, properties, windowPosition } = picked;
    if (source !== "ellipsoid") {
      model.send({ msg: "pick", source, properties, windowPosition });
    }
  });
  const data = model.get("data");
  let selected = model.get("selection") || 0;
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
    const updateFunction = function(value) {
      if (value !== selected) {
        dataSources[selected].then(function(source) {
          source.show = false;
        });
        selected = value;
        dataSources[selected].then(function(source) {
          source.show = true;
        });
        viewer.zoomTo(dataSources[selected]);
      }
      if (model.get("selection") !== selected) {
        model.set("selection", selected);
        model.save_changes();
      }
    };
    model.on("change:selection", function() {
      updateFunction(model.get("selection"));
    });
  }
  model.on("change:globe_opacity", function() {
    viewer.scene.globe.translucency.frontFaceAlpha = model.get("globe_opacity");
  });
  div.addEventListener("contextmenu", function(ev) {
    ev.stopPropagation();
  });
  model.on("msg:custom", function(msg) {
    if (msg?.action === "home") {
      viewer.zoomTo(dataSources[selected]);
    }
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
var CesiumWidget_default = { render };
export {
  CesiumWidget_default as default
};
