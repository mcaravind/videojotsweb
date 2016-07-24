var S_PAUSE = '/p/';
var S_RESUME = '/r/';
var S_NEWLINE = '/n/';
var S_POP = '//';
var isClear = true;

var CMDTEXT={};
CMDTEXT[S_PAUSE] = 'Pause';
CMDTEXT[S_RESUME] = 'Resume';
CMDTEXT[S_NEWLINE] = 'Next line';
CMDTEXT[S_POP] = 'Close last open tag';

var COMMAND= {
    PAUSE: "pause",
    RESUME: "resume",
    NEWLINE: "newline",
    POP:"pop",
    NONE:"none"
}

$(function () {
    //initialize globals
    window.tagArray = [];
    window.textSource = '';
    window.currVideoID = 'unknown';
    window.outputFormat = 'bounded';
    window.textAreaBeingEdited = null;
    $.ajax({
        url: 'http://www.videojots.com/create/wordcount.json',
        dataType: "jsonp",
        jsonpCallback: 'callback',
        success: function(data) {
            console.log(data);
            loadWordCount(data);
        }
    });
    //initialize controls
    $("#btnInsertLineBreak").prop('disabled', true);
    $("#saveHtml").prop('disabled',true);
    //create event handlers
    $('#selectClasses').change(function () {
        var predefined = ['b', 'i', 's', 'u'];
        var getSelection = get_selection(window.textAreaBeingEdited).text;
        var selectedVal = $(this).find(':selected').val().toString();
        var replaceStr = '';
        if ($.inArray(selectedVal,predefined)>-1) {
            replaceStr = '<' + selectedVal + '>' + getSelection + '</' + selectedVal + '>';
        } else {
            replaceStr = '<span class="' + selectedVal + '">' + getSelection + '</span>';
        }
        replace_selection(window.textAreaBeingEdited, replaceStr);
    });
    $('#txtSource1').bind('input propertychange', function () {
        window.textSource = $("#txtSource1").val();
        updateOutput();
    });
    $('#txtCSS').bind('input propertychange', function () {
        window.textSource = $("#txtSource1").val();
        updateOutput();
    });
    $('#txtPageName').bind('input propertychange', function () {
        toggleSavePageButtonState();
    });
    $('#txtKey').change(function () {
        toggleSavePageButtonState();
    });
    $('#txtReplace').bind('input propertychange', function () {
        window.textSource = $("#txtSource1").val();
        updateOutput();
    });
    $('#txtCategoryName').bind('input propertychange', function () {
        window.textSource = $("#txtSource1").val();
        updateOutput();
    });
    $("#divFormatterText").click(function(){
        highlightCurrentSelection();
    });
    $("#playerBox").resizable({
        handles: {
            'se': '#segrip'
        }
    });
    $("#playerBox").resize(function () {
        $("#player").height($("#playerBox").height());
        $("#player").width($("#playerBox").width());
    });
    $("#slider").slider();
    $("#saveLink").attr("href", "data:text/plain;charset=utf-8," + $("#txtSource1").val()).attr("download", window.currVideoID + ".txt");
    $('#selector button').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        var selectedName = $(this).attr('name');
        window.outputFormat = selectedName;
        updateOutput();
    });
    document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);

});

function loadWordCount(data){
    window.json = data;
}

function toggleSavePageButtonState(){
    window.pageName = $("#txtPageName").val();
    var key = $("#txtKey").val();
    if(window.pageName.trim()==='' || key.trim()===''){
        $("#saveHtml").prop('disabled',true);
    }
    else{
        $("#saveHtml").prop('disabled',false);
    }
    updateOutput();
}

function highlightCurrentSelection(){
    var elem = window.formatSelection;
    $(elem).attr("tabindex","-1");
    $(elem).focus();
    $(elem).css("background-color","yellow");
    setTimeout(function(){
        $(elem).css("background-color","white");
        $(elem).removeAttr("tabindex");
    },2000);
}

function countWords(s) {
    s = s.replace(/(^\s*)|(\s*$)/gi,"");//exclude  start and end white-space
    s = s.replace(/[ ]{2,}/gi," ");//2 or more space to 1
    s = s.replace(/\n /,"\n"); // exclude newline with a start spacing
    return s.split(' ').length;
}

function saveChanges(){
    var elem = window.formatSelection;
    var pos = Math.floor(parseFloat(elem.id)*1000);
    var fullJson = JSON.parse($("#txtSource1").val());
    fullJson.forEach(function(item){
        if (item.pos === pos){
            item.text = $("#divFormatterText").html();
        }
    });
    highlightCurrentSelection();
    $("#txtSource1").val(JSON.stringify(fullJson));
    updateOutput();
}

function insertLineBreakBefore(){
    var str = $("#divFormatterText").html();
    str = '/n/'+str;
    $("#divFormatterText").html(str);
}

function insertLineBreakAfter(){
    var str = $("#divFormatterText").html();
    str = str+'/n/';
    $("#divFormatterText").html(str);
}

