'use strict';
/** 
 * Handles the hide function server side for the form 
 */

$('.select-button').on('click', function() {
  $(this).next().removeClass('hide-me');
});

$('#update-button').on('click', function() {
  $('#update-form').removeClass('hide-me');
})
