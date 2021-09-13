const https = require('https')
const fs = require('fs')

// let url = "https://api.github.com";

// const options = {
//   hostname: 'api.github.com',
//   path: '/repos/farin/JCloisterZone/releases/latest',
//   headers: {
//     'User-Agent': 'JCloisterZone-Client-Build-Script'
//   }
// };

function download (url, w) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res1 => {
        https
          .get(res1.headers.location, res2 => {
            res2.pipe(w)
            res2.on('error', reject)
            res2.on('end', resolve)
          })
          .on('error', reject)
      })
      .on('error', reject)
  })
};

fs.access('Engine.jar', fs.F_OK, err => {
  if (err) {
    download('https://github.com/farin/JCloisterZone/releases/download/v5.7.99/Engine.jar', fs.createWriteStream('Engine.jar'))
  }
})

// function processRelease(data) {
//   const url = data.assets.find(a => a.name === 'Engine.jar').browser_download_url
//   console.log(`Downloading ${url}`)
//   const file = fs.createWriteStream("Engine.jar");
//   download(url, file);
// }

// https.get(options, (res) => {
//   let body = "";

//   res.on("data", (chunk) => {
//     body += chunk;
//   });

//   res.on("end", () => {
//     try {
//       let json = JSON.parse(body);
//       processRelease(json)
//     } catch (error) {
//       console.error(error.message);
//       process.exit(1)
//     };
//   });
// }).on("error", (error) => {
//   console.error(error.message);
//   process.exit(1)
// });
