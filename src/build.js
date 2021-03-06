// Get JSON from source file
var source = require('./simple-icons.json');

// Loop through icons
for (var i = 0; i < source.icons.length; i++) {

    var hex = source.icons[i].hex;

    // Add red, green and blue values to the JSON object
    var red   = parseInt(hex.substr(0,2), 16) / 255;
    var green = parseInt(hex.substr(2,2), 16) / 255;
    var blue  = parseInt(hex.substr(4,2), 16) / 255;

    // Add hue to the JSON object
    var max = Math.max(red, green, blue);
    var min = Math.min(red, green, blue);
    var delta = max - min;
    source.icons[i].luminance = 100 * (max + min) / 2;
    if (delta === 0) {
        var hue = 0;
        source.icons[i].saturation = 0;
    } else {
        if (source.icons[i].luminance < 50) {
            source.icons[i].saturation = 100 * (max - min) / (max + min);
        } else {
            source.icons[i].saturation = 100 * (max - min) / (2 - max - min);
        }
        if (max === red) {
            var hue = ((green - blue) / delta) * 60;
            if (hue < 0) {
                hue += 360;
            }
        } else if (max === green) {
            var hue = (((blue - red) / delta) + 2) * 60;
        } else {
            var hue = (((red - green) / delta) + 4) * 60;
        }
    }
    source.icons[i].hue = hue;
}

// Sort icons by hue
for (var i = 0; i < source.icons.length; i++) {
    source.icons[i].hue += 90;
    source.icons[i].hue = source.icons[i].hue % 360;
}
source.icons.sort(function(a, b) {
    return parseFloat(a.hue) - parseFloat(b.hue);
});
var tmp = [];
for (var i = 0; i < source.icons.length; i++) {
    if (source.icons[i].luminance < 15) {
        tmp.push(source.icons[i]);
        source.icons.splice(i,1);
        i--;
    }
}
for (var i = 0; i < source.icons.length; i++) {
    if (source.icons[i].saturation < 25) {
        tmp.push(source.icons[i]);
        source.icons.splice(i,1);
        i--;
    }
}
tmp.sort(function(a, b) {
    return parseFloat(b.luminance) - parseFloat(a.luminance);
});
for (var i = 0; i < tmp.length; i++) {
    source.icons.push(tmp[i]);
}

// Read header and footer content into variables
var fs = require('fs');
function readFile(path, callback) {
    try {
        var filename = require.resolve(path);
        fs.readFile(filename, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}
var fs = require('fs');
var header = fs.readFileSync('./header.html', 'utf8');
var footer = fs.readFileSync('./footer.html', 'utf8');

// Build content
var main = "            <ul class=\"tiles\">";

for (var i = 0; i < source.icons.length; i++) {
    var fileName = source.icons[i].title.toLowerCase();
    fileName = fileName.replace(/[!|’|.| ]/g, ''); // Replace bang, apostrophe, period and space with nothing.
    fileName = fileName.replace(/[+]/, 'plus'); // Replace the plus symbol with “plus”.
    filePath = "../icons/" + fileName + ".svg";
    var fs = require('fs');
    var svg = fs.readFileSync(filePath, 'utf8');
    main += "\n            <li class=\"tiles__item\" data-search=\"" + source.icons[i].title.toLowerCase() + " " + fileName.toLowerCase() + " " + source.icons[i].hex.toLowerCase() + "\" style=\"background-color:#" + source.icons[i].hex + "\"><a href=\"https://simpleicons.org/icons/" + fileName + ".svg\">" + svg + "</a><span class=\"tile-name\">" + source.icons[i].title + "</span>" + "<br><span class=\"hex\">#" + source.icons[i].hex + "</span></li>";
}

// Put all content together and export to index.html
var htmlOutput = header + main + footer;
fs.writeFile("../index.html", htmlOutput, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The index.html file was saved!");
});

// Also output to 404.html
fs.writeFile("../404.html", htmlOutput, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The 404.html file was saved!");
});