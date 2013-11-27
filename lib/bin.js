(function() {
  var aglio, fs, http, parser;

  aglio = require('./main');

  fs = require('fs');

  http = require('http');

  parser = require('optimist').usage('Usage: $0 [-l -t template] -i infile [-o outfile -s]').options('i', {
    alias: 'input',
    describe: 'Input file'
  }).options('o', {
    alias: 'output',
    describe: 'Output file'
  }).options('t', {
    alias: 'template',
    describe: 'Template name or file',
    "default": 'default'
  }).options('s', {
    alias: 'server',
    describe: 'Start a local preview server'
  }).options('p', {
    alias: 'port',
    describe: 'Port for local preview server',
    "default": 3000
  }).options('l', {
    alias: 'list',
    describe: 'List templates'
  });

  exports.run = function(argv, done) {
    if (argv == null) {
      argv = parser.argv;
    }
    if (done == null) {
      done = function() {};
    }
    if (argv.l) {
      return aglio.getTemplates(function(err, names) {
        if (err) {
          console.log(err);
          return done(err);
        }
        console.log('Templates:\n' + names.join('\n'));
        return done();
      });
    } else if (argv.s) {
      if (!argv.i) {
        parser.showHelp();
        return done('Invalid arguments');
      }
      http.createServer(function(req, res) {
        var blueprint;
        if (req.url !== '/') {
          return res.end();
        }
        console.log("Rendering " + argv.i);
        blueprint = fs.readFileSync(argv.i, 'utf-8');
        return aglio.render(blueprint, argv.t, function(err, html) {
          res.writeHead(200, {
            'Content-Type': 'text/html'
          });
          return res.end(err || html);
        });
      }).listen(argv.p, '127.0.0.1');
      console.log("Server started on http://localhost:" + argv.p + "/");
      return done();
    } else {
      if (!argv.i || !argv.o) {
        parser.showHelp();
        return done('Invalid arguments');
      }
      return aglio.renderFile(argv.i, argv.o, argv.t, function(err) {
        if (err) {
          console.log(err);
          return done(err);
        }
        return done();
      });
    }
  };

}).call(this);
