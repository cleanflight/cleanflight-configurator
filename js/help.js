function help(helpDocument) {

     $.ajax({
      url : helpDocument,
      dataType: "text",
      success : function (data) {
        console.log('Loaded help file: ' + helpDocument); 
        var regex = /\#\s(.*?)\r\n/g;
        var matches = [];
        var titleMatch = regex.exec(data);
        
        while (titleMatch != null) {      
          var titleString = titleMatch[1];
          console.log(titleString);
          var regex2 = new RegExp("\\\#\\s" + escapeRegExp(titleString) + "\r\n([\\s\\S]*?)(?:\\#|$)", "gi");
          var helpTextMatch = regex2.exec(data);

          if (helpTextMatch != null) {
          
              var helpText = helpTextMatch[1];
              // Apply dialog to page
              console.log(helpText);
              var element = $('[i18n]:contains("' + titleString + '")');
              
        
              if (element.length) {
            
              var help_button = '<a tabindex="0" class="tip" role="button" data-toggle="popover" data-trigger="focus" title="' + titleString + '" data-content="' + helpText + '"><img src="/images/help.png" style="vertical-align:middle;padding-left:4px;"/></a>';
            
              if (element.parent().is('label')) {
                element.parent().after(help_button);
              } else {
                element.append(help_button);
              } 
                
            }
            
          }

          titleMatch = regex.exec(data);
        }
        
        var options = {
          placement: function (context, source) {
              var position = $(source).position();

              if (position.left > 515) {
                  return "left";
              }

              if (position.left < 515) {
                  return "right";
              }

              if (position.top < 110){
                  return "bottom";
              }

              return "top";
          }
          , html: 'true'
        };
        
        $('.tip').popover(options);

        $('.tip').on('click', function (e) {
          $('.tip').not(this).popover('hide');
        });
        
        }, 
        error: function (xhr, ajaxOptions, thrownError) {
          GUI.log('Unable to load help documentation. Help dialogs will be unavailable.');
          console.log('Unable to load help documentation. Help dialogs will be unavailable. ' + thrownError);
        }
    });
}

// Escape special charchters when using passing strings into RegExp function
function escapeRegExp(string){
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
