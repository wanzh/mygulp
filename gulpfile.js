/*
 * 组件安装
 * npm install gulp-util gulp-imagemin gulp-minify-css gulp-jshint gulp-uglify gulp-rename gulp-concat gulp-clean  --save-dev
 */
/*cnpm install gulp gulp-util browser-sync gulp-imagemin imagemin-pngquant gulp-minify-css gulp-jshint gulp-uglify gulp-concat gulp-rename gulp-clean gulp-zip gulp-sftp --save-dev*/
/*cnpm install gulp gulp-util browser-sync gulp-imagemin  --save-dev*/
/*cnpm install gulp-minify-css gulp-jshint gulp-uglify gulp-concat --save-dev*/
/*cnpm install gulp-rename gulp-clean gulp-zip gulp-sftp --save-dev*/
/*cnpm install imagemin-pngquant --save-dev*/
var settings = {};
settings.designWidth = 1000;
settings.postcss = [];
var environment = [];
environment['d'] = {
    srcDir: 'src/',
    dstDir: 'dist/',
    htmlSrc: './src/*.html',
    htmlDst: './dist/',
    useLess:true,
    isPx2rem:false,
    cssSrc: './src/less/**/*.less',
    cssDst: './dist/css',
    cssMin: ['dist/css/**/*.css', '!/dist/css/**/*.min.css'],
    imgSrc: './src/images/**/*.+(jpeg|jpg|png)',
    imgDst: './dist/images',
    jsSrc: 'src/js/**/*.js',
    jsDst: './dist/js',
    jsMin: ['dist/js/**/*.js', '!dist/js/**/*.min.js'],
    rev: false,
    useHash: false,
    isMin: false
};
environment['p'] = {
    srcDir: 'src/',
    dstDir: 'dist/',
    htmlSrc: './src/*.html',
    htmlDst: './dist/',
    useLess:false,
    isPx2rem:true,
    cssSrc: './src/css/**/*.css',
    cssDst: './dist/css',
    cssMin: './dist/css/**/*.css',
    imgSrc: './src/images/**/*.+(jpeg|jpg|png)',
    imgDst: './dist/images',
    jsSrc: 'src/js/**/*.js',
    jsDst: './dist/js',
    jsMin: ['dist/js/**/*.js', '!dist/js/**/*.min.js'],
    rev: true,
    useHash: false,
    isMin: true
};
var gulp = require('gulp'); //基础库
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var filter = require('gulp-filter');
var postcss = require('gulp-postcss');
var changed = require('gulp-changed');
var less = require('gulp-less');//转换less用的
var minifycss = require('gulp-minify-css');//css压缩
var cache = require('gulp-cache');
var imagemin = require('gulp-imagemin');//图片压缩

var jshint = require('gulp-jshint');//js检查
var uglify = require('gulp-uglify');//混淆js,js压缩

var clean = require('gulp-clean');//清理文件
//var notify = require('gulp-notify');//加控制台文字描述用的

var concat = require('gulp-concat');//合并
var rename = require('gulp-rename');//重命名

var gulpif = require('gulp-if');//if判断，用来区别生产环境还是开发环境的
//var revReplace = require('gulp-rev-replace');//替换引用的加了md5后缀的文件名，修改过，用来加cdn前缀

var argv = require('yargs').argv;
var _ = require('lodash');
var path = require('path');

var evr = 'd';//生产环境为p，开发环境为d，默认为开发环境
if (argv.p) {
    evr = 'p';
} else if (argv.d) {
    evr = 'd';
} else if (argv.e) {
    if (argv.e !== true) {
        evr = argv.e;
    }
}
var mod = argv.m || 'all';//模块明，默认为全部

gulp.task('help', function () {
    console.log('   gulp build          文件打包');
    console.log('   gulp watch          文件监控打包');
    console.log('   gulp help           gulp参数说明');
    console.log('   gulp server         dist server');
    console.log('   gulp server0        src server');
    console.log('   gulp -p             生产环境');
    console.log('   gulp -d             开发环境（默认生产环境）');
});

/* 默认 */
gulp.task('default', function () {
    gulp.start('help');
});
// HTML处理
gulp.task('html', function () {
    var src = environment[evr].htmlSrc;
    var dest = environment[evr].htmlDst;
    var result = gulp.src(src)
        .pipe(changed(dest))
        .pipe(gulp.dest(dest));
    result = result.pipe(reload({stream: true}));
    return result;
});

