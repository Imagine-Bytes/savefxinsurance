$(document).ready(function() {

    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
  
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
  
    });
  });

  window.addEventListener('scroll', function(){
      if (pageYOffset > 1) {
        $(".navbar").css('box-shadow', '#1c1c3d 0 3px 5px')
      } else {
        $(".navbar").css('box-shadow', 'none')
      }
  })
  