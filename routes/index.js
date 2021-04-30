var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.sendfile(__dirname + "/public/index.html");
});

/* GET app version. */
router.get('/version', function (req, res, next) {
    const info = require('../package.json');
    res.render('index', {
        title: info.name,
        version: info.version
    });
});

module.exports = router;
