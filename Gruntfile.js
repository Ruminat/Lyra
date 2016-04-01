module.exports = function(grunt) {

	grunt.initConfig( {
		pkg: grunt.file.readJSON('package.json'),

		ejs: {
			all: {
				src: ['main/views/*.ejs'],
				dest: '',
				expand: true,
				ext: '.html'
			}
		},

		watch: {
			ejs: {
				files: ['main/views/*.ejs', 'main/views/templates/*.ejs', 'main/views/svg/*.ejs'],
				tasks: 'ejs'
			}
		}
	} );

	grunt.loadNpmTasks('grunt-ejs');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['ejs', 'watch']);

}