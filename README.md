Peggy
=====

This is a proof of concept for simultaneous upload, processing and download of a file, using node.js streams. The basic premise is that you upload a movie file, it gets processed by FFMpeg and turned into a .mp3 with the movie's audio, and that gets sent back to the user as a .mp3 file. I encourage you to look through the ``server.js`` source code.

Note that this is just a proof of concept at this point; it only allows one user at the same time, and it may hog all the server's CPU/memory/whatever.

In order to use this, you need to have a ffmpeg binary installed with .mp3 support.

Further discussion: https://news.ycombinator.com/item?id=8774022

![Example usage](http://i.imgur.com/0Dcnl3X.png)
