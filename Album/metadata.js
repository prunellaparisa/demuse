let fs = require("fs");
let axios = require("axios");

// metadata.js invokes second
let songs = [];
let durations = []; // duration of each song
let ipfsArray = [];

// how to extract the hash from ipfs link? trim link up to "ipfs/"?
for (let i = 0; i < songs.length; i++) {
  ipfsArray.push({
    path: `metadata/${i}.json`,
    content: {
      image: `ipfs://xxx`, //xxx = hash
      name: songs[i],
      animation_url: `ipfs://xxx/`, //xxx = hash
      duration: durations[i],
      artist: "",
      year: ""
    },
  });
}

// the output of this axios call is the ipfs storage of metadata of each proper song upload
axios.post("https://deep-index.moralis.io/api/v3/ipfs/uploadFolder", ipfsArray, {
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
