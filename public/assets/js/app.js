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

    $(".comment").on("click", function() {
        var id = $(this).data("article-id");
        console.log(id);

        $.ajax({
            method: "GET",
            url: "/notes/" + id
        }).then(function(data) {
            $("#comments").empty();
            $("#modal-title").text(data.title);
            $("#save-comment").attr("data-article-id", id);
            data.notes.forEach(function(note) {
                var noteId = note._id;
                var author = $("<h5>").text(note.author);
                var note = $("<p>").text(note.body);
                var remove = $("<button>")
                    .addClass("btn btn-danger btn-sm remove-comment")
                    .attr("data-note-id", noteId)
                    .text("x");

                $("#comments").append(author).append(note).append(remove).append($("<hr>"));
            })

            $(".remove-comment").on("click", function() {
                var id = $(this).data("note-id");
        
                $.ajax("/notes/" + id, {
                    type: "DELTE"
                }).then(function() {
                    location.reload();
                })
            })
        })
    })

    $("#save-comment").on("click", function() {
        var id = $(this).data("article-id");
        console.log(id);
        
        $.ajax({
            method: "POST",
            url: "/articles/" + id,
            data: {
              body: $("#comment").val(),
              author: $("#author").val()
            }
        })
        .then(function(data) {
            console.log(data);
        });
    })

        
});