function removeLineBreakBefore(){
    var str = $("#divFormatterText").html();
    str = str.trim();
    if(str.startsWith('/n/')){
        str = str.replace('/n/','');
    }
    $("#divFormatterText").html(str);
}

function removeLineBreakAfter(){
    var str = $("#divFormatterText").html();
    str = str.trim();
    if(str.endsWith('/n/')){
        str = str.slice(0,-3);
    }
    $("#divFormatterText").html(str);
}

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        loadFile(contents);
    };
    reader.readAsText(file);
}

function loadFile(contents) {
    var json = null;
    var source = '';
    var style = '';
    var category = '';
    var title = '';
    var videoid = null;
    var pageName = null;
    try {
        json = JSON.parse(contents);
        source = json.text;
        style = json.css;
        videoid = json.videoid;
        title = json.title;
        category = json.category;
        pageName = json.pageName;
    } catch (e) {
        //when using old format
        //get videoid from filename
        source = contents;
        var fullPath = document.getElementById('file-input').value;
        if (fullPath) {
            videoid = fullPath.split(/(\\|\/)/g).pop();
            videoid = videoid.substring(0, videoid.lastIndexOf('.'));
        }
    }
    loadVideoInPlayer(videoid);
    countWordsFromJSON(source);
    $("#txtSource1").val(source);
    $("#txtCSS").val(style);
    $("#divTitle").html(title);
    $("#txtCategoryName").val(category);
    $("#txtPageName").val(pageName);
    updateOutput();
}

function countWordsFromJSON(json){

    window.totalCount = 0;
    jsonText = JSON.parse(json);
    jsonText.forEach(function(item){
        window.totalCount += countWords(item.text);
    });
}

function insertLineBreak() {
    var taId = window.textAreaBeingEdited;
    var caretPos = document.getElementById(taId).selectionStart;
    var taElem = $('#' + taId);
    var textAreaTxt = taElem.val();
    var textToInsert = '/n/';
    var newVal = textAreaTxt.substring(0, caretPos) + textToInsert + textAreaTxt.substring(caretPos);
    $(taElem).val(newVal);
}

function updateSentence(pos, newValue, newPos) {
    var sourceText = window.textSource;
    var json = JSON.parse(window.textSource);
    findAndRemove(json,'pos',+pos);
    var lastObj = {};
    lastObj.pos = newPos;
    lastObj.text = newValue;
    json.push(lastObj);
    $("#txtSource1").val(JSON.stringify(json));
    sortJotsByPosition();
    updateOutput();
}

function deleteSentence(pos) {
    if (confirm('Confirm delete?')) {
        var json = JSON.parse(window.textSource);
        findAndRemove(json,'pos',+pos);
        window.textSource = JSON.stringify(json);
        $("#txtSource1").val(window.textSource);
        updateOutput();
        renderSource();
    }
}

function findAndRemove(array, property, value) {
    array.forEach(function(result, index) {
        if(result[property] === value) {
            //Remove from array
            array.splice(index, 1);
        }
    });
}

function getVideoIDFromURL(url) {
    return url.split('v=')[1].split('&')[0];
}

function loadVideo(e) {
    if (e.keyCode === 13) {
        loadVideoURL();
        return false;
    }
}

function loadVideoURL() {
    var tb = document.getElementById("tbURL");
    var videoid = tb.value.split('v=')[1].split('&')[0];
    loadVideoInPlayer(videoid);
    clearPage();
}

function updateCategory(){
    $("#txtCategoryName").val($("#selectCategory").val());
    updateOutput();
}

function loadVideoInPlayer(videoid) {
    player.loadVideoById(videoid);
    window.currVideoID = videoid;
}

function updateVideoData(){
    $("#divTitle").html(player.getVideoData().title);
    var key=$("#txtKey").val();
    var url = 'https://www.googleapis.com/youtube/v3/videos?id='+currVideoID+'&key='+key+'&part=snippet,contentDetails,statistics,status';
    $.getJSON(url,function(data){
        updateOutputForIndexPage(data);
    });
}

function clearPage() {
    $("#pnlNotes").html('');
    $("#txtSource1").text('');
    $("#txtSource1").text('');
    $("#tbNotes").html('');
    $("#txtSource1").val('');
    $("#txtSource1").val('');
    $("#txtCSS").val('');
    renderSourceData();
    isClear = true;
}

