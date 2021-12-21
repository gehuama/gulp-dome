const { src, dest, parallel, watch, series, tree } = require("gulp");
const less = require("gulp-less");
const gulpClean = require("gulp-clean");
const babel = require("gulp-babel");
const ejs = require("gulp-ejs");
const useref = require("gulp-useref");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const cleanCss = require("gulp-clean-css");
const gulpIf = require("gulp-if");
const browserSync = require("browser-sync")
/** 创建一个服务 */
const browserServer = browserSync.create();
/** 清除目录 */
const clean = () => {
    return src(["dist/**", "temp/**"], { read: false })
        .pipe(gulpClean())
}
// 编辑样式
const styles = () => {
    return src("src/styles/**/*.less", { base: "src" })
        .pipe(less())
        .pipe(dest("temp"))
}

/** 编辑JS脚本 */
const scripts = () => {
    return src("src/scripts/**/*.js", { base: "src" })
        .pipe(babel({
            presets: ["@babel/preset-env"]
        }))
        .pipe(dest("temp"))
}

/** 编译html模版 */
const html = () => {
    return src("src/**/*.html", { base: "src" })
        .pipe(ejs({ title: "gulp" }, { cache: false }))
        .pipe(dest("temp"))
}

/** 压缩图片 */
const images = async () => {
    const imagemin = await import('gulp-imagemin');
    /** @符号 表示有且只有一个 */
    return src("src/assets/images/**/*.@(jpg|png|gif|svg)", { base: "src" })
        .pipe(imagemin.default())
        .pipe(dest("dist"))
}
/** 拷贝不需要任何编译处理的静态文件 到输出目录 */
const static = () => {
    /** @符号 表示有且只有一个 */
    return src("static/**", { base: "static" })
        .pipe(dest("dist"))
}
/** 服务 */
const serve = () => {
    watch("src/styles/**/*.less", styles);
    watch("src/scripts/**/*.js", scripts);
    watch("src/**/*.html", html);
    watch(["src/assets/images/**/*.@(jpg|png|gif|svg)", "static/**"], browserServer.reload)
    // serve和webpack-dev-server 里的打包不一样， serve不会在内存和硬盘上生成任何文件
    // webpack-dev-server 也只读内存中的文件，webpack打包生成到内存里
    return browserServer.init({
        notify: false,
        server: {
            baseDir: ["temp", "src", "static"], // 静态文件根目录
            files: ["dist/**"], // 监听 文件变化 文件变化后重新刷新浏览器
            routes: {
                "/node_modules": "node_modules"
            }
        }
    })
}
/** */
const concat = () => {
    // src index.html
    // 经过useref处理之后变成 里面有三个文件了 index.html build.css build.js
    return src("temp/**/*.html", { base: "temp" })
        .pipe(useref({ searchPath: ["temp", "."] }))
        .pipe(gulpIf("*.js", uglify()))
        .pipe(gulpIf("*.css", cleanCss()))
        .pipe(gulpIf("*.html", htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        })))
        .pipe(dest("dist"))
}
/** 把需要编译的任务组合在一起，成为一个并发执行的组合任务 */
const compile = parallel(styles, scripts, html);
const build = series(clean, parallel(series(compile, concat), images, static))
const dev = series(clean, compile, serve)
// 生产环境构建
exports.build = build;
// 开发环境预览
exports.dev = dev;

/** 开发环境 图片查找机制 */

// 路径 assets/images/circle.svg
// 先查找 dist/assets/images/circle.svg
// 再查找 src/assets/images/circle.svg

// 路径 rect.svg
// 先查找 dist/rect.svg
// 再查找 src/rect.svg
// 最后查找 static/rect.svg