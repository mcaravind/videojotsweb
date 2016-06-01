/**
 * Created by aravindmc on 5/31/2016.
 */
$(function () {
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
    function onPlayerReady(a) {
        var elems = document.getElementsByClassName("clickable");
        for (var i = 0; i < elems.length; i++) {
            elems[i].addEventListener("click", (function (i) {
                return function () {
                    playVideoAt(this);
                    document.getElementById("control").scrollIntoView();
                }
            })(i), false);
        }
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
        playerControl.seekTo(parseFloat(pos))
        var innerText = item.innerText;
        ga('send','event','Category','Click',innerText,Math.floor(parseFloat(pos)));
    }
    ;
});