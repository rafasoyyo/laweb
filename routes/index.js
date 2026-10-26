var express = require("express");
var router = express.Router();
const path = require("path");

/* GET home page. */
router.get("/:version", function (req, res, next) {
    if (!["v1", "v2"].includes(req.params.version)) return next();
    const pathFolder = path.join(
        __dirname,
        "..",
        `/public/${req.params.version}/index.html`,
    );
    console.log("two:", pathFolder);
    res.sendFile(pathFolder);
});

/* GET home page. */
router.get("/", function (req, res, next) {
    res.redirect("/v2");
});

/* GET app version. */
router.get("/version", function (req, res, next) {
    const info = require("../package.json");
    res.render("index", {
        title: info.name,
        version: info.version,
    });
});

module.exports = router;
