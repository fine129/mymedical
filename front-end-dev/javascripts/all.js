
    (function($) {
        $.fn.hoverIntent = function(config) {

            // default configuration values
            var cfg = {
                interval: 100,
                sensitivity: 7,
                timeout: 0
            };

    //        if ( typeof handlerIn === "object" ) {
    //            cfg = $.extend(cfg, handlerIn );
    //        } else if ($.isFunction(handlerOut)) {
    //            cfg = $.extend(cfg, { over: handlerIn, out: handlerOut, selector: selector } );
    //        } else {
    //            cfg = $.extend(cfg, { over: handlerIn, out: handlerIn, selector: handlerOut } );
    //        }
            if(typeof config === 'object'){
            	 cfg = $.extend(cfg,config);
            } else {
            	console.error('config should be object.From all.js');
            	alert("config should be object.From all.js");
            }
            // instantiate variables
            // cX, cY = current X and Y position of mouse, updated by mousemove event
            // pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
            var cX, cY, pX, pY;

            // A private function for getting mouse position
            var track = function(ev) {
                cX = ev.pageX;
                cY = ev.pageY;
            };

            // A private function for comparing current and previous mouse position
            var compare = function(ev,ob) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
                // compare mouse positions to see if they've crossed the threshold
                if ( ( Math.abs(pX-cX) + Math.abs(pY-cY) ) < cfg.sensitivity ) {
                    $(ob).off("mousemove.hoverIntent",track);
                    // set hoverIntent state to true (so mouseOut can be called)
                    ob.hoverIntent_s = 1;
                    return cfg.over.apply(ob,[ev]);
                } else {
                    // set previous coordinates for next time
                    pX = cX; pY = cY;
                    // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
                    ob.hoverIntent_t = setTimeout( function(){compare(ev, ob);} , cfg.interval );
                }
            };

            // A private function for delaying the mouseOut function
            var delay = function(ev,ob) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
                ob.hoverIntent_s = 0;
                return cfg.out.apply(ob,[ev]);
            };

            // A private function for handling mouse 'hovering'
            var handleHover = function(e) {
                // copy objects to be passed into t (required for event object to be passed in IE)
                var ev = jQuery.extend({},e);
                var ob = this;

                // cancel hoverIntent timer if it exists
                if (ob.hoverIntent_t) { ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t); }

                // if e.type == "mouseenter"
                if (e.type == "mouseenter") {
                    // set "previous" X and Y position based on initial entry point
                    pX = ev.pageX; pY = ev.pageY;
                    // update "current" X and Y position based on mousemove
                    $(ob).on("mousemove.hoverIntent",track);
                    // start polling interval (self-calling timeout) to compare mouse coordinates over time
                    if (ob.hoverIntent_s != 1) { ob.hoverIntent_t = setTimeout( function(){compare(ev,ob);} , cfg.interval );}

                    // else e.type == "mouseleave"
                } else {
                    // unbind expensive mousemove event
                    $(ob).off("mousemove.hoverIntent",track);
                    // if hoverIntent state is true, then call the mouseOut function after the specified delay
                    if (ob.hoverIntent_s == 1) { ob.hoverIntent_t = setTimeout( function(){delay(ev,ob);} , cfg.timeout );}
                }
            };

            // listen for mouseenter and mouseleave
            return this.on({'mouseenter.hoverIntent':handleHover,'mouseleave.hoverIntent':handleHover}, cfg.selector);
        };
    })(jQuery);

