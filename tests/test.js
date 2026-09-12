const axios = require("axios");
axios
    .get("http://localhost:4000/api/list?type=movie&sort=popular")
    .then((r) => console.log("popular", r.data.length))
    .catch((e) => console.log("err", e.message));
axios
    .get("http://localhost:4000/api/list?type=movie&sort=now_playing")
    .then((r) => console.log("now_playing", r.data.length))
    .catch((e) => console.log("err", e.message));
