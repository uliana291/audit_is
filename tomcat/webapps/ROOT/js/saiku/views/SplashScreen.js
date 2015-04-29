/**
 * Created by bugg on 17/06/14.
 */
var SplashScreen = Backbone.View.extend({
    events: {
        'click .run_query': 'run_query',
        'click .run_dashboard': 'run_dashboard'
    },
    run_query : function(){
        Saiku.tabs.add(new Workspace());
        return false;
    },
    run_dashboard : function(){
        new DashboardModal().render().open();
        return false;
    },
    template: function() {
        var template = $("").html() || "";
        return _.template(template)({
        //    cube_navigation: Saiku.session.sessionworkspace.cube_navigation
        });
    },
    setupPage: function(e){
        var height = $(window).height();
        $('body').height(height);
        $('.tabs section').each(function(){
            var vH = $(this).height();
            var dif = ((height - vH)/2)-50;
            if(dif<0){
                dif = 20;
            }
            //$(this).css('margin-top',dif+'px').hide();
        });
        var active = $('nav li.active a').attr('class');
        $('#'+active).fadeIn();
    },
    render: function(){
      $(this.el).html(this.template()).appendTo($('body'));
		var license = new License();
		var that = this;
		if(Settings.BIPLUGIN5){
			license.fetch_license('api/api/license', function (opt) {
				if (opt.status !== 'error' && opt.data.get("licenseType") != "trial") {
					$(".enterprisetoggle").css("visibility", "hidden");
				}
			});
		}
		else {
			license.fetch_license('api/license/', function (opt) {
				if (opt.status !== 'error' && opt.data.get("licenseType") != "trial") {
					$(".enterprisetoggle").css("visibility", "hidden");
				}
			});
		}
		this.getNews();

      this.setupPage();
      $('nav li a').click(function(){
          var active = $(this).attr('class');
          $('nav li').removeClass('active');
          $(this).parent().addClass('active');
          $('.tabs section').hide();
          $('#'+active).fadeIn();
      });
      return this;
  },
    remove:function(){
        $(this.el).remove();
    },
    caption: function(increment) {
        return "Главная";
    },
	getNews: function(){
		var that = this;
		$.ajax({
			type: 'GET',
			url: "http://meteorite.bi/news.json",
			async: false,
			contentType: "application/json",
			dataType: 'jsonp',    
			jsonpCallback: 'jsonCallback',

			success: function(json) {
				for(var i = 0; i<json.item.length;i++){
					$(that.el).find("#news").append("<h4 style='margin-left: 0.5%;color:#6D6E71;'>"+json.item[i].title+"</h4><strong style='margin-left: 0.5%;color:#6D6E71;'>"+json.item[i].date+"</strong>" +
					"<br/><p style='color:#6D6E71;'>"+json.item[i].body+"</p>")
				}
				console.dir(json.item[0].tid);
			},
			error: function(e) {
				console.log(e.message);
			}
		});
	}

});
