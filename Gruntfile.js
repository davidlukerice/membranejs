module.exports = function(grunt) {

    var banner = '/* <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: [
            'gruntfile.js',
            'src/**/*.js',
            'test/tests/*.js'],
            options: {
                jshintrc: true
            }
        },

        clean: ['tmp'],

        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd:'src',
                    src: ['**/*.js'],
                    dest: 'tmp/javascript/'
                }]
            }
        },

        transpile: {
            main: {
                type: 'amd',
                moduleName: function(path) {
                    return grunt.config.process('MJS/') + path;
                },
                files: [{
                    expand: true,
                    cwd: 'tmp/javascript/',
                    src: ['**/*.js'],
                    dest: 'tmp/transpiled/'
                }]
            }
        },

        concat: {
            options: {
                banner: banner,
                sourceMap: true
            },
            dist: {
                src: ['tmp/transpiled/**/*.js'],
                dest: 'dist/membrane.js'
            }
        },

        uglify: {
            options: {
                banner: banner,
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/membrane.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },

        qunit: {
            files: ['test/**/*.html']
        },

        sloc: {
            source: {
                files: {
                    '.': [
                    'gruntfile.js',
                    'src/**/*.js',
                    'test/tests/*.js',
                    ]
                }
            }
        },

        watch: {
            lint: {
                files: ['<%= jshint.files %>'],
                tasks: ['jshint', 'qunit']
            },
            build: {
                files: ['src/**/*.js'],
                tasks: ['build']
            }
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            watches: {
                tasks: ["watch:lint", "watch:build"]
            }
        },

        bump: {
          options: {
            files: ['package.json', 'bower.json'],
            updateConfigs: [],
            commit: true,
            commitMessage: 'Release v%VERSION%',
            commitFiles: ['package.json', 'bower.json', 'dist/*'],
            createTag: false,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: false,
            gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
          }
        },
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-es6-module-transpiler');
    grunt.loadNpmTasks('grunt-sloc');

    // tasks
    grunt.registerTask('build',
    ['clean', 'copy', 'transpile', 'concat', 'uglify']);
    grunt.registerTask('test', ['jshint', 'build', 'qunit', 'sloc']);
    grunt.registerTask('watchBuild', ['test', 'concurrent:watches']);
    grunt.registerTask('default', ['watchBuild']);
};
