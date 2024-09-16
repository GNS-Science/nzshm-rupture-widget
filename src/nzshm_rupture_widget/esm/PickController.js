import { pick } from "./CameraController";
import { styleEntity, recoverEntityStyle } from "./styles";

function PickController(viewer, style, callback) {

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    let lastPicked = undefined

    const getMessage = function (picked) {
        if (!picked) {
            return undefined;
        }
        if (picked?.source === 'ellipsoid') {
            return picked;
        }
        if (picked?.object?.id instanceof Cesium.Entity) {

            // console.log(picked);
            const entity = picked.object.id;
            if (lastPicked == entity) {
                return undefined
            }
            if(style) {
                styleEntity(entity, style);
            }
            recoverEntityStyle(lastPicked)
            lastPicked = entity;
            const props = entity.properties
            const properties = props.propertyNames.reduce((result, k) => {
                result[k] = props[k].getValue()
                return result;
            }, {})
            return {
                source: "entity",
                entity,
                properties,
                position: picked.position
            }
        }
    }

    handler.setInputAction(function (event) {
        const picked = pick(viewer, event.endPosition);
        const message = getMessage(picked);

        if (message) {

            if(message.entity && style) {

            }

            callback(message);
        }


        // if (picked instanceof Cesium.Cesium3DTileFeature) {
        //     picked.color = Cesium.Color.YELLOW;
        // }
        // if (picked) {
        //     module.send({
        //         msg: "pick",
        //         properties: picked.properties
        //     })
        // }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

export default PickController;