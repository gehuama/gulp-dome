const { src, dest } = require("gulp");
/** 
 * dest 指定的是输出的目录名，不包括文件路径
 * 文件路径或者说文件名是glob里的通配符开始的路径部分
*/
function copyTask() {
    console.log("执行拷贝文件");
    /**
     * { base: 'src' }
     * 表示以src为基础路径，把src之后的部分作为路径
     * */
    return src("src/scripts/**/*.js", {base: 'src'})
        .pipe(dest("dist"))
}
exports.copy= copyTask;