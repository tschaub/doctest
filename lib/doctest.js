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
            print("Example " + count + ":\n" + block);
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
