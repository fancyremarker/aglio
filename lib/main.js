(function() {
  var fs, highlight, hljs, jade, marked, moment, path, protagonist, root, slug;

  fs = require('fs');

  hljs = require('highlight.js');

  jade = require('jade');

  marked = require('marked');

  moment = require('moment');

  path = require('path');

  protagonist = require('protagonist');

  root = path.dirname(__dirname);

  slug = function(value) {
    return value.toLowerCase().replace(/[ \t\n]/g, '-');
  };

  highlight = function(code, lang) {
    if (lang) {
      if (lang === 'no-highlight') {
        return code;
      } else {
        return hljs.highlight(lang, code).value;
      }
    } else {
      return hljs.highlightAuto(code).value;
    }
  };

  marked.setOptions({
    highlight: highlight,
    smartypants: true
  });

  exports.getTemplates = function(done) {
    return fs.readdir(path.join(root, 'templates'), function(err, files) {
      var f;
      if (err) {
        return done(err);
      }
      return done(null, ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          f = files[_i];
          if (f[0] !== '_') {
            _results.push(f);
          }
        }
        return _results;
      })()).map(function(item) {
        return item.replace(/\.jade$/, '');
      }));
    });
  };

  exports.render = function(input, options, done) {
    return protagonist.parse(input, function(err, res) {
      var key, locals, templatePath, value, _ref;
      if (err) {
        return done(err);
      }
      if (typeof options === 'string' || options instanceof String) {
        options = {
          template: options
        };
      }
      if (options.template == null) {
        options.template = 'default';
      }
      locals = {
        api: res.ast,
        date: moment,
        highlight: highlight,
        markdown: marked,
        slug: slug
      };
      _ref = options.locals || {};
      for (key in _ref) {
        value = _ref[key];
        locals[key] = value;
      }
      if (fs.existsSync(options.template)) {
        templatePath = options.template;
      } else {
        templatePath = path.join(root, 'templates', "" + options.template + ".jade");
      }
      return jade.renderFile(templatePath, locals, function(err, html) {
        if (err) {
          return done(err);
        }
        return done(null, html);
      });
    });
  };

  exports.renderFile = function(inputFile, outputFile, options, done) {
    return fs.readFile(inputFile, {
      encoding: 'utf-8'
    }, function(err, input) {
      if (err) {
        return done(err);
      }
      return exports.render(input, options, function(err, html) {
        if (err) {
          return done(err);
        }
        if (outputFile !== '-') {
          return fs.writeFile(outputFile, html, done);
        } else {
          console.log(html);
          return done();
        }
      });
    });
  };

}).call(this);
