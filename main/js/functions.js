function isSet(v) {
  return (typeof(v) == 'undefined') ? false : true;
}
function random(min, max) {
  return Math.round( Math.random() * (max - min) + min );
}
//Returns readable directory
function dirToRight(dir) {
  var newDir = "";
  for (var c = 0; c < dir.length; c++) {
    if (dir.charAt(c) == "\\"){
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
//Parse seconds in format like 6:18
function parseSec(sec){
  var mins = Math.floor(sec / 60);
  var seconds = Math.floor(sec - mins * 60);
  if (seconds < 10){
    return mins.toString() +":0"+ seconds.toString();
  } else {
    return mins.toString() +":"+ seconds.toString();
  }
}
//Parse format 2:28 to seconds
function parseTime(time) {
  return parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
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
  for (var c = pos || 0; c < arr.length; c++){
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