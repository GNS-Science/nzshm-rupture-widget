import PickController from "./PickController";
import CameraController from "./CameraController";
import loadGeoJSON from "./GeoJSON";

function loadScript(src) {
    return new Promise((resolve, reject) => {
        let script = Object.assign(document.createElement("script"), {
            type: "text/javascript",
            async: true,
            src: src,
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
    // div.style.width = model.get("width");
    // div.style.height = model.get("height");

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
        depthPlaneEllipsoidOffset: -100000.0,
    });

    const oldCamera = model.get("_camera");
    if (oldCamera && Object.keys(oldCamera).length > 0) {
        viewer.camera.setView({
            destination: oldCamera.position,
            orientation: {
                direction: oldCamera.direction,
                up: oldCamera.up
            }
        })
    } else {
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(175.57716369628906, -41.35120773, 95000),
        });
    }

    viewer.scene.mode = Cesium.SceneMode.SCENE3D;
    viewer.scene.globe.translucency.enabled = true;
    viewer.scene.globe.translucency.frontFaceAlpha = 0.5;
    viewer.scene.globe.undergroundColor = Cesium.Color.WHITE;

    // prevent default popups
    viewer.selectedEntityChanged.addEventListener(function (selectedEntity) {
        if (selectedEntity) {
            viewer.selectedEntity = undefined;
        }
    });

    const cameraCallback = function (position, direction, up) {
        model.set("_camera", {
            "position": position,
            "direction": direction,
            "up": up
        });
        model.save_changes();
    }

    CameraController(viewer, cameraCallback);

    const hover_style = model.get("hover_style");

    PickController(viewer, hover_style, (picked => {
        const { source, properties } = picked;
        if (source !== 'ellipsoid') {
            console.log("send hover event")
            model.send({ msg: "pick", source, properties });
        }
    }));


    const data = model.get("data");

    var selected = model.get("selection") || 0;
    const dataSources = [];

    for (const geojson of data) {

        const dataSource = loadGeoJSON(geojson);

        const show = selected === -1 || dataSources.length == selected;
        dataSource.then(function (ds) {
            ds.show = show;
        })

        dataSources.push(dataSource);
        viewer.dataSources.add(dataSource);
    }

    viewer.zoomTo(dataSources[selected]);

    if (dataSources.length > 1 && selected > -1) {
        const updateFunction = function (value) {
            if (value !== selected) {
                dataSources[selected].then(function (source) {
                    source.show = false;
                });
                selected = value;
                dataSources[selected].then(function (source) {
                    source.show = true;
                });
                viewer.zoomTo(dataSources[selected]);
            }
            if (model.get("selection") !== selected) {
                model.set("selection", selected);
                model.save_changes();
            }
        };
        model.on("change:selection", function () {
            updateFunction(model.get("selection"));
        });
    }

    div.addEventListener("contextmenu", function (ev) {
        ev.stopPropagation();
    })

    model.on("msg:custom", function (msg) {
        if (msg?.action === 'home') {
            viewer.zoomTo(dataSources[selected]);
        }
    });

    el.appendChild(div);

    // clean-up function
    return function () {
        console.log("destroy map_3d_widget");
        while (dataSources.length) {
            dataSources.pop();
        }
        viewer.entities.removeAll();
        viewer.destroy();
    }
}

export default { render };
