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
        if (typeof config === 'object') {
            cfg = $.extend(cfg, config);
        } else {
           if(window.debug && console) console.error('config should be object.From all.js');
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
        var compare = function(ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            // compare mouse positions to see if they've crossed the threshold
            if ((Math.abs(pX - cX) + Math.abs(pY - cY)) < cfg.sensitivity) {
                $(ob).off("mousemove.hoverIntent", track);
                // set hoverIntent state to true (so mouseOut can be called)
                ob.hoverIntent_s = 1;
                return cfg.over.apply(ob, [ev]);
            } else {
                // set previous coordinates for next time
                pX = cX;
                pY = cY;
                // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
                ob.hoverIntent_t = setTimeout(function() {
                    compare(ev, ob);
                }, cfg.interval);
            }
        };

        // A private function for delaying the mouseOut function
        var delay = function(ev, ob) {
            ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            ob.hoverIntent_s = 0;
            return cfg.out.apply(ob, [ev]);
        };

        // A private function for handling mouse 'hovering'
        var handleHover = function(e) {
            // copy objects to be passed into t (required for event object to be passed in IE)
            var ev = jQuery.extend({}, e);
            var ob = this;

            // cancel hoverIntent timer if it exists
            if (ob.hoverIntent_t) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
            }

            // if e.type == "mouseenter"
            if (e.type == "mouseenter") {
                // set "previous" X and Y position based on initial entry point
                pX = ev.pageX;
                pY = ev.pageY;
                // update "current" X and Y position based on mousemove
                $(ob).on("mousemove.hoverIntent", track);
                // start polling interval (self-calling timeout) to compare mouse coordinates over time
                if (ob.hoverIntent_s != 1) {
                    ob.hoverIntent_t = setTimeout(function() {
                        compare(ev, ob);
                    }, cfg.interval);
                }

                // else e.type == "mouseleave"
            } else {
                // unbind expensive mousemove event
                $(ob).off("mousemove.hoverIntent", track);
                // if hoverIntent state is true, then call the mouseOut function after the specified delay
                if (ob.hoverIntent_s == 1) {
                    ob.hoverIntent_t = setTimeout(function() {
                        delay(ev, ob);
                    }, cfg.timeout);
                }
            }
        };

        // listen for mouseenter and mouseleave
        return this.on({
            'mouseenter.hoverIntent': handleHover,
            'mouseleave.hoverIntent': handleHover
        }, cfg.selector);
    };
})(jQuery);