function convertSourceToOutput(sourceText, includeVideo, divHeight, includeEditable, forSave) {
    var playerHTML = '';
    var videoPlayerHTML = '';
    var videoID = window.currVideoID;
    if (includeVideo) {
        var playerID = videoID.replace(/-/g, "");
        var category = $("#txtCategory").val();
        var scriptHTML = '<br/><div id="control"><br/><div id="' + videoID + '"></div></div><script>var tag=document.createElement("script");tag.src="https://www.youtube.com/iframe_api";var firstScriptTag=document.getElementsByTagName("script")[0];firstScriptTag.parentNode.insertBefore(tag,firstScriptTag);var player' + playerID + ';function onYouTubeIframeAPIReady(){player' + playerID + '=new YT.Player("' + videoID + '",{height:"390",width:"640",videoId:"' + videoID + '",playerVars:{autostart:0,autoplay:0,controls:1},events:{onReady:onPlayerReady,onStateChange:onPlayerStateChange}})}function onPlayerReady(a){var elems = document.getElementsByClassName("clickable");for (var i = 0; i < elems.length; i++) {elems[i].addEventListener("click",(function(i) {return function() {playVideoAt(this);document.getElementById("control").scrollIntoView();}})(i),false);}}var done=!1;function onPlayerStateChange(a){}function playVideo(){player' + playerID + '.playVideo()}function pauseVideo(){player'+playerID+'.pauseVideo()}function stopVideo(){player'+playerID+'.stopVideo()}function loadVideoById(a){player'+playerID+'.loadVideoById(a,0,"large")}function playVideoAt(item){var pos = item.id;player'+playerID+'.seekTo(parseFloat(pos));var innerText = item.innerText;try{ga("send","event","'+category+'","JotClick",innerText);}catch(ex){}};</script>';
        var htmlInfo = '<br/><br/>';
        videoPlayerHTML = '<br/><span class="label label-danger">Click on text below to jump to the corresponding location in the video (except iOS)</span><br/><div id="control"><div id="playerBox"><div class="ui-resizable-handle ui-resizable-se" id="segrip"></div><div id="videoPlayer"></div></div><div class="'+$("#txtCategoryName").val()+'" id="ad'+window.currVideoID+'"></div></div>'+htmlInfo;
        playerHTML = scriptHTML+htmlInfo;
    }
    if(sourceText === ''){
        sourceText = '{}';
    }
    var allText = sourceText;
    var lines = JSON.parse(allText);
    var html = '';
    var sCategoryName = $("#txtCategoryName").val();
    var currTitle = $("#divTitle").html();
    var sTitle = htmlEncode(currTitle);
    var htmlPre = '<div style="margin: 0 auto;width:70%" ><div id="videoid" style="visibility: hidden">'+videoID+'</div><br/><ol class="breadcrumb"><li><a href="../">Home</a></li><li><a href="./" class="category">'+sCategoryName+'</a></li><li class="active">'+sTitle+'</li></ol><div style=""><span class="videojots">';
    var startScopedStyle = '<style scoped>';
    var clickableStyle = '.clickable{cursor:pointer;cursor:hand;}.clickable:hover{background:yellow;} ';
    var style = clickableStyle+ $("#txtCSS").val();
    var endScopedStyle = '</style>';
    var footer = '<br/><span style="font-size:xx-small;">Video outline created using <a href="http://www.videojots.com">VideoJots</a>. Click and drag lower right corner to resize video. On <a href="../ios_device.html">iOS devices</a> you cannot jump to video location by clicking on the outline. </span><br/>';
    var htmlPost = '</span></div></div>';
    var htmlFromSource = '';
    //$.each(lines, function (index, value) {
    lines.forEach(function(item){
        /*if (value.trim() !== '') {
        }*/
        var location = parseFloat(item.pos);//parseFloat(value.split("|#|")[0]);
        var lineText = item.text;//value.split("|#|")[1].split("|}")[0];
        var htmlRaw = lineText;
        if (lineText === '/n/') {
            htmlRaw = '<br/>';
        }
        else if (lineText.charAt(0) === '/' && lineText.charAt(lineText.length - 1) === '/' && lineText.indexOf(' ') === -1) {
            //starts and ends with /, no space means the whole line represents a tag
            var insideText = lineText.substring(1, lineText.length - 1);
            var tagName = insideText;
            var tagValue = '';
            if (insideText.indexOf('/') > -1) {
                tagName = insideText.split('/')[0];
                tagValue = insideText.split('/')[1];
                htmlRaw = '<span class="' + tagName + '">' + tagValue + '</span>';
            } else {
                htmlRaw = '<span class="' + tagName + '">';
            }
        } else {
            var boldRegexp = /\/b\/([^\/]*)\//g;
            lineText = lineText.replace(boldRegexp, '<b>$1</b>');
            var italicRegexp = /\/i\/([^\/]*)\//g;
            lineText = lineText.replace(italicRegexp, '<i>$1</i>');
            var underlineRegexp = /\/u\/([^\/]*)\//g;
            lineText = lineText.replace(underlineRegexp, '<ins>$1</ins>');
            var strikethroughRegexp = /\/s\/([^\/]*)\//g;
            lineText = lineText.replace(strikethroughRegexp, '<del>$1</del>');
            var allCssRules = getRulesFromText($("#txtCSS").val());
            for (var x = 0; x < allCssRules.length; x++) {
                var className = allCssRules[x].selectorText;
                var classActualName = className.substring(1);
                var re = new RegExp("\/" + classActualName + "\/([^\/]*)\/", "g");
                lineText = lineText.replace(re, '<span class="' + classActualName + '">$1</span>');
            }
            htmlRaw = lineText;
        }
        htmlRaw = replaceAll(htmlRaw, '/n/', '<br/>');
        if(includeEditable===1){
            var prefix = '<span class="clickable editable" id="' + (location / 1000) + '">';
        }
        else{
            var prefix = '<span class="clickable" id="' + (location / 1000) + '">';
        }
        var suffix = '</span>';
        if (htmlRaw.startsWith('<span class=') && !htmlRaw.endsWith('</span>')) {
            prefix = '';
            suffix = '';
        }
        htmlFromSource += prefix + htmlRaw + suffix;

    });
    var styleAttr = '';
    if (window.outputFormat === 'bounded') {
        if (divHeight > 0) {
            styleAttr = 'style="height:' + divHeight + 'px;overflow-y:auto"';
        }
    }
    htmlFromSource = '<div ' + styleAttr + ' class="resizable"><br/>' + htmlFromSource + footer + '</div>';
    if(forSave == '1'){
        html = htmlPre + videoPlayerHTML+ startScopedStyle + style + endScopedStyle + htmlFromSource + htmlPost;
    }
    else{
        html = htmlPre + playerHTML+ startScopedStyle + style + endScopedStyle + htmlFromSource + htmlPost;
    }
    return html;
}

