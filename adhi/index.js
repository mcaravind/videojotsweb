/**
 * Created by aravind on 11/6/17.
 */


$( document ).ready(function() {
    console.log( "ready!" );

    $( "#btnSendMessage" ).click(function() {
        sendMessage();
    });


    $('#userMessage').on('keypress', function (e) {
        if(e.which === 13){

            //Disable textbox to prevent multiple submit
            $(this).attr("disabled", "disabled");

            sendMessage();

            //Enable the textbox again if needed.
            $(this).removeAttr("disabled");
        }
    });
});


function sendMessage(){
    //fill out the chatbot messages
    //create a message div
    var messageText = $("#userMessage").val();
    $("#userMessage").val('');
    var divBox = jQuery('<div/>', {
        text: messageText
    });
    var accessToken = 'a0e902ad07434f9298dd7cf73ef7bd15';//$('#cat').val();
    $(divBox).css({"backgroundColor":"#add8e6","color":"white",
        "width":"50%","border-radius":"5px","padding":"5px","margin":"5px"});
    $("#chatbox").append(divBox);

    //GET https://api.dialogflow.com/v1/query?v=20150910&contexts=shop&lang=en&query=apple&sessionId=12345&timezone=America/New_York

    $.ajax({
        type: 'GET',
        url: 'https://api.dialogflow.com/v1/query?v=20150910&lang=en&query='+messageText+'&sessionId=12345&timezone=America/New_York',
        dataType: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer '+accessToken);
        },
        success: function (response) {
            doAction(response);
            var msg = response.result.fulfillment.speech;
            var divBox = jQuery('<div/>', {
                text: msg
            });
            $(divBox).css({"backgroundColor":"#7aca7a","color":"white",
                "width":"50%","border-radius":"5px","padding":"5px","margin":"5px"});
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