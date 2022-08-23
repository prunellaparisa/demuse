let fs = require("fs");
let axios = require("axios");

// music.js file invokes first
// uploaded files should be entered into this "media" array, the last index being the album cover
let media = [];
let ipfsArray = [];
let promises = [];

for (let i = 0; i < media.length; i++) {
  promises.push(
    new Promise((res, rej) => {
      fs.readFile(`${__dirname}/export/${media[i]}`, (err, data) => {
        if (err) rej();
        ipfsArray.push({
          path: `media/${i}`,
          content: data.toString("base64"),
        });
        res();
      });
    })
  );
}

// the output of this axios call are url paths to the ipfs files 
Promise.all(promises).then(() => {
  axios
    .post("https://deep-index.moralis.io/api/v3/ipfs/uploadFolder", ipfsArray, {
      headers: {
        "X-API-KEY":
          "D7tm2sjoL0J9ojW93flYPMpf2GPW1AZXPLhR1203hn51ZOwqSIEBT0h8D9Cc2hOS",
        "Content-Type": "application/json",
        accept: "application/json",
      },
    })
    .then((res) => {
      console.log(res.data);
    })
    .catch((error) => {
      console.log(error);
    });
});