function getRulesFromText(cssRulesText) {
    var doc = document.implementation.createHTMLDocument(""), styleElement = document.createElement("style");
    styleElement.textContent = cssRulesText;
    doc.body.appendChild(styleElement);
    return styleElement.sheet.cssRules;
}

function keyUpEvent(e) {
    var tb = document.getElementById("tbNotes");
    var text = tb.value;
    if (text.endsWith('/p//')) {
        player.pauseVideo();
        tb.value = text.slice(0, -4);
    }
    if (text.endsWith('/r//')) {
        player.playVideo();
        tb.value = text.slice(0, -4);
        //if the textbox is empty at this point, you can use the current time as the jot time
        //would be useful for producing pure transcripts
        if(tb.value.trim()===''){
            window.currPosition = Math.ceil(player.getCurrentTime()*1000);
            $("#spnNextJot").text('Next jot at position ' + window.currPosition + ' s');
            isClear = false;
        }
    }
    if (text.endsWith('//')) {
        var textBefore = text.substring(0, text.length - 2);
        var slashBefore = textBefore.lastIndexOf('/');
        if (slashBefore > -1) {
            var inside = textBefore.substring(slashBefore + 1);
            var rewind = TryParseInt(inside, null);
            if (rewind) {
                player.seekTo(player.getCurrentTime() + rewind);
                //remove markers from display
                tb.value = text.substring(0, slashBefore);
            }
        }
    }
    if (text.length === 1 && isClear) {
        window.currPosition = Math.ceil(player.getCurrentTime()*1000);
        $("#spnNextJot").text('Next jot at position ' + window.currPosition + ' s');
        isClear = false;
    }
    var command = getCommand(text);
    if (command === COMMAND.PAUSE) {
        $("#spnAlert").text(CMDTEXT[S_PAUSE]);
    }
    else if (command === COMMAND.RESUME) {
        $("#spnAlert").text(CMDTEXT[S_RESUME]);
    }
    else if (command === COMMAND.NEWLINE) {
        $("#spnAlert").text(CMDTEXT[S_NEWLINE]);
    }
        else if (command === COMMAND.POP) {
        $("#spnAlert").text(CMDTEXT[S_POP]);
    }
    else if (text.charAt(0) === '/' && text.charAt(text.length - 1) === '/') {
            //rewind if - number
            //forward if + number
            var inside = text.substring(1, text.length - 1);
            var rewind = TryParseInt(inside, null);
            if (rewind) {
                if (rewind > 0) {
                    $("#spnAlert").text('Forward ' + rewind + ' seconds');
                } else {
                    $("#spnAlert").text('Back ' + Math.abs(rewind) + ' seconds');
                }
            } 
        }
    else {
        $("#spnAlert").text('');
    }
    updateCurrentJot(htmlEncode(text));
    return false;
}

function getCommand(text) {
    var command = COMMAND.NONE;
    if (text === S_PAUSE) {
        command = COMMAND.PAUSE;
    }
    else if (text === S_RESUME) {
        command = COMMAND.RESUME;
    }
    else if (text === S_NEWLINE) {
        command = COMMAND.NEWLINE;
    }
    else if (text === S_POP) {
        command = COMMAND.POP;
    }
    return command;
}

function sortJotsByPosition() {
    var sourceText = $("#txtSource1").val();
    var allText = sourceText;
    var lines = JSON.parse(allText);
    var sorted = [];
    window.totalCount = 0;
    lines.forEach(function(item){
        var textVal = item.text;
        window.totalCount += countWords(textVal);
        var pos = parseFloat(item.pos);
        var obj = {};
        obj.pos = pos;
        obj.text = textVal;
        sorted.push(obj);
    });
    sorted = _.sortBy(sorted, function (o) { return o.pos; });
    var sortedText = JSON.stringify(sorted);
    window.textSource = sortedText;
    $("#txtSource1").val(window.textSource);
}

