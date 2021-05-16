'use strict';

const log = require("npmlog")

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info";
log.heading="simplex"
log.headingStyle={
    fg:"black",
    bg:"white"
}
log.addLevel("success", 2000, {
    fg: "green",
    blod: true
})

module.exports = log;