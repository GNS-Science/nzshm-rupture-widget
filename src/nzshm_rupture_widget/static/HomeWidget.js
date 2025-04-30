// src/nzshm_rupture_widget/esm/HomeWidget.js
function render({ model, el }) {
  const button = document.createElement("div");
  button.classList.add("fa");
  button.classList.add("fa-home");
  button.classList.add("controlButton3DMap");
  button.title = "Navigate Home";
  button.addEventListener("click", function(event) {
    model.send({ msg: "home" });
  });
  el.appendChild(button);
}
var HomeWidget_default = { render };
export {
  HomeWidget_default as default
};