function addToSource(text, position) {
    var sourceText = $("#txtSource1").val();
    var allText = sourceText;
    var sorted = [];
    if(allText !== ''){
        var allJson = JSON.parse(allText);
        allJson.forEach(function(item){
            var pos = parseFloat(item.pos);
            if(position === pos){
                position+=1;
            }
            var obj = {};
            obj.pos = item.pos;
            obj.text = item.text;
            sorted.push(obj);
        });
    }
    var lastObj = {};
    lastObj.pos = position;
    lastObj.text = text;
    sorted.push(lastObj);
    sorted = _.sortBy(sorted, function (o) { return o.pos; });
    var sortedText = JSON.stringify(sorted);
    window.textSource = sortedText;
    //$("#txtSource").val(window.textSource);
    $("#txtSource1").val(JSON.stringify(sorted));
    updateOutput();
}

function updateCurrentJot(text) {
    var htmlJot = convertSourceToOutput('{[pos:"0",text:"'+text+'"]}',false,0,1,0);
    $("#spnCurrentJot").html(htmlJot);
}

function keyPressEvent(e) {
    var tb = document.getElementById("tbNotes");
    var text = tb.value;
    var textToDisplay = text;
    var sourceText = text;
    var encodedText = htmlEncode(sourceText);
    if (e.keyCode === 13) {
        var command = getCommand(text);
        var doNotDisplay = false;
        if (command === COMMAND.POP) {
            //pop last tag from array
            window.tagArray.remove(window.tagArray.length - 1);
            encodedText = '</span>';
            displayTagArray();
        } else if (command === COMMAND.PAUSE) {
            player.pauseVideo();
            doNotDisplay = true;
        }
        else if (command === COMMAND.RESUME) {
                player.playVideo();
                doNotDisplay = true;
        }
        else if (command === COMMAND.NEWLINE) {
            
        }
        else if (text.charAt(0) === '\'' && text.charAt(text.length - 1) !== '\'') {
            var nonQuoteFound = false;
            sourceText = htmlEncode(text);
            var slashString = '';
            var numSlashes = 0;
            for (var i = 0; i < text.length; i++) {
                if (text.charAt(i) === '\'') {
                    if (!nonQuoteFound) {
                        slashString += '/n/';
                        numSlashes += 1;
                    }
                } else {
                    nonQuoteFound = true;
                }
            }
            encodedText = slashString + htmlEncode(text.substring(numSlashes, text.length));
        }
        else {
            if (text.charAt(0) === '/' && text.charAt(text.length - 1) === '/') {
                //rewind if - number
                //forward if + number
                var inside = text.substring(1, text.length - 1);
                var rewind = TryParseInt(inside, null);
                if (rewind) {
                    player.seekTo(player.getCurrentTime() + rewind);
                    doNotDisplay = true;
                } else {
                    var tagName = inside;
                    if (inside.indexOf('/') > -1) {
                        //a closed, but filled out tag
                        var tag = inside.substring(0, inside.indexOf('/'));
                        var tagValue = inside.substring(inside.indexOf('/') + 1);
                        textToDisplay = tagValue;
                        encodedText = '<span class="' + tag + '">' + htmlEncode(tagValue) + '</span>';
                    } else {
                        window.tagArray.push(tagName);
                        encodedText = '<span class="' + tagName + '">';
                    }
                    displayTagArray();
                }
            }
        }
        if (!doNotDisplay && encodedText.trim() !== '') {
            addToSource(encodedText, window.currPosition);
            updateOutput();
        }
        tb.value = '';
        isClear = true;
        $("#spnNextJot").text('');
        return false;
    }
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

function updateOutputForIndexPage(data){
    var fileName = $("#txtPageName").val();
    var divRow = $('<div>').addClass("row");
    var divCol = $('<div>').addClass("col-md-7");
    var aLink = $('<a>').attr('href',fileName);
    var imgURL = 'http://img.youtube.com/vi/'+currVideoID+'/0.jpg';
    var imageLink = $('<img>').addClass('img-responsive').attr('src',imgURL);
    aLink.append(imageLink);
    divCol.append(aLink);
    var divCol5 = $('<div>').addClass("col-md-5");
    var h3 = $('<h3>').append(player.getVideoData().title);
    var publishedAt = null;
    var description = null;
    var duration = null;
    publishedAt = data.items[0].snippet.publishedAt;
    description = data.items[0].snippet.description;
    duration = ' ['+player.getDuration().toString().toHHMMSS()+']';
    var h4 = $('<h4>');
    if(publishedAt !==null){
        h4.append(new Date(publishedAt).toLocaleDateString()+duration);
    }
    var p = $('<p>');
    if(description !== null){
        p.append(htmlEncode(description));
    }
    var a2 = $('<a>').addClass('btn btn-primary').attr('href',$("#txtPageName").val());
    a2.append('View Outline');
    var span = $('<span>').addClass('glyphicon glyphicon-chevron-right');
    a2.append(span);
    divCol5.append(h3).append(h4).append(p).append(a2);
    divRow.append(divCol);
    divRow.append(divCol5);
    $("#txtOutputForIndex").val($(divRow)[0].outerHTML+'<hr>');
}

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'jsonp';
    xhr.onload = function() {
        var status = xhr.status;
        if (status == 200) {
            callback(null, xhr.response);
        } else {
            callback(status);
        }
    };
    xhr.send();
};

