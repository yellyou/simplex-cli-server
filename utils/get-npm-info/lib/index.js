'use strict';

const axios = require("axios")
const semver = require("semver")
const urlJoin = require("url-join")

//请求指定npm包的所有信息
function getNpmInfo(npmName, registry) {
    if (!npmName) {
        return null
    }
    const registryUrl = registry || getDefaultRegistry(true)
    const npmInfoUrl = urlJoin(registryUrl, npmName)

    return axios.get(npmInfoUrl).then(response => {
        if (response.status === 200) {
            return response.data;
        }
        return null;
    }).catch(err => {
        return Promise.reject(err);
    });
}
//获取npm包所有版本号
async function getNpmVersion(npmName, registry) {
    const npmInfo = await getNpmInfo(npmName, registry)
    if (npmInfo) {
        return Object.keys(npmInfo._version)
    } else {
        return []
    }
}
//获取最新版本号
async function getNpmLastestVersion(npmName, registry) {
    const npmInfo = await getNpmInfo(npmName, registry)
    // console.log(npmInfo)
    if (npmInfo) {
        return npmInfo['dist-tags'].latest
    } else {
        return []
    }
}
//指定代理源
function getDefaultRegistry(isOriginal = false) {
    return isOriginal ? "https://registry.npmjs.org/" : "https://registry.npm.taobao.org/"
}

module.exports = {
    getNpmInfo,
    getDefaultRegistry,
    getNpmLastestVersion
};