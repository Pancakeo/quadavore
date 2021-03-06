module.exports = function(grunt)
{

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		browserify: {
			client: {
				src: ['client/js/app/init.js'],
				dest: 'build/quadavore.js'
			},
			vendor: {
				src: [],
				dest: 'build/external_libraries.js',
				options: {
					require: ['jquery', 'highcharts', 'wupfindui']
				}
			}
		},
		clean: {
			build: {
				src: ['build']
			}
		},
		copy: {
			android: {
				src: ['release/*'],
				dest: 'build',
				expand: true
			},
			build: {
				cwd: 'client',
				src: ['*.html', 'images/**', 'js/lib/*.js'],
				dest: 'build',
				expand: true
			},
			html: {
				cwd: 'client',
				src: ['html/**/*.html'],
				dest: 'build',
				expand: true
			},
			third_party_images: {
				expand: true,
				src: 'node_modules/*/css/images/**',
				dest: 'build/images/',
				flatten: true,
				filter: 'isFile'
			}
		},
		htmlmin: {
			dev: {
				cwd: 'client',
				src: 'html/**/*.html',
				dest: 'build/',
				expand: true
			},
			prod: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					minifyCSS: true
				},
				cwd: 'client',
				src: 'html/**/*.html',
				dest: 'build/',
				expand: true
			}
		},
		less: {
			dev: {
				options: {
					ieCompat: false
				},
				files: {
					"build/quadavore.css": "client/less/*.less",
					"build/external.css": "node_modules/*/css/*.css"
				}
			},
			prod: {
				options: {
					ieCompat: false,
					compress: true
				},
				files: {
					"build/quadavore.css": "client/less/*.less"
				}
			}
		},
		refupdate: {
			update_index: {
				options: {
					inputFile: "build/index.html",
					regex: /\?r=(random_string)/g,
					random: true
				}
			}
		},
		watch: {
			options: {
				// Use with Chrome's LiveReload extension: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
				livereload: true
			},
			// Note: Doesn't catch changes to public/*.js
			scripts: {
				files: ['client/js/**/*.js', 'shared/*.js'],
				tasks: ['browserify:client']
			},
			static_html: {
				files: ['client/html/**/*.html'],
				tasks: ['copy:html']
			},
			compile_less: {
				files: ['client/less/*.less'],
				tasks: 'less:dev'
			}
		},
		uglify: {
			prod: {
				options: {
					screwIE8: true
				},
				files: {
					'build/quadavore.js': ['build/quadavore.js']
				}
			}
		}

	});

	// Load the plugin that provides the "uglify" task.
	
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-refupdate');

	grunt.registerTask(
		'heh',
		'yeh rye, yeeeeeeeeeeeh rye!',
		['build', 'watch']
	);

	grunt.registerTask(
		'build',
		'Compiles all of the assets and copies the files to the build directory.',
		['clean:build', 'copy:build', 'copy:android', 'copy:third_party_images', 'refupdate', 'less:dev', 'htmlmin:dev', 'browserify']
	);

	grunt.registerTask(
		'release',
		'Compiles all of the assets and copies the files to the build directory.',
		['clean:build', 'copy:build', 'copy:android', 'refupdate', 'less:prod', 'htmlmin:prod', 'browserify', 'uglify']
	);
};
