var file = require("file");
var doctest = global.doctest;

var commentPattern = /^\s*\/\*\**([\S\s]*?)\*+\//mg;
var extractComments = function(source) {
    return Array.prototype.slice.apply(
        source.match(commentPattern)
    );
};

var blockStart = /^(\s*\**\s*)js>/;
var extractBlocks = function(text) {
    var blocks = [];
    var buffer = [];
    var inBlock = false;
    var blank = false;
    var indent = 0;
    var match, sub;
    text.split("\n").forEach(function(line) {
        match = blockStart.exec(line);
        if (!inBlock) {
            if (match) {
                inBlock = true;
                indent = match[1].length;
                buffer = [line.substring(indent)];
            }
        } else {
            sub = line.substring(indent);
            if (sub.match(/^\s*$/)) {
                blank = true;
                buffer.push(sub);
            } else {
                if (blank) {
                    blank = false;
                    blocks.push(buffer.join("\n"));
                    if (sub.indexOf("js> ") === 0) {
                        buffer = [sub];
                    } else {
                        inBlock = false;                        
                    }
                } else {
                    buffer.push(sub);
                }
            }
        }
    });
    if (inBlock) {
        blocks.push(buffer.join("\n"));
    }
    return blocks;
};

var run = function(blocks, options) {
    options = options || {};
    var count = 0,
        results = {passed: 0, failed: 0},
        details = [];

    blocks.forEach(function(block) {
        ++count;
        if (options.verbose) {
            var indented = block.split("\n").map(function(line) {
                return "    " + line;
            }).join("\n");
            print("Example " + count + ":\n\n" + indented);
        }
        try {
            doctest(block);
            ++results.passed;
            details.push({block: block, passed: true});
        } catch (err) {
            ++results.failed;
            details.push({block: block, passed: false, error: err});
            print(err.message.split("\n").slice(0, -1).join("\n") + "\n");
        }
    });
    if (options.verbose) {
        print(count + " tests: " + results.passed + " passed and " + results.failed + " failed.");
    }
    
};

exports.testfile = function(path, options) {
    var source = file.read(path);
    run(extractBlocks(source), options);
};

exports.testmod = function(options) {
    var source = file.read(require.main),
        mod = require(require.main);
    for (var name in mod) {
        if (!(name in global)) {
            global[name] = mod[name];            
        }
    }
    var blocks = [];
    extractComments(source).forEach(function(comment) {
        blocks = blocks.concat(extractBlocks(comment));
    });
    run(blocks, options);
}


exports.main = function(args) {

    var parser = new (require("args").Parser)();
    parser.usage("target");
    parser.help("Runs all example blocks found in the target (directory or file).");
    parser.option("-v", "--verbose", "verbose")
        .help("prints output for all tests (instead of just failures)")
        .set(true);
    parser.helpful();

    var options = parser.parse(args);    
    if (options.args.length !== 1) {
        parser.printHelp(options);
        parser.exit(options);
    }
    
    var targets = file.listTree(options.args[0]).filter(function(p) {
        return file.isFile(p);
    });
    
    targets.forEach(function(target) {
        if (options.verbose) {
            print("\n" + target);
            for(var line="", i=0, len=target.length; i<len; line+="=", ++i) {}
            print(line + "\n");
        }
        exports.testfile(target, {verbose: options.verbose});
    });
    
};

if (module.id === require.main) {
    exports.main(system.args);
}