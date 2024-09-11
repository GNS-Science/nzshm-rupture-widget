function PickController(Cesium, viewer, callback) {

    if (!callback) {
        throw new Error("callback is required");
    }
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction(function (event) {
        const picked = viewer.scene.pick(event.position);
        if (picked) {
            callback({ picked, position: event.position });
        }
    }
        , Cesium.ScreenSpaceEventType.RIGHT_DOWN);
}

export default PickController;