'use strict';
const path = require("path")
const npminstall = require("npminstall")
const fse=require("fs-extra")
const pkgDir = require("pkg-dir").sync
const pathExists=require("path-exists").sync
const formatPath = require("@simplex-cli-dev/format-path")
const { getDefaultRegistry ,getNpmLastestVersion}=require("@simplex-cli-dev/get-npm-info")
const {
    isObject
} = require("@simplex-cli-dev/utils")

class Package {
    constructor(options) {
        if (!options) {
            throw new Error("Package类的options参数不能为空！")
        }
        if (!isObject(options)) {
            throw new Error("Package类的options必须是对象！")
        }
        //package目标路径
        this.targetPath = options.targetPath
        //package的缓存路径
        this.storeDir=options.storeDir
        //package的name
        this.packageName = options.packageName
        //package的版本
        this.packageVersion = options.packageVersion
        // package的缓存目录前缀
        this.cacheFilePathPrefix = this.packageName.replace('/', '_');
    }
    async prepare(){
        if(this.storeDir&&!pathExists(this.storeDir)){
            fse.mkdirpSync(this.storeDir);
        }
        //lastest转换成最新版本号
        if(this.packageVersion==='lastest'){
            this.packageVersion=await getNpmLastestVersion(this.packageName)
        }
    }
    get cacheFilePath() {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`);
      }
    
      getSpecificCacheFilePath(packageVersion) {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`);
      }
    // 判断pkg是否存在
    async existPkg(){
        if(this.storeDir){
            await this.prepare()
            return pathExists(this.cacheFilePath)
        }else{
            return pathExists(this.targetPath)
        }
    }
    //安装pkg依赖
     async installPkg() {
        await this.prepare()
        npminstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(),
            pkgs: [{
                name: this.packageName,
                version: this.packageVersion
            } ]
        })
    }
    //更新模块
    async updatePkg(){
        // 获取最新版本号
        const lastestVersion=await getNpmLastestVersion(this.packageName)
         //查看缓存中有没有最新模块的缓存依赖，没有就进行更新
        const lastestPath=this.getSpecificCacheFilePath(lastestVersion)
         if(!pathExists(lastestPath)){
            await npminstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(),
                pkgs: [{
                    name: this.packageName,
                    version: this.packageVersion
                } ]
            })
         }else{
            this.packageVersion=lastestVersion
         }
    }
    //获取入口文件路径
    getRootFilePath() {
        // 1.获取package.json所在目录
        const dir = pkgDir(this.targetPath)
        if (dir) {
            // 2.读取package.json
            const pkgFile = require(path.resolve(dir, "package.json"))
            // 3.寻找main/lib
            if (pkgFile && pkgFile.main) {
                // 4.路径的兼容（mac/windows)
                return formatPath(path.resolve(dir, pkgFile.main))
            }
        }
        return null
    }

}

module.exports = Package;