function updateOutput() {

    sortJotsByPosition();
    displayOutlineProgress();
    try{
        $("#divTitle").html(player.getVideoData().title);

    }
    catch(ex){}
    var output = convertSourceToOutput($("#txtSource1").val(), false,0,1,0);
    var outputWithPlayer = convertSourceToOutput($("#txtSource1").val(), true, 0,0,0);
    var outputForSave = convertSourceToOutput($("#txtSource1").val(), true, 0,0,1);
    $("#txtSavedOutput").text(outputForSave);
    $("#pnlNotes").html('');
    $("#pnlNotes").html(output);
    $("#viewoutput").html('');
    $("#viewoutput").html(output);
    $("#divFormatter").html(output);
    $("#txtOutputHTML").text('');
    $("#txtOutputHTML").text(outputWithPlayer);
    $("#pnlNotes").scrollTop($("#pnlNotes")[0].scrollHeight);
    var allrules = getAllRules();
    $("#selectClasses").html('');
    $.each(allrules, function(index, value) {
        $("#selectClasses").append($('<option/>', {
            value: value,
            text:value
        }));
    });
    var elems = document.getElementsByClassName("editable");
    for (var i = 0; i < elems.length; i++) {
        elems[i].addEventListener("click",(function(i) {return function() {
            window.formatSelection = this;
            var pos = Math.round(parseFloat(this.id)*1000);
            var fullJson = JSON.parse($("#txtSource1").val());
            var result = $.grep(fullJson,function(e){return e.pos === pos;});
            $("#divFormatterText").html(result[0].text);
        }
        })(i),false);
    }
    renderSource();
    if(window.totalCount){
        $("#lblCount").html(window.totalCount.toString());
    }
}

function getAllRules() {
    var allRules = [];
    allRules.push('b');
    allRules.push('i');
    allRules.push('s');
    allRules.push('u');
    var allCssRules = getRulesFromText($("#txtCSS").val());
    for (var x = 0; x < allCssRules.length; x++) {
        var className = allCssRules[x].selectorText;
        var classActualName = className.substring(1);
        allRules.push(classActualName);
    }
    return allRules;
}

function displayOutlineProgress() {
    var sourceText = $("#txtSource1").val();
    var allText = sourceText;
    var lines = JSON.parse(allText);
    $("#outlineProgress").html('');
    var table = $('<table/>', {});
    table.addClass('table');
    table.css('table-layout', 'fixed');
    table.css('border', '1px solid black');
    var tr = $('<tr/>', {});
    for (var i = 0; i < 100; i++) {
        var cell = $('<td/>', {
            id:'cell_'+i
        });
        cell.css('width', '1%');
        tr.append(cell);
    }
    table.append(tr);
    $("#outlineProgress").append(table);
    lines.forEach(function(item){
        var pos = parseFloat(item.pos);
        var videoLength = player.getDuration();
        var percent = Math.floor((pos / videoLength * (100 / 1000)));
        $('#cell_' + percent).css('background-color', 'green');
    });
}

function saveHtml() {
    var fullHtml = generateHtmlFromSource();
    var blob = new Blob([fullHtml], { type: "text/plain;charset=utf-8" });
    saveAs(blob, $("#txtPageName").val());
    updateVideoData();
}

function saveHtmlWithGA() {
    if ($("#tbGA").val() === '') {
        alert('No Google Analytics code was input!');
    } else {
        var fullHtml = generateHtmlFromSourceWithGA();
        var blob = new Blob([fullHtml], { type: "text/plain;charset=utf-8" });
        saveAs(blob, currVideoID + ".html");
    }
}

function saveFile() {
    var currTitle = player.getVideoData().title;
    var currDuration = player.getDuration();
    var textToWrite = $("#txtSource1").val();
    var cssToWrite = $("#txtCSS").val();
    var category = $("#txtCategoryName").val();
    var json = {
        "text": textToWrite,
        "css": cssToWrite,
        "videoid": currVideoID,
        "title": currTitle,
        "duration":currDuration,
        "category":category,
        "pageName":$("#txtPageName").val()
    };
    var blob = new Blob([JSON.stringify(json)], { type: "text/plain;charset=utf-8" });
    saveAs(blob, currVideoID+".txt");
}

function updateWordCount(){
    var wordCountJson = JSON.parse(window.json);
    wordCountJson[window.currVideoID]=window.totalCount;
    var wordCountblob = new Blob([JSON.stringify(wordCountJson)], { type: "text/plain;charset=utf-8" });
    saveAs(wordCountblob, "wordcount.json");
}

