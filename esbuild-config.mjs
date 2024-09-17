const entryPoints = [
    "./src/nzshm_rupture_widget/esm/SliderWidget.js",
    "./src/nzshm_rupture_widget/esm/MapWidget.js",
    "./src/nzshm_rupture_widget/esm/FullScreenWidget.js",
    "./src/nzshm_rupture_widget/esm/HomeWidget.js",
    "./src/nzshm_rupture_widget/esm/ValueButtonWidget.js"
  ]
  
export const config = {
    entryPoints,
    bundle: true,
    outdir: './src/nzshm_rupture_widget/static/',
    format: 'esm', // or 'esm' for ES Modules
  }
  