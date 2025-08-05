const axios = require('axios');
axios.post("https://faydev.my.id/hosted/tiktok-api/api", {
  url: "https://www.tiktok.com/@someuser/video/1234567890"
}, {
  headers: {
    "Content-Type": "application/json"
  }
})
.then(res => {
  console.log("RESPONSE:", res.data);
})
.catch(err => {
  console.error("ERROR:", err);
});
