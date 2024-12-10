// src/nzshm_rupture_widget/esm/FullScreenWidget.js
function render({ model, el }) {
  const button = document.createElement("i");
  button.classList.add("fa");
  button.classList.add("fa-arrows");
  button.classList.add("controlButton3DMap");
  button.title = "Fullscreen";
  button.addEventListener("click", function(event) {
    if (!document.fullscreenElement) {
      const target = button.closest(".fullScreenTarget");
      if (target) {
        target.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  });
  el.appendChild(button);
}
var FullScreenWidget_default = { render };
export {
  FullScreenWidget_default as default
};
