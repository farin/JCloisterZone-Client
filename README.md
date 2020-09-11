# JCloisterZone Client

#### Build Setup

``` bash
# install dependencies
yarn install

# serve app with hot reload
yarn run dev

# build electron application for production
yarn run package

# lint all JS/Vue component files in `src/`
yarn run lint
```

## Development notes

### Issues with upgrade to Electron 9 / 10

Issues with 9
- after page reload, spawn jave process seems to be stucked
look at app.allowRendererProcessReuse - which changed to true in 9
- also page perfomance seems to be worse

Issues with 10
Vue Dev Tools are not loaded

### How to convert Photoshop path to SVG

https://www.bittbox.com/culture/convert-paths-to-shapes-in-photoshop

With path selected choose "Layers / New fill layer"