gulp.task('css', function () {
    var src = environment[evr].cssSrc;
    var dest = environment[evr].cssDst;
    var isMin = environment[evr].isMin;
    var useLess= environment[evr].useLess;
    var processors = [
        require('autoprefixer')(),
        require('postcss-import')(),
    ];
    if (settings.designWidth <= 750) {
        var remUnit = settings.designWidth / 10;
        var px2rem = require('postcss-px2rem');
        processors.push(require('postcss-px2rem')({remUnit: remUnit}));
    }
    var result = gulp.src(src)
        .pipe(changed(dest));
    if(useLess){
        result=result.pipe(less());
    }
    result=result.pipe(postcss(processors));
    if (isMin == true) {
        result = result.pipe(minifycss());
    }
    result = result.pipe(gulp.dest(dest));
    result = result.pipe(reload({stream: true}));
    /*if (isMin == true) {
     result = result.pipe(rename({suffix: '.min'}))
     .pipe(minifycss())
     .pipe(gulp.dest(dest));
     }*/

    return result;

});
gulp.task('cssmin', function () {
    return gulp.src(environment[evr].cssMin).pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest(environment[evr].cssDst));
});
// 样式处理
gulp.task('js', function () {
    var src = environment[evr].jsSrc;
    var dest = environment[evr].jsDst;
    var isMin = environment[evr].isMin;
    var result = gulp.src(src)
        .pipe(changed(dest));
    if (isMin) {
        result = result.pipe(uglify());
    }
    result = result.pipe(gulp.dest(dest));
    result = result.pipe(reload({stream: true}));
    /* if (isMin) {
     result = result.pipe(uglify())
     .pipe(rename({suffix: '.min'}))
     .pipe(gulp.dest(dest));
     }*/
    return result;
});
gulp.task('jsmin', function () {
    return gulp.src(environment[evr].jsMin).pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(environment[evr].jsDst));
});
// 图片处理
gulp.task('img', function () {
    var src = environment[evr].imgSrc;
    var dest = environment[evr].imgDst;
    var isMin = environment[evr].isMin;
    var imageminJpegtran = require('imagemin-jpegtran');
    var imageminPngquant = require('imagemin-pngquant');
    var result = gulp.src(src)
        .pipe(changed(dest));
    if (isMin) {
        result = result.pipe(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
            use: [imageminJpegtran(),imageminPngquant({quality: '65-80', speed: 4})]
        }));
    }
    result = result.pipe(gulp.dest(dest));
    return result;
});


gulp.task('build', function () {
    gulp.src(environment[evr].htmlSrc)
        .pipe(gulp.dest(environment[evr].htmlDst))
});
gulp.task('clean', function () {
    return gulp.src(environment[evr].dstDir, {read: false})
        .pipe(clean());
});
gulp.task('watch', function () {
    gulp.watch(environment[evr].htmlSrc, ['html']);
    gulp.watch(environment[evr].cssSrc, ['css']);
    gulp.watch(environment[evr].jsSrc, ['js']);
    gulp.watch(environment[evr].imgSrc, ['img']);
});
gulp.task('reload', function () {
    reload();
});
// 监视文件改动并重新载入
gulp.task('server', ['html', 'css'], function () {
    gulp.watch(environment[evr].htmlSrc, ['html']);
    gulp.watch(environment[evr].cssSrc, ['css']);
    gulp.watch(environment[evr].jsSrc, ['js']);
    gulp.watch(environment[evr].imgSrc, ['img']);
    browserSync({
        server: {
            baseDir: environment[evr].dstDir
        },
        port: 3000
    });
});
// 监视文件改动并重新载入
gulp.task('server0', function () {
    gulp.watch(environment[evr].htmlSrc, ['html', 'reload']);
    gulp.watch(environment[evr].cssSrc, ['css', 'reload']);
    gulp.watch(environment[evr].jsSrc, ['js', 'reload']);
    gulp.watch(environment[evr].imgSrc, ['img', 'reload']);
    //gulp.watch(['src/*.html', 'src/css/**/*.css', 'src/js/**/*.js'], reload);
    browserSync({
        server: {
            baseDir: environment[evr].srcDir
        },
        port: 3002
    });
});