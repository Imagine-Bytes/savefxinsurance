$('input').focus(function(){
    $(this).parent().children('label').addClass('label-move')
}).blur(function() {
    $(this).parent().children('label').removeClass('label-move')
})