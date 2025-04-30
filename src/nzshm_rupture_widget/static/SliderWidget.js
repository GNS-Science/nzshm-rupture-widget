// src/nzshm_rupture_widget/esm/SliderWidget.js
function asInt(value) {
  if (typeof value === "string") {
    return parseInt(value);
  }
  return value;
}
function Slider(parent, min, max, value, title, callback) {
  const div = document.createElement("div");
  div.classList.add("sliderWidget");
  div.title = title;
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
    slider.addEventListener("change", function(event) {
      callback({
        type: "change",
        value: asInt(event.target.value)
      });
    });
    slider.addEventListener("input", function(event) {
      callback({
        type: "input",
        value: asInt(event.target.value)
      });
    });
    sliderForward.addEventListener("click", function(event) {
      if (max > slider.value) {
        slider.value++;
        callback({
          type: "forward",
          value: asInt(slider.value)
        });
      }
    });
    sliderBack.addEventListener("click", function(event) {
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
  return function(value2) {
    if (value2 >= min && value2 <= max && slider.value !== value2) {
      slider.value = value2;
      callback({
        type: "setValue",
        value: asInt(slider.value)
      });
    }
  };
}
function render({ model, el }) {
  const startMin = model.get("min");
  const startMax = model.get("max");
  const startValue = model.get("value");
  const title = model.get("title");
  const update = Slider(el, startMin, startMax, startValue, title, ({ type, value }) => {
    model.set("value", value);
    model.save_changes();
  });
  model.on("change:value", function() {
    update(model.get("value"));
  });
}
var SliderWidget_default = { render };
export {
  SliderWidget_default as default
};
