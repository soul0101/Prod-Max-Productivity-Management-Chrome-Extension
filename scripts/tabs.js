$(document).ready(function(){
    $(".tabcontent").hide();
    $("#time-page").show(); 
    $("#bl-btn").click(function(){
        $(".tabcontent").hide();
        $("#blocklist-page").show();
    });
    $("#timer-btn").click(function(){
        $(".tabcontent").hide();
        $("#time-page").show(); 
    });
    $("#todo-btn").click(function(){
        $(".tabcontent").hide();
        $("#todo-page").show(); 
    });
    // $("#timer-settings").click(function(){
    //     bg.loadSettings(()=>{
    //         $(".tabcontent").hide();
    //         $("#timer-settings-page").show();
    //     });
    // });
});

