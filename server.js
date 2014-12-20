var http = require('http');
var url = require('url');
var multiparty = require('multiparty');
var t2map = require('through2-map');
var spawn = require('child_process').spawn;

var stream = null;
var ffmpeg = process.env.FFMPEG_BINARY || 'ffmpeg';

var extractAudio = (ffmpeg + " -i - -codec:a libmp3lame -qscale:a 2 -vn -f mp3 -").split(" ");
console.log("FFMpeg Binary: " + process.env.FFMPEG_BINARY);

var replaceExtension = function(filename, newExt) {
    if(filename.indexOf(".") === -1) {
        return filename + "." + newExt;
    } else {
        return filename.replace(/\.[^.]*$/, "." + newExt);
    }
}

var server = http.createServer(function(req, res) {
    if(url.parse(req.url).pathname == "/upload") {
        stream = req;
        res.writeHead(302, {
            "Location": "/",
        });
        stream.on('end', function() {
            res.end();
        });
    } else if(url.parse(req.url).pathname == "/download") {
        setTimeout(function() {
            if(!stream) {
                setTimeout(arguments.callee, 200);
            } else {
                var form = new multiparty.Form();
                form.on('part', function(part) {
                    if(part.filename !== 'null') {
                        outputFilename = replaceExtension(part.filename, 'mp3');
                        res.writeHead(200, {
                            'Content-Type': 'binary/octet-stream',
                            'Content-Disposition': 'attachment; filename="' + outputFilename + '"',
                            'Content-Transfer-Encoding': 'binary',
                            'Transfer-Encoding': 'chunked',
                        });
                        var ffmpeg = spawn(extractAudio[0], extractAudio.slice(1));
                        ffmpeg.stderr.pipe(process.stdout, { end: false });
                        part.pipe(ffmpeg.stdin);
                        ffmpeg.stdout.pipe(res);

                        part.on('error', function(err) { console.log(err); });
                        ffmpeg.stdout.on('error', function(err) { console.log(err); });
                    } else {
                        part.resume();
                    }
                });
                stream.on('error', function(err) { console.log(err); });
                form.on('error', function(err) { console.log(err); });
                form.parse(stream);
            }
        }, 50);
    } else {
        res.end([
            "<!DOCTYPE html><head></head><body>",
            "<form action='/upload' method='post' enctype='multipart/form-data'>",
                "<input type='file' name='up' />",
                "<input type='submit' value='OK' onclick='window.open(\"/download\", \"_blank\")'/>",
            "</form></body>",
        ].join("\n"));
    }
});

server.listen(process.env.PORT || 8000);
