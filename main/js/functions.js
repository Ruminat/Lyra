window.low    = (x)        => Math.floor(x);
window.isSet  = (v)        => (typeof(v) == 'undefined') ? false : true;
window.random = (min, max) => Math.round( Math.random() * (max - min) + min );
//returns true if ctrl is pressed (cmd on Mac)
window.ctrl   = (e)        => e.ctrlKey || e.metaKey;

// connects object and properties
function objProps(obj, arr) {
  var result = obj;
  for (var c = 0, l = arr.length; c < l - 1; c++) {
    result = result[arr[c]];
  }
  return {obj: result, prop: arr[l - 1]};
}
//Returns readable directory
function dirToRight(dir) {
  var newDir = "";
  for (var c = 0; c < dir.length; c++) {
    if (dir.charAt(c) == "\\") {
      newDir += "/";
    } else {
      newDir += dir.charAt(c);
    }
  }

  if (newDir[newDir.length - 1] != '/') {
    newDir += '/';
  }

  return newDir;
}
//Error message
function cryingOutForError(reason) {
  $('.error').css('display', 'flex');
  $('.error .reason').text(reason);
}
//Formats number in 618,228,285 style
function formatNumber(num) {
  var s = num.toString();
  var result = s.substr(s.length - 1, 1), i = 1;
  for (var c = s.length - 2; c >= 0; c--) {
    result += (i % 3 == 0) ? ','+ s[c] : s[c];
    i++;
  }
  result = result.split('').reverse().join('');
  return result;
}
//Parse seconds in format like 6:18
function parseSec(sec) {
  var mins = Math.floor(sec / 60);
  var seconds = Math.round(sec - mins * 60);
  if (mins >= 60) {
    mins = parseSec(mins);
  }
  if (seconds < 10) {
    return mins.toString() +":0"+ seconds.toString();
  } else {
    return mins.toString() +":"+ seconds.toString();
  }
}
//Parse format 2:28 to seconds
function parseTime(time) {
  var parts = time.split(':');
  var mult  = 1;
  var sec   = 0;
  for (var c = parts.length - 1; c >= 0; c--) {
    sec  += parseInt(parts[c]) * mult;
    mult *= 60;
  }
  return sec;
}

//Sort functions
function sortSongs(a) {
  var l = a.length;
  for (var c = 1; c < l; c++) {
    for (var i = 1; i < l; i++) {
      if (compare(a[i].name.toLowerCase(), a[i - 1].name.toLowerCase())) {
        var t = a[i].name;
        a[i].name = a[i - 1].name;
        a[i - 1].name = t;

        var t = a[i].dir;
        a[i].dir = a[i - 1].dir;
        a[i - 1].dir = t;
      }
    }
  }
}
//Compares two strings, returns true if a < b
function compare(a, b) {
  var l = a.length;
  var c = 0;

  while ((c < l) && isSet(b[c])) {
    if (a[c] < b[c]) {
      return true;
    } else if (a[c] > b[c]) {
      return false;
    }

    c++;
  }
  
  if (l < b.length) {
    return true;
  } else {
    return false;
  }
}
function shuffle(arr, pos) {
  for (var c = pos || 0; c < arr.length; c++) {
    var elem = random(pos || 0, arr.length - 1);
    var t = arr[elem];
    arr[elem] = arr[c];
    arr[c] = t; 
  }
}
function delay(time, cb) {
  var that = this;
  
  this.run = cb;
  this.call = function() {
    clearTimeout(that.out);

    that.out = setTimeout(function() {
      cb();
    }, time);
  }
  this.cancel = function() {
    clearTimeout(that.out);
  }
}