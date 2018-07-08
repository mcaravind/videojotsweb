/**
 * Created by aravind on 1/14/18.
 */
/**
 * Created by aravind on 11/6/17.
 */


$( document ).ready(function() {
    console.log( "ready!" );

    $('#btnTest').click(function(){
        doTest();
    });

});

function generateOutput(responseArray){
    $('#regressionOutput').html('');
    var tbody = $('<tbody/>');
    var tHead = $('<thead/>');
    tHead.addClass('thead-dark');
    var tdHeaderQuery = $('<th/>',{
        html:'User Query'
    });
    tHead.append(tdHeaderQuery);
    var tdHeaderResponse = $('<th/>',{
        html:'Agent Response'
    });
    tHead.append(tdHeaderResponse);
    var tdHeaderIntent = $('<th/>',{
        html:'Mapped Intent'
    });
    tHead.append(tdHeaderIntent);
    var tdHeaderScore = $('<th/>',{
        html:'Score'
    });
    tHead.append(tdHeaderScore);

    for(index in responseArray){
        var response = responseArray[index];
        var tr = $('<tr/>',{
        });
        var tdUserPhrase = $('<th/>',{
            html:response.query
        });
        tr.append(tdUserPhrase);
        var tdResponse = $('<th/>',{
            html:response.answer
        });
        tr.append(tdResponse);
        var tdIntentName = $('<th/>',{
            html:response.intentName
        });
        tr.append(tdIntentName);
        var tdScore = $('<th/>',{
            html:response.score
        });
        tr.append(tdScore);
        tbody.append(tr);
    }
    $('#regressionOutput').append(tHead);
    $('#regressionOutput').append(tbody);
}

function doTest(){
    var userPhrases = [];
    userPhrases.push('atomic number of carbon');
    userPhrases.push('what is the atomic number');
    userPhrases.push('tell me about carbon');
    userPhrases.push('atomic weight of carbon');
    userPhrases.push('what is the atomic weight of Carbon');
    userPhrases.push('what is the atomic number of carbon');
    userPhrases.push('tell me the atomic number of carbon');
    userPhrases.push('tell me the atomic weight of carbon');
    userPhrases.push('chemical number of carbon');
    userPhrases.push('chemical atomic number of carbon');
    userPhrases.push('atomic symbol of carbon');
    userPhrases.push('what is the atomic symbol of carbon');
    userPhrases.push('what is the');
    userPhrases.push('atomic');
    userPhrases.push('number');
    userPhrases.push('carbon');

    var tHead = $('<thead/>');
    tHead.addClass('thead-dark');
    
    var responseArray = [];
    for (i = 0; i < userPhrases.length; ++i) {
        var tr = $('<tr/>',{
            id:'tr_'+(i-1)
        });
        var phrase = userPhrases[i];
        var tdUserPhrase = $('<th/>',{
            html:phrase
        });
        tr.append(tdUserPhrase);
        $.ajax({
            type: 'GET',
            url: 'https://api.dialogflow.com/v1/query?v=20150910&lang=en&query='+phrase+'&sessionId=12345&timezone=America/New_York',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer 467da356c87e4f62a7a63857913475f1');
            },
            async:false,
            success: function (response) {
                var msg = response.result.fulfillment.speech;
                var intentName = response.result.metadata.intentName;
                var score = response.result.score;
                var response = {};
                response.query = phrase;
                response.answer = msg;
                response.intentName = intentName;
                response.score = score;
                responseArray.push(response);
            }
        });
    }
    generateOutput(responseArray);
}

function sendMessage(){
    //fill out the chatbot messages
    //create a message div
    var messageText = $("#userMessage").val();
    $("#userMessage").val('');
    var divBox = jQuery('<div/>', {
        text: messageText
    });
    $(divBox).css({"backgroundColor":"#add8e6","color":"white",
        "width":"30%","border-radius":"5px","padding":"5px","margin":"5px"});
    $("#chatbox").append(divBox);

    //GET https://api.dialogflow.com/v1/query?v=20150910&contexts=shop&lang=en&query=apple&sessionId=12345&timezone=America/New_York

    $.ajax({
        type: 'GET',
        url: 'https://api.dialogflow.com/v1/query?v=20150910&lang=en&query='+messageText+'&sessionId=12345&timezone=America/New_York',
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer 6fd35a8bb8154f10a3408fd7148aec58');
        },
        success: function (response) {
            var msg = response.result.fulfillment.speech;
            var divBox = jQuery('<div/>', {
                text: msg
            });
            $(divBox).css({"backgroundColor":"#7aca7a","color":"white",
                "width":"30%","border-radius":"5px","padding":"5px","margin":"5px"});
            $("#chatbox").append(divBox);
            $(divBox)[0].scrollIntoView();
            $("#userMessage").focus();
        }
    });
}

function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return 'Basic ' + hash;
}