/////////////////////////// TOOLTIP plugin///////////////
(function($){

    $.fn.tooltip = function(instanceSettings){
        
        $.fn.tooltip.defaultsSettings = {
            attributeName:'title',
            borderColor:'#ccc',
            borderSize:'1',
            cancelClick:0,
            followMouse:1,
            height:'auto',
            hoverIntent:{sensitivity:7,interval:100,timeout:0},
            loader:0,
            loaderHeight:0,
            loaderImagePath:'',
            loaderWidth:0,
            positionTop: 12,
            positionLeft: 12,
            width:'auto',
            titleAttributeContent:'',
            tooltipBGColor:'#fff',
            tooltipBGImage:'none', // http path
            tooltipHTTPType:'get',
            tooltipPadding:10,
            tooltipSource:'attribute', //inline, ajax, iframe, attribute, html(added 2013/05/27)
            sourceHtml:'' ,//added 2013/05/27
            tooltipSourceID:'',
            tooltipSourceURL:'',
            tooltipID:'tooltip'
        };
        
        //s = settings
        var s = $.extend({}, $.fn.tooltip.defaultsSettings , instanceSettings || {});

        var positionTooltip = function(e){
            
            var posx = 0;
            var posy = 0;
            if (!e) var e = window.event;
            if (e.pageX || e.pageY)     {
                posx = e.pageX;
                posy = e.pageY;
            }
            else if (e.clientX || e.clientY)    {
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            
            var p = {
                x: posx + s.positionLeft, 
                y: posy + s.positionTop,
                w: $('#'+s.tooltipID).width(), 
                h: $('#'+s.tooltipID).height()
            }
            
            var v = {
                x: $(window).scrollLeft(),
                y: $(window).scrollTop(),
                w: $(window).width() - 20,
                h: $(window).height() - 20
            };
                
            //don't go off screen
            if(p.y + p.h > v.y + v.h && p.x + p.w > v.x + v.w){
                p.x = (p.x - p.w) - 45;
                p.y = (p.y - p.h) - 45;
            }else if(p.x + p.w > v.x + v.w){
                p.x = p.x - (((p.x+p.w)-(v.x+v.w)) + 20);
            }else if(p.y + p.h > v.y + v.h){
                p.y = p.y - (((p.y+p.h)-(v.y+v.h)) + 20);
            }
            
            $('#'+s.tooltipID).css({'left':p.x + 'px','top':p.y + 'px'});
        }
        
        var showTooltip = function(){
            $('#tooltipLoader').remove();
            $('#'+s.tooltipID+' #tooltipContent').show();
            // if($.browser.version == 6){//IE6 only
            // console.log($.browser.version );
                $('#'+s.tooltipID).append(' <!--[if IE 6]> <iframe id="tooltipIE6FixIframe" style="width:'+($('#'+s.tooltipID).width()+parseFloat(s.borderSize)+parseFloat(s.borderSize)+20)+'px;height:'+($('#'+s.tooltipID).height()+parseFloat(s.borderSize)+parseFloat(s.borderSize)+20)+'px;position:absolute;top:-'+s.borderSize+'px;left:-'+s.borderSize+'px;filter:alpha(opacity=0);"src="blank.html"></iframe> <![endif]-->');
            // };
        }
        
        var hideTooltip = function(valueOfThis){
            $('#'+s.tooltipID).fadeOut('fast').trigger("unload").remove();
            if($(valueOfThis).filter('[title]')){
                $(valueOfThis).attr('title',s.titleAttributeContent);
            }
        }
        
        var urlQueryToObject = function(s){
              var query = {};
              s.replace(/b([^&=]*)=([^&=]*)b/g, function (m, a, d) {
                if (typeof query[a] != 'undefined') {
                  query[a] += ',' + d;
                } else {
                  query[a] = d;
                }
              });
              return query;
        };
        
        return this.each(function(index){
            
            if(s.cancelClick){
                $(this).bind("click", function(){return false});
            }
            
            if($.fn.hoverIntent){
                $(this).hoverIntent({
                    sensitivity:s.hoverIntent.sensitivity,
                    interval:s.hoverIntent.interval,
                    over:on,
                    timeout:s.hoverIntent.timeout,
                    out:off
                });
            }else{
                $(this).hover(on,off);
            }
                      
            function on(e){ 
                var append = '';
                if(s.tooltipBGImage != '') {
                    append = '<div id="'+s.tooltipID+'" style="background-repeat:no-repeat;background-image:url('+s.tooltipBGImage+');padding:'+s.tooltipPadding+'px;display:none;height:'+s.height+';width:'+s.width+';background-color:'+s.tooltipBGColor+';border:'+s.borderSize+'px solid '+s.borderColor+'; position:absolute;z-index:100000000000;"><div id="tooltipContent" style="display:none;"></div></div>';
                } else {
                    append = '<div id="'+s.tooltipID+'" style="padding:'+s.tooltipPadding+'px;display:none;height:'+s.height+';width:'+s.width+';background-color:'+s.tooltipBGColor+';border:'+s.borderSize+'px solid '+s.borderColor+'; position:absolute;z-index:100000000000;"><div id="tooltipContent" style="display:none;"></div></div>';
                }
                $('body').append(append);
                
                var $tt = $('#'+s.tooltipID);
                var $ttContent = $('#'+s.tooltipID+' #tooltipContent');
                
                if(s.loader && s.loaderImagePath != ''){
                    $tt.append('<div id="tooltipLoader" style="width:'+s.loaderWidth+'px;height:'+s.loaderHeight+'px;"><img src="'+s.loaderImagePath+'" /></div>'); 
                }
                
                if($(this).attr('title')){
                    s.titleAttributeContent = $(this).attr('title');
                    $(this).attr('title','');
                }
                
                if($(this).is('input')){
                    $(this).focus(function(){ hideTooltip(this); });
                }
                
                // e.preventDefault();//stop
                $(this).one('click',function() { hideTooltip(this)});

                positionTooltip(e);
                
                $tt.show();
                
                //get values from element clicked, or assume its passed as an option
                s.tooltipSourceID = $(this).attr('href') || s.tooltipSourceID;
                s.tooltipSourceURL = $(this).attr('href') || s.tooltipSourceURL;
                
                switch(s.tooltipSource){
                    case 'attribute':/*/////////////////////////////// attribute //////////////////////////////////////////*/
                        $ttContent.text(s.titleAttributeContent);
                        showTooltip();
                    break;
                    case 'inline':/*/////////////////////////////// inline //////////////////////////////////////////*/
                        $ttContent.html($(s.tooltipSourceID).html());
                        // console.log($(s.tooltipSourceID));
                        $tt.unload(function(){// move elements back when you're finished
                            $(s.tooltipSourceID).html($ttContent.html());               
                        });
                        showTooltip();
                    break;
                    case 'html':/*//////////////////////////////    html    ///////////////////////////////////////*/
                        $ttContent.html(s.sourceHtml);
                        showTooltip();
                    break;

                    case 'ajax':/*/////////////////////////////// ajax //////////////////////////////////////////*/ 
                        if(s.tooltipHTTPType == 'post'){
                            var urlOnly, urlQueryObject;
                            if(s.tooltipSourceURL.indexOf("?") !== -1){//has a query string
                                urlOnly = s.windowSourceURL.substr(0, s.windowSourceURL.indexOf("?"));
                                urlQueryObject = urlQueryToObject(s.tooltipSourceURL);
                            }else{
                                urlOnly = s.tooltipSourceURL;
                                urlQueryObject = {};
                            }
                            $ttContent.load(urlOnly,urlQueryObject,function(){
                                showTooltip();
                            });
                        }else{
                            if(s.tooltipSourceURL.indexOf("?") == -1){ //no query string, so add one
                                s.tooltipSourceURL += '?';
                            }
                            $ttContent.load(
                                s.tooltipSourceURL + '&random=' + (new Date().getTime()),function(){
                                showTooltip();
                            });
                        }
                    break;
                };
                
                return false;
                
            };
            
            
            function off(e){
                hideTooltip(this);
                return false;
            };
            
            if(s.followMouse){
                $(this).bind("mousemove", function(e){
                    positionTooltip(e);
                    return false;
                });
            }
            
        });
    };
    
})(jQuery);

//////////////////////////////////////////////////
function printObjectProperties(o) {
    var output = '';
    for(property in o) {
        output += property + ': ' + o[property] + ';';
    }
    if(console ) {
        console.log('printObjectProperties: ' + output);
    }
}
function shownav() {
    $("#navwrapper").removeClass("hidenav").addClass("shownav");
    $("#logowrapper").addClass('ahover').removeClass('anormal');
}

function hidenav() {
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


$(document).ready(function() {

    var cfg = {
        over: shownav,
        out: hidenav,
        selector: null,
        timeout: 300,
        sensitivity: 30
    };
    $("#menuwrapper").hoverIntent(cfg);

    //search bar auto lengthening
    $("div.menusearchbox input").mousedown(function() {
        if ($(this).data('lengthy') != true) {
            $(this).addClass('length95');
            $(this).data('lengthy', true);
        }
    });

    $("div.menusearchbox input").blur(function(e) {
        if ($(this).data('lengthyclick')) {
            $('div.menusearchbox form').submit();
            $(this).data('lengthy', false);

        }
        if ($(this).data('lengthy')) {
            $(this).removeClass('length95');
            $(this).data('lengthy', false);
        }

    });

    $("div.menusearchbox button").mousedown(function(e) {
        if ($('div.menusearchbox input').data('lengthy')) {
            $('div.menusearchbox input').data('lengthyclick', true);
        } else {
            $('div.menusearchbox input').data('lengthyclick', false);
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

    function() {
        var n = $(this).data('menuitem');
        switch (n) {
            case 'first':
                $('#logowrapper').text('First');
                var t = $(this).find('span.menutext').text();
                $('div.menusearchbox input').attr('placeholder', t)
                break;
            case 'second':
                var t = $(this).find('span.menutext').text();
                $('div.menusearchbox input').attr('placeholder', t)
                $('#logowrapper').text('Second');
                break;
            case 'third':
                var t = $(this).find('span.menutext').text();
                $('div.menusearchbox input').attr('placeholder', t)
                $('#logowrapper').text('Third');
                break;
            case 'fourth':
                var t = $(this).find('span.menutext').text();
                $('div.menusearchbox input').attr('placeholder', t)
                $('#logowrapper').text('Fourth');
                break;
        }

    }, function() {
        var ot = $('#logowrapper').data('otext');
        var op = $('#logowrapper').data('oplaceholder');
        $('#logowrapper').text(ot);
        $('div.menusearchbox input').attr('placeholder', op);
    });


    var cfg2 = {
        over: showstatebar,
        out: hidestatebar,
        selector: null,
        timeout: 300,
        sensitivity: 30
    };
    $("div.healthystate").hoverIntent(cfg2);


    $("div.physicalslider").noUiSlider({
        range: [0, 100.00],
        start: 0,
        step: 1,
        handles: 1
        // ,serialization: {
        //  to:[$('div.statenumber')]
        //  ,resolution: 0.01
        // }
        ,
        slide: function() {
            var r = $(this).val();
            var g = $('div.mentalslider').val() ? $('div.mentalslider').val() : 0;
            var b = $('div.socialslider').val() ? $('div.socialslider').val() : 0;
            console.log('when sliding,r = ' + r, ' b= ' + b + ' g =' + g);
            refreshColorSpace(r, g, b);
            dataLevel(r, $('div.physical em.value'), $('div.physical span.statelevel'), 'statelevel');
        }
    });


    $("div.mentalslider").noUiSlider({
        range: [0, 100],
        start: 0,
        step: 1,
        handles: 1,
        slide: function() {
            var g = $(this).val();
            var r = $('div.physicalslider').val() ? $('div.physicalslider').val() : 0;
            var b = $('div.socialslider').val() ? $('div.socialslider').val() : 0;
            console.log('when sliding,r = ' + r, ' b= ' + b + ' g =' + g);
            refreshColorSpace(r, g, b);
            dataLevel(g, $('div.mental em.value'), $('div.mental span.statelevel'), 'statelevel');
        }
    });

    $("div.socialslider").noUiSlider({
        range: [0, 100],
        start: 0,
        step: 1,
        handles: 1,
        slide: function() {
            var b = $(this).val();
            var r = $('div.physicalslider').val();
            var g = $('div.mentalslider').val() ? $('div.mentalslider').val() : 0;
            refreshColorSpace(r, g, b);
            dataLevel(b, $('div.social em.value'), $('div.social span.statelevel'), 'statelevel');
        }
    });


    $('span.titlepart').each(function() {
        $(this).hide();
    });


    $('div.mental , div.physical , div.social').each(function() {

        var cfg = {
            over: function() {
                $(this).find('span.titlepart').show();
            },
            out: function() {
                $(this).find('span.titlepart').hide();
            },
            selector: null,
            timeout: 300,
            sensitivity: 30
        };
        $(this).hoverIntent(cfg);
    });


    // create tooltips .
    // $("div.slidercontainer").tooltip({
    //     attributeName:'title',
    //         borderColor:'#ccc',
    //         borderSize:'1',
    //         cancelClick:0,
    //         followMouse:1,
    //         height:'auto',
    //         hoverIntent:{sensitivity:7,interval:100,timeout:0},
    //         loader:0,
    //         loaderHeight:0,
    //         loaderImagePath:'',
    //         loaderWidth:0,
    //         positionTop: 12,
    //         positionLeft: 12,
    //         width:'auto',
    //         titleAttributeContent:'',
    //         tooltipBGColor:'#fff',
    //         tooltipBGImage:'', // http path
    //         tooltipHTTPType:'get',
    //         tooltipPadding:10,
    //         tooltipSource:'inline', //inline, ajax, iframe, attribute
    //         sourceHtml:'',
    //         tooltipSourceID:'#dragtip',
    //         tooltipSourceURL:'',
    //         tooltipID:'tooltip'        
    // });
});

function hexFromRGB(r, g, b) {

    r = Math.ceil(r * 255 / 100);
    g = Math.ceil(g * 255 / 100);
    b = Math.ceil(b * 255 / 100);

    var hex = [
        r.toString(16),
        g.toString(16),
        b.toString(16)
    ];
    $.each(hex, function(nr, val) {
        if (val.length === 1) {
            hex[nr] = "0" + val;
        }
    });
    return hex.join("").toUpperCase();
}

function refreshColorSpace(r, g, b) {

    hex = hexFromRGB(r, g, b);
    console.log('when refreshing colorspace, hex = #' + hex);
    $("div.slidercontainer div.colorspace").css("background-color", "#" + hex);
}

// predefined data.
var state = ['worst', 'bad', 'not good', 'not bad', 'good', 'best'],
    o = [1, 10, 30, 50, 80, 90, 100];

function classifyNumber(n, arr) {
    var temp = 0;
    if (n >= 100) {
        temp = 5;
    } else {

        for (var i = 0; i < arr.length; i++) {
            if (n >= arr[i] && (i + 1) < arr.length && n < arr[i + 1]) {
                temp = i;
                break;
            }
        }

    }
    return {
        'cl': 'level' + (temp + 1),
        'content': state[temp]
    };
}

function dataLevel(num, val_o, content_o, original_c) {
    var r = classifyNumber(num, o);
    val_o.text(num);
    console.log(r);
    // set healthy state content
    content_o.text(r['content']);

    // set css class
    content_o.attr('class', '');
    content_o.attr('class', original_c + '  ' + r['cl']);
    console.log(val_o,content_o);
    console.log('when calling dataLevel function, num = ' + num + ' emvalue object = ' + val_o.text() + ' statelevel object = ' +
        content_o.text());
}