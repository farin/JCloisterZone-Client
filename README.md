# JCloisterZone Client

Main platform repository https://github.com/farin/JCloisterZone
(report issue there)

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

## Engine for local dev

Engine.jar is not included in repository. (to avoid storing continuosly changing binary in git history)
To client only development take it from installed JCloisterZone app or make fresh build in main repository https://github.com/farin/JCloisterZone
Then put Engine.jar it to the project root.

## Run client against remote engine

Another option is running against dev version of engine.
Run engine listening to socket. It will be usualy started using Java IDE.
Add program args to run configuration

```
-port 9000
```

Add engine's socket address to jcz-config.json
```
"enginePath": "localhost:9000",
```

## Development notes

https://github.com/electron-userland/electron-builder/issues/1340

### How to convert Photoshop path to SVG

https://www.bittbox.com/culture/convert-paths-to-shapes-in-photoshop

With path selected choose "Layers / New fill layer"