function renderSource() {
    renderSourceData();
    $(".btn").click(function () {
        if (this.id.startsWith('btnEditText_')) {
            var id = this.id;
            var pos = id.split('_')[1];
            if (this.textContent === 'Edit') {
                $('#btnInsertLineBreak').prop('disabled', false);
                var taId = '#txt_' + pos.toString();
                $(taId).prop('readonly', false);
                window.textAreaBeingEdited = 'txt_'+pos.toString();
                this.textContent = 'Save';
                var curPos = parseFloat(pos) / 1000;
                player.seekTo(curPos);
                player.pauseVideo();
                $("#slider").show();
                $("#slider").slider({
                    value: curPos,
                    min: curPos - 10,
                    max: curPos + 10,
                    step:0.1,
                    slide: function (event, ui) {
                        $('#txtEditPos_' + pos).val(ui.value);
                        player.seekTo(ui.value);
                    }
                });
                $("#sliderMessage").show();
                $("#sliderSpace").show();
            }
            else if (this.textContent === 'Save') {
                $('#btnInsertLineBreak').prop('disabled', true);
                var taId = '#txt_' + pos.toString();
                var newValue = $(taId).val();
                var newPos = $('#txtEditPos_' + pos).val() * 1000;
                updateSentence(pos, newValue,newPos);
                this.textContent = 'Edit';
                $("#slider").hide();
                $("#sliderMessage").hide();
                $("#sliderSpace").hide();
            }
        }
        if (this.id.startsWith('btnDeleteText_')) {
            var id = this.id;
            var pos = id.split('_')[1];
            deleteSentence(pos);
        }
    });
}

function renderSourceData() {
    $("#source").html('');
    var sourceText = $("#txtSource1").val();
    var allText = sourceText;
    var lines = JSON.parse(allText);
    var table = $('<table/>', {});
    $(table).css('width', '100%');
    var tbody = $('<tbody/>', {});
    table.append(tbody);
    //$.each(lines, function (index, value) {
    lines.forEach(function(item){
        //var items = value.split('|#|');
        var pos = parseFloat(item.pos);
        var text = item.text;
        var tr = $('<tr/>', {});
        var textAreaPos = $('<textarea/>', {
            id:'txtEditPos_'+pos.toString()
        });
        $(textAreaPos).prop('readonly', true);
        $(textAreaPos).text(pos/1000);
        var tdTextAreaPos = $('<td/>', {});
        $(tdTextAreaPos).css('width', '10%');
        $(tdTextAreaPos).append(textAreaPos);

        var textArea = $('<textarea/>', {
            id: "txt_" + pos.toString()
        });
        $(textArea).text(text);
        $(textArea).prop('readonly', true);
        var tdTextArea = $('<td/>', {});
        $(tdTextArea).css("width", '70%');
        tdTextArea.append(textArea);

        var editButton = $('<button/>', {
            id: "btnEditText_" + pos.toString(),
            text: 'Edit'
        });
        $(editButton).addClass('btn');
        $(editButton).addClass('btn-primary');
        $(editButton).addClass('btn-xs');
        $(editButton).addClass('editable');
        var tdEditButton = $('<td/>', {});
        tdEditButton.append(editButton);
        $(tdEditButton).css('width', '10%');
        $(tdEditButton).css('text-align', 'center');

        var deleteButton = $('<button/>', {
            id: "btnDeleteText_" + pos.toString(),
            text: 'Delete'
        });
        $(deleteButton).addClass('btn');
        $(deleteButton).addClass('btn-primary');
        $(deleteButton).addClass('btn-xs');
        $(deleteButton).addClass('deletable');
        var tdDeleteButton = $('<td/>', {});
        tdDeleteButton.append(deleteButton);
        $(tdDeleteButton).css('width', '10%');
        $(tdDeleteButton).css('text-align', 'center');

        tr.append(tdTextAreaPos).append(tdTextArea).append(tdEditButton).append(tdDeleteButton);
        tbody.append(tr);
    });
    $("#source").html(table.html());
}

function displayTagArray() {
    $("#tagArray").html('&nbsp;');
    $.each(window.tagArray, function(index, value) {
        $("#tagArray").append(value+' > ');
    });
}

function previewHtml() {
    var x = window.open();
    var fullHtml = generateHtmlFromSource();
    x.document.open();
    x.document.write(fullHtml);
    x.document.close();
}

function generateHtmlFromSource() {
    var currTitle = player.getVideoData().title;
    var title = '<title>' + htmlEncode(currTitle) + '</title>';
    var jqueryUiScript = '<script src="../js/jquery-ui.js"></script>';
    var playerScript = '<script src="../js/player.js"></script>';
    //var jsSocials = '<script type="text/javascript" src="https://cdn.jsdelivr.net/jquery.jssocials/1.2.1/jssocials.min.js"></script><link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/jquery.jssocials/1.2.1/jssocials.css" /><link type="text/css" rel="stylesheet" href="https://cdn.jsdelivr.net/jquery.jssocials/1.2.1/jssocials-theme-classic.css" />';
    var bootstrapScript = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"><link rel="stylesheet" href="http://code.jquery.com/ui/1.11.4/themes/ui-lightness/jquery-ui.css"/><script src="http://code.jquery.com/jquery-2.1.4.min.js"></script><script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>';
    var mathjaxScript = '<script type="text/x-mathjax-config">MathJax.Hub.Config({tex2jax: {inlineMath: [[\'$\',\'$\'], [\'\\\\(\',\'\\\\)\']]}});</script><script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>';
    var analyticsScript = "<script>if (document.location.hostname.search('videojots.com') !== -1) {(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');ga('create', 'UA-78294929-1', 'auto');ga('send', 'pageview');}</script>";
    var cssInline = '<style>#segrip {width: 10px;height: 10px;background-color: #ffffff;border: 1px solid #000000;bottom: -5px;right: -5px;}</style>';
    var head = '<head>' + title +bootstrapScript + mathjaxScript + jqueryUiScript+ playerScript+ analyticsScript+cssInline+'</head>';

    var body = '<body>' + $("#txtSavedOutput").val()+'</body>';
    var fullHtml = '<!DOCTYPE html><html lang="en">' + head + body + '</html>';
    return fullHtml;
}

