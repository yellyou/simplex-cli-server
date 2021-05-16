'use strict';
const path=require("path")
const Package = require("@simplex-cli-dev/package")
const log = require("@simplex-cli-dev/log")

const SETTINGS = {
    // "init": "@simplex-cli-dev/init"
    "init":"@imooc-cli/init"
}
const CACHE_DIR="dependencies/"
async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH
    let storeDir=""
    const homePath = process.env.CLI_HOME_PATH
    log.verbose("targetPath:",targetPath)
    log.verbose("homePath:",homePath)
    const cmdObj = arguments[arguments.length - 1]
    const cmdName = cmdObj.name()
    const packageName=SETTINGS[cmdName]
    const packageVersion="lastest"

    //如果目标路径不存在，生成缓存路径
    if(!targetPath){
        //生成缓存路径
        targetPath=path.resolve(homePath,CACHE_DIR)
        storeDir=path.resolve(targetPath,"node_modules")
        const pkg = new Package({
            targetPath,
            storeDir,
            packageName,
            packageVersion
        })
        if(await pkg.existPkg()){
            //更新pkg
            console.log('更新数据')
            await pkg.updatePkg()
        }else{
            //安装pkg
            await pkg.installPkg()
        }
    }
    
}

module.exports = exec;