// tooltip plugin 0.0.1  author:wup
    (function($){

        $.fn.wptooltip = function(config,flag) {

            

        }

    })(jQuery);

                                    function shownav(){
                                        $("#navwrapper").removeClass("hidenav").addClass("shownav");
                                        $("#logowrapper").addClass('ahover').removeClass('anormal');
                                    }
                                    function hidenav(){
                                        $("#navwrapper").removeClass("shownav").addClass("hidenav");
                                        $("#logowrapper").addClass('anormal').removeClass('ahover');

                                    }

                                    function showstatebar() {
                                        $('div.statebar').removeClass("hidenav").addClass("showstate");
                                        console.log('shownav');
                        //$("div.logoimg").addClass('ahover').removeClass('anormal');
                    }
                    function hidestatebar() {
                        $('div.statebar').removeClass("showstate").addClass("hidenav");
                        console.log('hidenav');
                        //$("div.logoimg").addClass('ahover').removeClass('anormal');
                    }
                    $(document).ready(function(){
                        var cfg = {over:shownav,out:hidenav,selector:null,timeout:300,sensitivity:30} ;
                        $("#menuwrapper").hoverIntent( cfg);

                        //search bar auto lengthening
                        $("div.menusearchbox input").mousedown(function(){
                            if($(this).data('lengthy') != true) {
                                $(this).addClass('length95');
                                $(this).data('lengthy',true);
                            }
                        });
                        
                        $("div.menusearchbox input").blur(function(e){
                            if($(this).data('lengthyclick')) {
                                $('div.menusearchbox form').submit();
                                $(this).data('lengthy',false);

                            }
                            if($(this).data('lengthy')) {
                                $(this).removeClass('length95');
                                $(this).data('lengthy',false);
                            }
                            
                        });
                        
                        $("div.menusearchbox button").mousedown(function(e){
                            if($('div.menusearchbox input').data('lengthy')) {
                                $('div.menusearchbox input').data('lengthyclick',true);
                            } 
                            else {
                                $('div.menusearchbox input').data('lengthyclick',false);
                            }
                        });
                        
                        /*
                        $('#menuwrapper span.stroke,#menuwrapper span.box').each(function(){
                            $(this).hover(
                                function(){
                                    $($(this).prev()[0]).addClass('ahover');
                            },
                                function(){
                                    $($(this).prev()[0]).removeClass('ahover');
                                }
                            );
                        });
                */
                $('#logowrapper').data('otext', $('#logowrapper').text()); 
                $('#logowrapper').data('oplaceholder', $('div.menusearchbox input').attr('placeholder')); 
                $('#nav a').hover(

                    function(){
                        var n = $(this).data('menuitem');
                        switch(n) {
                            case 'first':
                            $('#logowrapper').text('First');
                            var t = $(this).find('span.menutext').text();
                            $('div.menusearchbox input').attr('placeholder',t)
                            break;
                            case 'second':
                            var t = $(this).find('span.menutext').text();
                            $('div.menusearchbox input').attr('placeholder',t)
                            $('#logowrapper').text('Second');
                            break;
                            case 'third':
                            var t = $(this).find('span.menutext').text();
                            $('div.menusearchbox input').attr('placeholder',t)
                            $('#logowrapper').text('Third');
                            break;
                            case 'fourth':
                            var t = $(this).find('span.menutext').text();
                            $('div.menusearchbox input').attr('placeholder',t)
                            $('#logowrapper').text('Fourth');
                            break;
                        }

                    },
                    function(){
                        var ot = $('#logowrapper').data('otext');
                        var op = $('#logowrapper').data('oplaceholder');
                        $('#logowrapper').text(ot);
                        $('div.menusearchbox input').attr('placeholder',op);
                    }
                    );


                var cfg2 = {over:showstatebar,out:hidestatebar,selector:null,timeout:300,sensitivity:30} ;
                $("div.healthystate").hoverIntent( cfg2);


                
                $("div.physicalslider").noUiSlider({
                    range: [0, 100.00]
                    ,start: 0
                    ,step: 1
                    ,handles: 1
                    // ,serialization: {
                    //  to:[$('div.statenumber')]
                    //  ,resolution: 0.01
                    // }
                    ,slide: function(){
                        var r = $(this).val();
                        var g = $('div.mentalslider').val()?$('div.mentalslider').val():0;
                        var b = $('div.socialslider').val()?$('div.socialslider').val():0;
                        console.log('when sliding,r = ' + r,' b= ' + b + ' g =' + g );
                        refreshColorSpace(r,g,b);
                        dataLevel(r,$('div.physical em.value'),$('div.physical span.statelevel'),'statelevel');
                    }
                });



                $("div.mentalslider").noUiSlider({
                    range: [0, 100]
                    ,start: 0
                    ,step: 1
                    ,handles: 1
                    ,slide: function(){
                        var g = $(this).val();
                         var r = $('div.physicalslider').val()?$('div.physicalslider').val():0;
                        var b = $('div.socialslider').val()?$('div.socialslider').val():0;
                        console.log('when sliding,r = ' + r,' b= ' + b + ' g =' + g );
                        refreshColorSpace(r,g,b);
                        dataLevel(g,$('div.mental em.value'),$('div.mental span.statelevel'),'statelevel');
                    }
                });

                $("div.socialslider").noUiSlider({
                    range: [0, 100]
                    ,start: 0
                    ,step: 1
                    ,handles: 1
                    ,slide: function(){
                        var b = $(this).val();
                          var  r = $('div.physicalslider').val();
                        var g = $('div.mentalslider').val()?$('div.mentalslider').val():0;
                         refreshColorSpace(r,g,b);
                         dataLevel(b,$('div.social em.value'),$('div.social span.statelevel'),'statelevel');
                    }
                });

                

                $('span.titlepart').each(function(){ $(this).hide();});


                $('div.mental , div.physical , div.social').each(function(){

                    var cfg = {over:function(){$(this).find('span.titlepart').show();},out:function(){$(this).find('span.titlepart').hide();},selector:null,timeout:300,sensitivity:30} ;
                        $(this).hoverIntent( cfg);
                });


                });

                function hexFromRGB(r, g, b) {

                    r = Math.ceil(r * 255 /100);
                    g = Math.ceil(g * 255 /100);
                    b = Math.ceil(b * 255 /100);

                    var hex = [
                      r.toString( 16 ),
                      g.toString( 16 ),
                      b.toString( 16 )
                    ];
                    $.each( hex, function( nr, val ) {
                      if ( val.length === 1 ) {
                        hex[ nr ] = "0" + val;
                      }
                    });
                    return hex.join( "" ).toUpperCase();
                  }

                  function refreshColorSpace(r,g,b) {
                    
                      hex = hexFromRGB( r, g, b );
                      console.log('when refreshing colorspace, hex = #' + hex);
                    $( "div.slidercontainer div.colorspace" ).css( "background-color", "#" + hex );
                  }

                  // predefined data.
                  var state = ['worst','bad','not good', 'not bad', 'good' ,'best'],
                  o = [1, 10 ,30 ,50  ,80 ,90 ,100] ;

                  function classifyNumber (n,arr) {
                    var temp = 0;
                    if(n >= 100) {
                        temp = 5;
                    }  else {

                    for(var i = 0 ; i < arr.length ; i++) {
                        if( n >= arr[i] && (i + 1 ) < arr.length && n < arr[i+1]) {
                            temp = i ;
                            break;
                        } 
                    }
                     
                  }
                    return {'cl':'level' + (temp + 1),'content':state[temp]} ;
                }

                  function dataLevel(num,val_o,content_o,original_c) {
                    var r = classifyNumber(num,o);
                    val_o.text(num);

                    // set healthy state content
                    content_o.text(r['content']);

                    // set css class
                    content_o.attr('class','');
                    content_o.attr('class',original_c + '  ' + r['cl']);

                    console.log('when calling dataLevel function, num = ' + num + ' emvalue object = ' + val_o.text() + ' statelevel object = ' +
                     content_o.text());
                  }