function generateHtmlFromSourceWithGA() {
    var currTitle = player.getVideoData().title;
    var title = '<title>' + htmlEncode(currTitle) + '</title>';
    var bootstrapScript = '<link rel="stylesheet" href="css/bootstrap.min.css"><link rel="stylesheet" href="css/jquery-ui.css"/><script src="js/jquery-2.1.1.min.js"></script><script src="js/bootstrap.min.js"></script>';
    var mathjaxScript = '<script type="text/x-mathjax-config">MathJax.Hub.Config({tex2jax: {inlineMath: [[\'$\',\'$\'], [\'\\\\(\',\'\\\\)\']]}});</script><script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>';
    var analyticsScript = "<script>if (document.location.hostname.search('videojots.com') !== -1) {(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');ga('create', '" + $("#tbGA").val() + "', 'auto');ga('send', 'pageview');}</script>";
    var head = '<head>'+title+bootstrapScript+mathjaxScript+analyticsScript+'</head>';
    var body = '<body>' + $("#txtOutputHTML").val() + '</body>';
    var fullHtml = '<html>' + head + body + '</html>';
    return fullHtml;
}

function get_selection(theId) {
    var e = document.getElementById(theId);

    //Mozilla and DOM 3.0
    if ('selectionStart' in e) {
        var l = e.selectionEnd - e.selectionStart;
        return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
    }
        //IE
    else if (document.selection) {
        e.focus();
        var r = document.selection.createRange();
        var tr = e.createTextRange();
        var tr2 = tr.duplicate();
        tr2.moveToBookmark(r.getBookmark());
        tr.setEndPoint('EndToStart', tr2);
        if (r === null || tr === null) return { start: e.value.length, end: e.value.length, length: 0, text: '' };
        var textPart = r.text.replace(/[\r\n]/g, '.'); //for some reason IE doesn't always count the \n and \r in the length
        var textWhole = e.value.replace(/[\r\n]/g, '.');
        var theStart = textWhole.indexOf(textPart, tr.text.length);
        return { start: theStart, end: theStart + textPart.length, length: textPart.length, text: r.text };
    }
        //Browser not supported
    else return { start: e.value.length, end: e.value.length, length: 0, text: '' };
}

function replace_selection(theId, replaceStr) {
    var e = document.getElementById(theId);
    var selection = get_selection(theId);
    var startPos = selection.start;
    var endPos = startPos + replaceStr.length;
    e.value = e.value.substr(0, startPos) + replaceStr + e.value.substr(selection.end, e.value.length);
    set_selection(theId, startPos, endPos);
    return { start: startPos, end: endPos, length: replaceStr.length, text: replaceStr };
}

function set_selection(theId, startPos, endPos) {
    var e = document.getElementById(theId);

    //Mozilla and DOM 3.0
    if ('selectionStart' in e) {
        e.focus();
        e.selectionStart = startPos;
        e.selectionEnd = endPos;
    }
        //IE
    else if (document.selection) {
        e.focus();
        var tr = e.createTextRange();

        //Fix IE from counting the newline characters as two seperate characters
        var stopIt = startPos;
        for (i = 0; i < stopIt; i++) if (e.value[i].search(/[\r\n]/) !== -1) startPos = startPos - .5;
        stopIt = endPos;
        for (i = 0; i < stopIt; i++) if (e.value[i].search(/[\r\n]/) !== -1) endPos = endPos - .5;

        tr.moveEnd('textedit', -1);
        tr.moveStart('character', startPos);
        tr.moveEnd('character', endPos - startPos);
        tr.select();
    }
    return get_selection(theId);
}

function wrap_selection(theId, leftStr, rightStr, selOffset, selLength) {
    var theSelText = get_selection(theId).text;
    var selection = replace_selection(theId, leftStr + theSelText + rightStr);
    if (selOffset !== undefined && selLength !== undefined) selection = set_selection(theId, selection.start + selOffset, selection.start + selOffset + selLength);
    else if (theSelText === '') selection = set_selection(theId, selection.start + leftStr.length, selection.start + leftStr.length);
    return selection;
}

/* Helpers */

function TryParseInt(str, defaultValue) {
    var retValue = defaultValue;
    if (str !== null) {
        if (str.length > 0) {
            if (!isNaN(str)) {
                retValue = parseInt(str);
            }
        }
    }
    return retValue;
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
}

//Source: http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery

function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}