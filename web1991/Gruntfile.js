module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            client: {
                src: ['client/js/app/init.js'],
                dest: 'build/quadavore.js'
            }
        },
        clean: {
            build: {
                src: ['build']
            }
        },
        copy: {
            build: {
                cwd: 'client',
                src: ['images/**', 'js/lib/*.js', 'index.html'],
                dest: 'build',
                expand: true
            },
            html: {
                cwd: 'client',
                src: ['html/**'],
                dest: 'build',
                expand: true
            }
        },
        jshint: {
            options: {
                eqnull: true,
                esversion: 6
            },
            all: ['Gruntfile.js', 'client/js/**/*.js']
        },
        htmlmin: {
            dev: {
                cwd: 'client',
                src: 'html/*.html',
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
                src: 'html/*.html',
                dest: 'build/',
                expand: true
            }
        },
        sass: {
            dev: {
                options: {
                    style: 'nested'
                },
                files: {
                    "build/quadavore.css": "client/scss/*.scss"
                }
            },
            prod: {
                options: {
                    style: 'compressed'
                },
                files: {
                    "build/quadavore.css": "client/scss/*.scss"
                }
            }
        },
        refupdate: {
            update_index: {
                options: {
                    inputFile: "client/index.html",
                    regex: /\?r=([0-9]+)/g
                }
            }
        },
        watch: {
            // Note: Doesn't catch changes to public/*.js
            scripts: {
                files: ['client/js/**/*.js'],
                tasks: ['browserify']
            },
            static_html: {
                files: ['client/html/**/*.html'],
                tasks: ['copy:html']
            },
            compile_sass: {
                files: ['client/scss/*.scss'],
                tasks: 'sass:dev'
            }
        },
        uglify: {
            prod: {
                files: {
                    'build/quadavore.js': ['build/quadavore.js']
                }
            }
        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
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
        ['clean', 'refupdate', 'jshint', 'copy:build', 'sass:dev', 'htmlmin:dev', 'browserify:client']
    );

    grunt.registerTask(
        'release',
        'Compiles all of the assets and copies the files to the build directory.',
        ['clean', 'jshint', 'copy:build', 'sass:prod', 'htmlmin:prod', 'browserify:client', 'uglify']
    );
};