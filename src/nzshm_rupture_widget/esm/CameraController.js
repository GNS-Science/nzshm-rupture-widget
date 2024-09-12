/**
 * @callback CameraControllerCallback
 * @param {Cesium.Cartesian3} position
 * @param {Cesium.Cartesian3} direction
 * @param {Cesium.Cartesian3} up
 */

/**
 * Controls the Cesium camera with the mouse. Replaces [buggy Cesiumn controls](https://github.com/CesiumGS/cesium/issues/12137).
 * @param {Cesium.Viewer} viewer 
 * @param {CameraControllerCallback} callback is called when the camera position, direction, or up changes.
 */
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

    /**
     * Based on a windowPosition, tries to pick an entity or the ellipsoid as fallback.
     * Returns a world coordinate. The result will have set `isEllipsoid:true` if it's a hit on the ellipsoid.
     * @param {Cesium.Cartesian3} windowPosition 
     * @returns 
     */
    const pick = function (windowPosition) {
        const ray = viewer.camera.getPickRay(windowPosition);
        const picked = viewer.scene.pickFromRay(ray);
        if (picked?.object) {
            return picked.position;
        }

        const position = viewer.camera.pickEllipsoid(
            windowPosition,
            viewer.scene.globe.ellipsoid
        );
        position.isEllipsoid = true;
        return position;
    }

    /**
     * Returns true if the camera is underground.
     * @param {Cesium.Camera} camera 
     * @returns 
     */
    const isUnderground = function (camera) {
        const cartographic = Cesium.Cartographic.fromCartesian(camera.position);
        return cartographic.height < 0;
    }

    const leftDown = function (event) {
        canZoom = true;

        pickedPosition = pick(event.position);

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
    }

    const rightDown = function (event) {
        canZoom = true;

        pickedPosition = pick(event.position);

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


    const mmul = function (inVector, ...m3s) {
        return m3s.reduce(function (vec, mat) {
            return Cesium.Matrix3.multiplyByVector(mat, vec, new Cesium.Cartesian3());
        }, inVector);
    }

    const setCamera = function (position, direction, up, right) {
        viewer.scene.camera.position = position;
        viewer.scene.camera.direction = direction;
        viewer.scene.camera.up = up;
        viewer.scene.camera.right = right;
        if (callback) {
            callback(position, direction, up);
        }
    }

    const right_move = function (movement) {

        // This rotates the camera around the axis origin->pickedPosition for heading, 
        // and around the camera's "right" vector for pitch.

        const pitch = (Cesium.Math.PI / 360) * -(startMousePosition.y - movement.endPosition.y);
        const roll = (Cesium.Math.PI / 360) * (startMousePosition.x - movement.endPosition.x);
        const rotQuat = Cesium.Quaternion.fromAxisAngle(pickedPosition, roll);
        const quatRotM = Cesium.Matrix3.fromQuaternion(rotQuat);
        const pitchAxis = mmul(startRight, quatRotM);
        const pitchQuat = Cesium.Quaternion.fromAxisAngle(pitchAxis, -pitch);
        const pitchRotM = Cesium.Matrix3.fromQuaternion(pitchQuat);

        // the camera position needs to be translated into and out of the pickedPosition frame
        const a = new Cesium.Cartesian3();
        Cesium.Cartesian3.subtract(startPosition, pickedPosition, a);
        const b = mmul(a, quatRotM, pitchRotM);
        Cesium.Cartesian3.add(b, pickedPosition, a);

        // these are normal vectors that only need to be rotated
        const direction = mmul(startDirection, quatRotM, pitchRotM);
        const up = mmul(startUp, quatRotM, pitchRotM);
        const right = mmul(startRight, quatRotM, pitchRotM);

        setCamera(a, direction, up, right);
    }

    const left_move = function (movement) {

        // this rotates the camera around the globe's origin so that the pickedPosition from
        // the drag start is now at roughly the current mouse position when viewed through the camera.

        const ray = startCamera.getPickRay(movement.endPosition);
        // intersect with sphere
        // const sphere = new Cesium.BoundingSphere(pickedPosition,  Cesium.Cartesian3.magnitude(pickedPosition));
        // const interval = Cesium.IntersectionTests.raySphere(ray, sphere);
        // const point = Cesium.Ray.getPoint(ray, interval.stop);

        // intersect with plane
        const plane = new Cesium.Plane(Cesium.Cartesian3.normalize(pickedPosition, new Cesium.Cartesian3()), -Cesium.Cartesian3.magnitude(pickedPosition));
        const point = Cesium.IntersectionTests.rayPlane(ray, plane);

        if (!point) {
            return;
        }

        // lat/lon rotation
        const cartographic = Cesium.Cartographic.fromCartesian(point);
        const hpr = new Cesium.HeadingPitchRoll(cartographic.longitude - pickedCartographic.longitude, cartographic.latitude - pickedCartographic.latitude, 0);
        const rotation = Cesium.Matrix3.fromHeadingPitchRoll(hpr);


        // quaternion
        // const rotAxis = Cesium.Cartesian3.cross(pickedPosition, point, new Cesium.Cartesian3());
        // const angle = Cesium.Cartesian3.angleBetween(pickedPosition, point);
        // const rotQuat = Cesium.Quaternion.fromAxisAngle(rotAxis, -angle);
        // const rotation = Cesium.Matrix3.fromQuaternion(rotQuat);

        setCamera(
            mmul(startPosition, rotation),
            mmul(startDirection, rotation),
            mmul(startUp, rotation),
            mmul(startRight, rotation));
    }

    const stopDrag = function () {
        pickedPosition = undefined;
        mouseMode = NONE;
    }

    const wheel = function (event) {
        // if (!canZoom) {
        //    // viewer.container.dispatchEvent();
        //     return;
        // }

        stopDrag();

        const target = pick(mouseMovePosition);

        if (target) {

            const scratchDirection = new Cesium.Cartesian3();
            const direction = new Cesium.Cartesian3();
            Cesium.Cartesian3.subtract(target, viewer.scene.camera.position, scratchDirection);
            Cesium.Cartesian3.normalize(scratchDirection, direction);
            const magnitude = Cesium.Cartesian3.magnitude(scratchDirection);

            const useDefaultZoom = target.isEllipsoid && isUnderground(viewer.scene.camera);
            let zoom = useDefaultZoom ? 1000 : Math.max(magnitude / 4, 1000);

            // we're moving the camera along the direction of the mouse pointer so that we're zooming in on that location
            if (event > 0) {
                viewer.scene.camera.move(direction, zoom);
            } else {
                viewer.scene.camera.move(direction, -zoom);
            }
        }
    }

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(leftDown, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    handler.setInputAction(rightDown, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
    handler.setInputAction(stopDrag, Cesium.ScreenSpaceEventType.RIGHT_UP);
    handler.setInputAction(stopDrag, Cesium.ScreenSpaceEventType.LEFT_UP);
    handler.setInputAction(wheel, Cesium.ScreenSpaceEventType.WHEEL);

    handler.setInputAction(function (movement) {

        // keeping track of this for zooming to the correct location
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
};

export default CameraController;