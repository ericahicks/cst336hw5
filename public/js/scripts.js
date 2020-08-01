$(document).ready(function () {
    
    /* Event when clicking on save button
    lets the user save the location and timezone
    data to the database */
    $("#save").on("click", function() {
        let city = $("#city").html();
        let state = $("#state").html();
        let zone = $("#zone").html();
        let gmt = $("#gmt").html();
        let abbrev = $("#abbrev").html();
        $.ajax({
            method: "get",
            url: "/api/saveLocation",
            data: {
                "city": city,
                "state": state,
                "zone": zone,
                "gmt": gmt,
                "abb": abbrev
            },
            success: function(data, status) {
                console.log("status " + status);
                console.log("data: " + data);
            }
        });//ajax
        
        //show delete button and disable save button
        $("#delete").prop("disabled", false);
        $("#save").prop("disabled", true);
    });
    
    /* Event when clicking on delete button
    lets the user delte the location and timezone
    data from the database */
    $("#delete").on("click", function() {
        let city = $("#city").html();
        let state = $("#state").html();
        
        $.ajax({
            method: "get",
            url: "/api/removeLocation",
            data: {
                "city": city,
                "state": state
            },
            success: function(data, status) {
                console.log("status " + status);
                console.log("data: " + data);
            }
        });//ajax
        
        //show delete button and disable save button
        $("#delete").prop("disabled", true);
        $("#save").prop("disabled", false);
    });//delete
    
    /* Event when clicking on show button
    lets the user see the location's current time */
    let time = "";
    $("#locs").on("click", ".show", function() {
        let zone = $(this).data("zone");
        let el = $(this).next().next();//get <span> after <br>
        $.ajax({
            method: "get",
            url: "/api/getCurrentTime",
            data: {
                "zone": zone
            },
            success: function(data, status) {
                console.log("status " + status);
                console.log("data: " + data);
                time = data.time;
                console.log("time:" + time);
                //show time
                el.show();
                time = new Date(Date.parse(time)).toLocaleTimeString();
                el.html("Current Time: " + time);
            },
            error: function(jqXHR, exception) {
                // error logic from stackoverflow 
                // https://stackoverflow.com/questions/6792878/jquery-ajax-error-function
                var msg = '';
                if (jqXHR.status === 0) {
                    msg = 'Not connect.\n Verify Network.';
                } else if (jqXHR.status == 404) {
                    msg = 'Requested page not found. [404]';
                } else if (jqXHR.status == 500) {
                    msg = 'Internal Server Error [500].';
                } else if (exception === 'parsererror') {
                    msg = 'Requested JSON parse failed.';
                } else if (exception === 'timeout') {
                    msg = 'Time out error.';
                } else if (exception === 'abort') {
                    msg = 'Ajax request aborted.';
                } else {
                    msg = 'Uncaught Error.\n' + jqXHR.responseText;
                }
                //show error
                el.show();
                el.html("Error: " + msg);
            }//error
        });//ajax
        
    });
    
});//ready