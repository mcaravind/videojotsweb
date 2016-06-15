/*
/!**
 * Created by aravindmc on 5/31/2016.
 *!/

var tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var playerControl;
function onYouTubeIframeAPIReady() {
    var videoID = window.currVideoID;
    playerControl = new YT.Player("videoPlayer", {
        height: "390",
        width: "640",
        videoId: videoID,
        playerVars: {autostart: 0, autoplay: 0, controls: 1},
        events: {onReady: onPlayerReady, onStateChange: onPlayerStateChange}
    })
}
window.onPlayerReady = function() {
    var elems = document.getElementsByClassName("clickable");
    for (var i = 0; i < elems.length; i++) {
        elems[i].addEventListener("click", (function (i) {
            return function () {
                playVideoAt(this);
                document.getElementById("control").scrollIntoView();
            }
        })(i), false);
    }
    if(window.location.hash){
        var location = window.location.hash;
        document.getElementById("control").scrollIntoView();
        playerControl.seekTo(parseFloat(location.slice(1)));
    }
    window.setTimeout(highlight,1000);
}
function highlight(){
    var currTime = playerControl.getCurrentTime();
    var maxPoint = 0;
    var maxElement = null;
    $(".clickable").each(function(index,element){
        $(element).css("background-color","white");
        var elpos = parseFloat(element.id);
        if(elpos > maxPoint && elpos < currTime){
            maxPoint = elpos;
            maxElement = element;
        }
    });
    $(maxElement).css("background-color","yellow");
    window.setTimeout(highlight, 1000);
}
var done = !1;
function onPlayerStateChange(a) {
}
function playVideo() {
    playerControl.playVideo()
}
function pauseVideo() {
    playerControl.pauseVideo()
}
function stopVideo() {
    playerControl.stopVideo()
}
function loadVideoById(a) {
    playerControl.loadVideoById(a, 0, "large")
}
function playVideoAt(item) {
    var pos = item.id;
    playerControl.seekTo(parseFloat(pos));
    window.location.hash = '#'+pos;
    var innerText = item.innerText;
    try {
        ga("send", "event", "Google Chrome Developers", "JotClick", innerText);
    } catch (ex) {
    }
}
;*/
var tag = document.createElement('script');
tag.src = "http://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var videoHeight = 315;
var videoWidth = 560;
var playerControl;
window.onYouTubePlayerAPIReady = function () {
    var id = $("#videoid").html();
    playerControl = new YT.Player('videoPlayer', {
        height: videoHeight,
        width: videoWidth,
        videoId: id,
        events: {onReady: onPlayerReady}
    });
    $('#resume').click(function() {
        playerControl.playVideo();
    });
    $('#pause').click(function() {
        playerControl.pauseVideo();
    });
}

window.onPlayerReady = function() {
    var elems = document.getElementsByClassName("clickable");
    for (var i = 0; i < elems.length; i++) {
        elems[i].addEventListener("click", (function (i) {
            return function () {
                playVideoAt(this);
                document.getElementById("control").scrollIntoView();
            }
        })(i), false);
    }
    if(window.location.hash){
        var location = window.location.hash;
        document.getElementById("control").scrollIntoView();
        playerControl.seekTo(parseFloat(location.slice(1)));
    }
    window.setTimeout(highlight,1000);
}

$(function(){
    $("#playerBox").height(videoHeight);
    $("#playerBox").width(videoWidth);
    $("#playerBox").resizable({
        handles: {
            'se': '#segrip'
        }
    });
    $("#playerBox").resize(function () {
        $("#videoPlayer").height($("#playerBox").height());
        $("#videoPlayer").width($("#playerBox").width());
    });
    $("#shareRoundIcons").jsSocials({
        showLabel: false,
        showCount: false,
        shares: ["email", "twitter", "facebook", "googleplus", "linkedin", "pinterest", "stumbleupon", "whatsapp"]
    });
});

function highlight(){
    var currTime = playerControl.getCurrentTime();
    var maxPoint = 0;
    var maxElement = null;
    $(".clickable").each(function(index,element){
        $(element).css("background-color","white");
        var elpos = parseFloat(element.id);
        if(elpos > maxPoint && elpos < currTime){
            maxPoint = elpos;
            maxElement = element;
        }
    });
    $(maxElement).css("background-color","yellow");
    window.setTimeout(highlight, 1000);
}

function playVideoAt(item) {
    var pos = item.id;
    var innerText = item.innerText;
    window.location.hash = '#'+pos;
    try{
        $("#shareRoundIcons").jsSocials("option","text",innerText);
        $("#shareRoundIcons").jsSocials("option","url",window.location.href);
    }
    catch(ex){}
    var category = $(".category").first().html();
    var seconds = Math.floor(parseFloat(pos));
    var minutes = Math.floor(seconds/60);
    var time = "#t="+minutes+"m"+(seconds - (minutes * 60))+"s";
    var aLink = "https://www.youtube.com/watch?v="+$("#videoid").html()+time;
    var aHref = "<a href='"+aLink+"'>"+innerText+"</a>";
    try{
        //iOS devices don't execute this
        playerControl.seekTo(parseFloat(pos));
    }
    catch(ex){}
    $("#linkText").html(aHref);
    try {
        ga("send", "event", category, "JotClick", innerText);
    } catch (ex) {
    }
}