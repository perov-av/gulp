const {src, dest, watch, parallel, series} = require("gulp");
const browserSync 												 = require("browser-sync").create(); //Раздает локальные хосты, обновляет браузер
const del 																 = require("del"); //Чистильщик. Удаляет директорию public

//Конфигурация. Переменные с путями
const path = require("./config/path.js");

// Плагины
const fileInclude 			= require("gulp-file-include"); //Позволяет собирать несколько шаблонов HTML в один
const htmlmin 					= require("gulp-htmlmin"); //Минифицирует HTML
const size 							= require("gulp-size"); //Определяет размер сжатия
const plumber		  			= require("gulp-plumber"); //Отлавливает ошибки
const notify		  			= require("gulp-notify"); //Оповещает об ошибках через уведомления винды
const concat		  			= require("gulp-concat"); //Объединяет файлы css в один
const cssimport		  		= require("gulp-cssimport"); //Объединяет файлы css в один
const autoprefixer		  = require("gulp-autoprefixer"); //Проставляет префиксы css для старых браузеров 5 версий
const csso		  				= require("gulp-csso"); //Сжимает css файл в минифицированный вид
const rename		  			= require("gulp-rename"); //Переименование файлов
const shorthand		  		= require("gulp-shorthand"); //Объединяет стили в краткую запись
const mediaQueries		  = require("gulp-group-css-media-queries"); //Объединяет медиазапросы
const sassScss		  		= require("gulp-sass")(require("sass")); //Работа с sass
const sassGlob		  		= require("gulp-sass-glob"); //Объединяет множество файлов sass
const babel				  		= require("gulp-babel"); //Переводит JavaScript в ES5
const uglify				 		= require("gulp-uglify-es").default; //минифицирует JavaScript
const imagemin		  		= require("gulp-imagemin"); //Обработка и сжатие изображений
const newer		  				= require("gulp-newer"); //Обработка только новых изображений
const webp		  				= require("gulp-webp"); //Конвертация изображений в webp
const webpHtml  				= require("gulp-webp-html"); //Подставляет тэг picture для возможности указания в качестве источника нескольких изображений, если браузером не поддерживается webp
const webpCss	  				= require("gulp-webp-css"); //Подставляет в css для возможности указания в качестве источника нескольких изображений, если браузером не поддерживается webp
const fonter	  				= require("gulp-fonter"); //Конвертация шрифтов
const ttf2woff2	  				= require("gulp-ttf2woff2"); //Конвертация шрифтов


// Обработка HTML
const html = () => {
	return src(path.html.src)
	.pipe(plumber({
		errorHandler: notify.onError(error => ({
			title: "Ошибка в HTML",
			message: error.message
		}))
	}))
	.pipe(fileInclude())
	.pipe(webpHtml())
	.pipe(size({title: "Все HTML ДО сжатия"}))
	.pipe(htmlmin({
		collapseWhitespace: true
	}))
	.pipe(size({title: "Все HTML ПОСЛЕ сжатия"}))
	.pipe(dest(path.html.dest))
}

// Обработка CSS
const css = () => {
	return src(path.css.src, {sourcemaps: true})
	.pipe(plumber({
		errorHandler: notify.onError(error => ({
			title: "Ошибка в CSS",
			message: error.message
		}))
	}))
	.pipe(concat("style.css"))
	.pipe(cssimport())
	.pipe(webpCss())
	.pipe(autoprefixer())
	.pipe(shorthand())
	.pipe(mediaQueries())
	.pipe(size({title: "Все css ДО сжатия"}))
	.pipe(dest(path.css.dest, {sourcemaps: true}))
	.pipe(rename({suffix: ".min"}))
	.pipe(csso())
	.pipe(size({title: "Все css ПОСЛЕ сжатия"}))
	.pipe(dest(path.css.dest, {sourcemaps: true}))
}
// Обработка SASS
const sass = () => {
	return src(path.sass.src, {sourcemaps: true})
	.pipe(plumber({
		errorHandler: notify.onError(error => ({
			title: "Ошибка в SASS",
			message: error.message
		}))
	}))
	.pipe(sassGlob())
	.pipe(sassScss())
	.pipe(webpCss())
	.pipe(autoprefixer())
	.pipe(shorthand())
	.pipe(mediaQueries())
	.pipe(size({title: "Все css ДО сжатия"}))
	.pipe(rename({basename: "style"}))
	.pipe(dest(path.sass.dest, {sourcemaps: true}))
	.pipe(rename({basename: "style", suffix: ".min"}))
	.pipe(csso())
	.pipe(size({title: "Все css ПОСЛЕ сжатия"}))
	.pipe(dest(path.sass.dest, {sourcemaps: true}))
}

// Обработка JS
const js = () => {
	return src(path.js.src, {sourcemaps: true})
	.pipe(plumber({
		errorHandler: notify.onError(error => ({
			title: "Ошибка в JS",
			message: error.message
		}))
	}))
	.pipe(babel())
	.pipe(dest(path.js.dest, {sourcemaps: true}))
	.pipe(concat("app.min.js"))
	.pipe(size({title: "Все JS ДО сжатия"}))
	.pipe(uglify())
	.pipe(size({title: "Все JS ПОСЛЕ сжатия"}))
	.pipe(dest(path.js.dest, {sourcemaps: true}));
}

// Обработка Изображений
const img = () => {
	return src(path.img.src)
	.pipe(plumber({
		errorHandler: notify.onError(error => ({
			title: "Ошибка в Изображении",
			message: error.message
		}))
	}))
	.pipe(newer(path.img.dest))
	.pipe(webp())
	.pipe(dest(path.img.dest))
	.pipe(src(path.img.src))
	.pipe(newer(path.img.dest))
	.pipe(imagemin({
		verbose: true
	}))
	.pipe(dest(path.img.dest));
} 

// Обработка шрифтов
const font = () => {
	return src(path.font.src)
	.pipe(plumber({
		errorHandler: notify.onError(error => ({
			title: "Ошибка в Шрифтах",
			message: error.message
		}))
	}))
	.pipe(newer(path.font.dest))
	.pipe(fonter({
		formats: ["ttf", "woff", "eot", "svg"]
	}))
	.pipe(dest(path.font.dest))
	.pipe(ttf2woff2())
	.pipe(dest(path.font.dest));
} 


// Наблюдение за файлами
const wather = () => {
	watch(path.html.watch, html).on("all", browserSync.reload);
	watch(path.css.watch, css).on("all", browserSync.reload);
	watch(path.sass.watch, sass).on("all", browserSync.reload);
	watch(path.js.watch, js).on("all", browserSync.reload);
	watch(path.img.watch, img).on("all", browserSync.reload);
	watch(path.font.watch, font).on("all", browserSync.reload);
}

// Удаление директории public
const clear = () => {
	return del(path.root)
}

//Сервер
const server = () => {
	browserSync.init({
		server: {
			baseDir: path.root
		}
	});
}

// Сборка для продакшина
const build = series(
	clear,
	parallel(html, sass, js, img, font), //Если используем sass то меняем с css на sass. Или наоборот.
);

// Разработка
const dev = series(
	build,
	parallel(server, wather)
); 


// Экспорт Задач
exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.sass = sass;
exports.watch = wather;
exports.clear = clear;
exports.font = font;
exports.build = build; 
exports.default = dev; 




