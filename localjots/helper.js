/**
 * Created by aravindmc on 5/4/2016.
 */
$(function (){
    window.player = document.getElementById('videoPlayer');
    (function localFileVideoPlayer() {
        'use strict'
        var URL = window.URL || window.webkitURL
        var displayMessage = function (message, isError) {
            var element = document.querySelector('#message')
            element.innerHTML = message
            element.className = isError ? 'error' : 'info'
        }
        var jumpToPos = function(event){
            var videoNode = document.querySelector('video')
            videoNode.currentTime = 300
        }
        var playSelectedFile = function (event) {
            var file = this.files[0]
            var type = file.type
            //var player = document.querySelector('video')

            var canPlay = player.canPlayType(type)
            if (canPlay === '') canPlay = 'no'
            var message = 'Can play type "' + type + '": ' + canPlay
            var isError = canPlay === 'no'
            displayMessage(message, isError)

            if (isError) {
                return
            }

            var fileURL = URL.createObjectURL(file)
            player.src = fileURL
        }
        var inputNode = document.querySelector('#btnFileSelect');
        inputNode.addEventListener('change', playSelectedFile, false);



        /*Object.prototype.seekTo = function(pos){
         video.currentTime = pos;
         }

         Object.prototype.playVideo = function(pos){
         video.play();
         }

         Object.prototype.pauseVideo = function(pos){
         video.pause();
         }

         Object.prototype.getCurrentTime = function(){
         return video.currentTime;
         }

         Object.prototype.getDuration = function(){
         return video.duration;
         }*/

    })()

    var elems = document.getElementsByClassName("clickable");
    for (var i = 0; i < elems.length; i++) {
        elems[i].addEventListener("click",(function(i) {return function() {document.getElementById("videoPlayer").currentTime = this.id; document.getElementById("videoPlayer").scrollIntoView();}})(i),false);
    }
});