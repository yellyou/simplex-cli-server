'use strict';

module.exports = core;
const path = require("path")
const semver = require("semver")
const colors = require("colors")
const commander = require("commander")
const userHome = require("user-home")
const pathExists = require("path-exists").sync

const init = require("@simplex-cli-dev/init")
const exec = require("@simplex-cli-dev/exec")
const log = require("@simplex-cli-dev/log")
const { getNpmInfo } = require("@simplex-cli-dev/get-npm-info")
const pkg = require("../package.json")
const constant = require("./const");

const program = new commander.Command()

function core() {
    // TODO
    try {
        // getNpmInfo("userhome")
        // return 
        // checkPkgVersion()
        // checkNodeVersion()
        // checkRoot()
        checkUserHome()
        checkEnv()
        // checkGlobalUpdate()
        registerCommand()
      
    } catch (e) {
        log.error(e.message)
    }

}

function checkPkgVersion() {
    log.info(pkg.version)
}
/**
 * 检查node版本号
 */
function checkNodeVersion() {
    // 获取当前node版本号
    const currentVersion = process.version
    // 比对最低node版本号
    const lowestVersion = constant.LOWEST_NODE_VERSION
    if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(colors.red(`simplex-cli 需要安装v${lowestVersion}以上的node`))
    }

}
/**
 * 对root账号进行自动降级
 */
function checkRoot() {
    const rootCheck = require("root-check")
    rootCheck()
}
/**
 * 获取用户主目录
 */
function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red("当前登录用户主目录不存在！"))
    }
}
/**
 * 检查环境变量
 */
function checkEnv() {
    const dotenv = require("dotenv")
    //自动获取.env文件
    const detenvPath = path.resolve(userHome, ".env")
    // 判断.env是否存在，不存在则创建
    if (pathExists(detenvPath)) {
        dotenv.config({
            path: detenvPath
        })
    }
    createDefaultConfig()
}
/**
 * 创建环境变量文件
 */
function createDefaultConfig() {
    const cliConfig = {
        home: userHome
    }
    if (process.env.CLI_HOME) {
        cliConfig['cliHome'] = path.resolve(userHome, process.env.CLI_HOME)
    } else {
        cliConfig['cliHome'] = path.resolve(userHome, constant.DEFAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH=cliConfig.cliHome
}
/**
 * 检查npm全局更新
 */
function checkGlobalUpdate() {
    // 1.获取当前版本号跟模块名
 
    getNpmInfo(pkg.name)
    // 2.调取npm API，获取所有版本号
    // 3.提取所有版本号，对比哪些版本号大于当前版本号
    // 4.获取最新版本号，提示用户进行更新
}
/**
 * 对脚手架注册命令
 */
function registerCommand() {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage("<command>[options]")
        .version(pkg.version)
        .option("-d,--debug", "是否开启调试模式", false)
        .option("-tp,--targetPath <targetPath>", "是否指定本地文件路径", "");

    program
        .command("init [projectName]")
        .option("-f,--force", "是否强制克隆")
        .action(exec)

    // 开启debug模式
    program.on("option:debug", function () {
        if (program._optionValues.debug) {
            process.env.LOG_LEVEL = "verbose"
        } else {
            process.env.LOG_LEVEL = "info"
        }
        log.level = process.env.LOG_LEVEL
    })
    // 指定targetPath
    program.on("option:targetPath", function () {
        process.env.CLI_TARGET_PATH = program._optionValues.targetPath
    })
    // 未知命令的监听
    program.on("command:*", function (obj) {
        const availableCommands = program.commands.map(cmd => cmd.name())
        console.log(colors.red("未知的命令：" + obj[0]))
        if (availableCommands.length > 0) {
            console.log(colors.red("可用的命令：" + availableCommands.join(",")))
        }
    })

    program.parse(process.argv);

    if (program.args && program.args.length < 1) {
        program.outputHelp()
    }
}