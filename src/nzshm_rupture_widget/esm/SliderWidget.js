function asInt(value) {
    if (typeof value === "string") {
        return parseInt(value);
    }
    return value;
}
/**
 * An HTML slider with stepping buttons.
 * 
 * TODO: add animation, play button, rate slider.
 * @param {HTMLElement} parent the parent Element
 * @param {Number} min minimum value (inclusive)
 * @param {Number} max maximum value (inclusive)
 * @param {Number} value the currentl value
 * @param {Function} callback 
 * @returns Function to set the `selected` value
 */
function Slider(parent, min, max, value, callback) {

    const div = document.createElement("div");
    div.classList.add("sliderWidget");

    const slider = document.createElement("input");
    slider.type = "range";
    slider.classList.add("rangeSlider");
    slider.min = min;
    slider.max = max;
    slider.value = value;

    const sliderForward = document.createElement("div");
    sliderForward.classList.add("fa");
    sliderForward.classList.add("fa-forward");
    sliderForward.classList.add("sliderControlButton");

    const sliderBack = document.createElement("div");
    sliderBack.classList.add("fa");
    sliderBack.classList.add("fa-backward");
    sliderBack.classList.add("sliderControlButton");

    if (callback) {
        slider.addEventListener("change", function (event) {
            callback({
                type: "change",
                value: asInt(event.target.value)
            });
        });
        slider.addEventListener("input", function (event) {
            callback({
                type: "input",
                value: asInt(event.target.value)
            });
        });
        sliderForward.addEventListener("click", function (event) {
            if (max > slider.value) {
                slider.value++;
                callback({
                    type: "forward",
                    value: asInt(slider.value)
                });
            }
        });
        sliderBack.addEventListener("click", function (event) {
            if (min < slider.value) {
                slider.value--;
                callback({
                    type: "back",
                    value: asInt(slider.value)
                });
            }
        });
    }

    div.appendChild(sliderBack);
    div.appendChild(sliderForward);
    div.appendChild(slider);
    parent.appendChild(div);

    return function (value) {
        if (value >= min && value <= max && slider.value !== value) {
            slider.value = value;
            callback({
                type: "setValue",
                value: asInt(slider.value)
            });
        }
    }
}

/**
 * AnyWidget render function for a slider widget that uses `Slider`
 */
function render({ model, el }) {

    const startMin = model.get("min");
    const startMax = model.get("max");
    const startValue = model.get("value");

    const update = Slider(el, startMin, startMax, startValue, ({type, value}) => {
        model.set("value", value);
        model.save_changes();
    });
    model.on("change:value", function () {
        update(model.get("value"));
    });
}

export default { render };
