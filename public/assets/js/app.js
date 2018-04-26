$(document).ready(function () {

    $("#scrape").on("click", function () {
        $("#articles").empty();

        $.ajax({
            method: "GET",
            url: "/scrape"
        }).then(function(response){
            if(!response.error) location.reload(true);
        })
    });

    $(".save-article").on("click", function () {
        var id = $(this).data("article-id");
        var that = $(this);
        $.ajax({
            method: "POST",
            url:"/save-article/" + id
        }).then(function(response) {
            that.addClass("disabled").text("Saved");
        })
    });

    $(".unsave-article").on("click", function () {
        var id = $(this).data("article-id");
        $.ajax({
            method: "POST",
            url:"/unsave-article/" + id
        }).then(function(response) {
            location.reload();
        })
    });
        
});