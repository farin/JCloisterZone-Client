const fs = require('fs')

const path = './Engine.jar'

fs.access(path, fs.F_OK, (err) => {
  if (err) {
    console.error('Engine.jar is missing.')
    console.error('Make engine build (https://github.com/farin/JCloisterZone) and put it to project root to include it in JCloisterZone app build.')
    process.exit(1)
  }

  console.log('Engine.jar exists.')
})
