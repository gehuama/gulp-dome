const fs = require("fs");
const through = require("through2");
/** 异步任务回调 */
function callbackTask(done) {
    setTimeout(() => {
        console.log("callbackTask")
        done(); // 调用done方法就表示任务完成了
    }, 1000)
}
/** promise异步任务 */
function promiseTask() {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('promiseTask');
            resolve(); // 调用resolve方法就表示任务完成了
        })
    })
}

/** async 异步任务 */
async function asyncTask() {
    await new Promise(resolve => {
        setTimeout(() => {
            console.log('promiseTask');
            resolve(); // 调用resolve方法就表示任务完成了
        })
    })
}

/** 流 异步任务 */
function streamTask() {
    // 流的操作其实也是异步的，这个任务也需要等待流这个异步任务之后才会让任务结束
    let rs = fs.createReadStream("input.txt", { autoClose: true });
    let ws = fs.createWriteStream("output.txt", { autoClose: true });
    return rs.pipe(through((chunk, enc, next) => {
        setTimeout(() => {
            next(null, chunk.toString() + "$");
        }, 3000)
    })).pipe(ws, { end: true })
    .on("end", ()=>{
        console.log("写入完毕！")
    })
}

exports.callback = callbackTask;
exports.promise = promiseTask;
exports.async = asyncTask;
exports.stream = streamTask;