# three.min.js

Bundle recortado de **three@0.186.1** (MIT, ver `LICENSE`), versión fija y sin CDN.

Contiene solo lo que usa la escena (`js/scene/`): los símbolos de `three` referenciados como `T.*`
más `EffectComposer`, `RenderPass`, `UnrealBloomPass`, `OutputPass`, `Line2`, `LineGeometry` y `LineMaterial`
de `three/examples/jsm`. Pesa ~580 KB (≈149 KB con gzip) frente a ~2,1 MB de `three.module.js` + `three.core.js` sin minificar.

## Regenerar

El sitio no tiene paso de build; esto es solo para actualizar o ampliar este archivo vendorizado.

```sh
npm pack three@0.186.1 && tar xzf three-0.186.1.tgz        # → ./package
npm i esbuild
# entry.js: un `export { … } from` por cada símbolo T.* usado en js/scene/*.js, más los addons
grep -rhoE "\bT\.[A-Za-z0-9_]+" ../../js/scene/*.js | sed 's/T\.//' | sort -u   # lista de símbolos
npx esbuild entry.js --bundle --format=esm --minify --target=es2020 --legal-comments=none \
  --outfile=three.min.js
```

Si añades un símbolo nuevo de three en la escena (p. ej. `T.TorusGeometry`), hay que añadirlo al `entry.js` y regenerar.
