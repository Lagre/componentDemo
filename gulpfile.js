var gulp        = require('gulp'),
	connect     = require('gulp-connect'), //本地Server
	livereload  = require('gulp-livereload'), //实时刷新
	runSequence = require('run-sequence'), //同步执行
	concat      = require('gulp-concat'), //文件合并
	uglify      = require('gulp-uglify'), //去掉注释
	rename      = require('gulp-rename'), //重命名
	mincss      = require('gulp-mini-css'), //去掉CSS中的注释
	rev         = require('gulp-rev'),
	revReplace  = require('gulp-rev-replace'), 
	revCollector= require('gulp-rev-collector'), //静态资源版本
	stripDebug  = require('gulp-strip-debug'); //去掉调试代码


var path = {
	dev : './src/', //开发根目录
	build : './dist/' //生产根目录
}

gulp.task('server',function() {
	connect.server({
		name : 'dev h5',
		port : 8888,
		livereload : true
	});
});

gulp.task('reload-dev-html',function() { //实时刷新
	gulp.src(path.dev + 'html/**/*.html')
		.pipe(connect.reload());
});

gulp.task('reload-dev-less',function() { //实时刷新
	gulp.src(path.dev + 'css/**/*.less')
		.pipe(connect.reload());
});

gulp.task('reload-dev-js',function() { //实时刷新
	gulp.src(path.dev + 'js/**/*.js')
		.pipe(connect.reload());
});

gulp.task('watch-html',function() { //监听
	gulp.watch(path.dev + 'html/**/*.html',['reload-dev-html']);
});

gulp.task('watch-less',function() { //监听
	gulp.watch(path.dev + 'css/**/*.less',['reload-dev-less']);
});

gulp.task('watch-js',function() { //监听
	gulp.watch(path.dev + 'js/**/*.js',['reload-dev-js']);
});

gulp.task('live',function(done) { //顺序执行
	condition = false;
	runSequence(
		['server'],
		['watch-html'],
		['watch-less'],
		['watch-js'],
		done
	);
});

gulp.task('minjs',function() { //压缩JS
	gulp.src(path.dev + '/js/*.js')
		.pipe(stripDebug())
		.pipe(uglify())
		.pipe(rename({suffix : '.min'})) //重命名为*.min
		.pipe(gulp.dest(path.build + '/js')); //输出
});

gulp.task('concatjs',function() { //合并压缩后的JS
	gulp.src(path.build + '/js/*.min.js')
		.pipe(concat('mainjs.min.js'))
		.pipe(gulp.dest(path.build + 'js/concat/'));
});

gulp.task('mincss',function() { //压缩CSS
	gulp.src(path.dev + '/css/*.css')
		.pipe(mincss()) //默认不保留注释
		.pipe(rename({suffix : '.min'})) //重命名为*.min
		.pipe(gulp.dest(path.build + '/css')); //输出
});

gulp.task('concatcss',function() { //合并压缩后的CSS
	gulp.src(path.build + '/css/*.min.css')
		.pipe(concat('maincss.min.css'))
		.pipe(gulp.dest(path.build + 'css/concat/'));
});

gulp.task('revCSS',function() { //CSS生成文件hash编码并生成 rev-manifest.json文件名对照映射
	gulp.src(path.dev + '/css/*.css')
		.pipe(rev())
		.pipe(rev.manifest())
		.pipe(gulp.dest(path.build + '/css'));
});

gulp.task('revJS',function() { //js生成文件hash编码并生成 rev-manifest.json文件名对照映射
	gulp.src(path.dev + '/js/*.js')
		.pipe(rev())
		.pipe(rev.manifest())
		.pipe(gulp.dest(path.build + '/js'));
});

gulp.task('revHTML',function() { //HTML替换CSS,JS文件版本
	gulp.src([path.build + '**/*.json', path.dev + './html/*.html'])
		.pipe(revCollector())
		.pipe(gulp.dest(path.build + '/html'));
});

gulp.task('md5',function(done) { //顺序执行上面三个task
	condition = false;
	runSequence(
		['revCSS'],
		['revJS'],
		['revHTML'],
		done
	);
})