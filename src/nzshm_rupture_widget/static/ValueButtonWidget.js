// src/nzshm_rupture_widget/esm/ValueButtonWidget.js
function nextValue(value, values) {
  const index = values.indexOf(value);
  if (index + 1 >= values.length) {
    return values[0];
  }
  return values[index + 1];
}
function render({ model, el }) {
  const button = document.createElement("div");
  button.classList.add("fa");
  button.classList.add(model.get("icon"));
  button.classList.add("controlButton3DMap");
  button.title = model.get("title");
  button.addEventListener("click", function(event) {
    const values = model.get("values");
    const value = model.get("value");
    model.set("value", nextValue(value, values));
  });
  el.appendChild(button);
}
var ValueButtonWidget_default = { render };
export {
  ValueButtonWidget_default as default
};
