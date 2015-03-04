//** Chrome Drop Down Menu- Author: Dynamic Drive (http://www.dynamicdrive.com)

//** Updated: July 14th 06' to v2.0
	//1) Ability to "left", "center", or "right" align the menu items easily, just by modifying the CSS property "text-align".
	//2) Added an optional "swipe down" transitional effect for revealing the drop down menus.
	//3) Support for multiple Chrome menus on the same page.

//** Updated: Nov 14th 06' to v2.01- added iframe shim technique

//** Updated: July 23rd, 08 to v2.4
	//1) Main menu items now remain "selected" (CSS class "selected" applied) when user moves mouse into corresponding drop down menu. 
	//2) Adds ability to specify arbitrary HTML that gets added to the end of each menu item that carries a drop down menu (ie: a down arrow image).
	//3) All event handlers added to the menu are now unobstrusive, allowing you to define your own "onmouseover" or "onclick" events on the menu items.
	//4) Fixed elusive JS error in FF that sometimes occurs when mouse quickly moves between main menu items and drop down menus

//** Updated: Oct 29th, 08 to v2.5 (only .js file modified from v2.4)
	//1) Added ability to customize reveal animation speed (# of steps)
	//2) Menu now works in IE8 beta2 (a valid doctype at the top of the page is required)
        
//** Updated: Feb 4th, 2015 adaptation for use in CleanFlight by tricopterY - this is a quick hack and not usable in production

var selectedRelease;
var fcList = [
    {name: 'AlienWiiF1', revision: '1.0', image: 'AlienWiiF1'},
    {name: 'CJMCU', revision: '1.0', image: 'CJMCU'},
    {name: 'CC3D', revision: '1.0', image: 'AlianWiiF1'},
    {name: 'Naze', revision: '1.0', image: 'AlianWiiF1'},
    {name: 'Sparky', revision: '1.0', image: 'CJMCU'}
];


var cssdropdown={
disappeardelay: 250, //set delay in miliseconds before menu disappears onmouseout
dropdownindicator: '<img src="./images/down.svg" border="0" />', //specify full HTML to add to end of each menu item with a drop down menu
enablereveal: [true, 5], //enable swipe effect? [true/false, steps (Number of animation steps. Integer between 1-20. Smaller=faster)]
enableiframeshim: 1, //enable "iframe shim" in IE5.5 to IE7? (1=yes, 0=no)

//No need to edit beyond here////////////////////////

dropmenuobj: null, asscmenuitem: null, domsupport: document.all || document.getElementById, standardbody: null, iframeshimadded: false, revealtimers: {},

getposOffset:function(what, offsettype){
	var totaloffset=(offsettype=="left")? what.offsetLeft : what.offsetTop;
	var parentEl=what.offsetParent;
	while (parentEl!=null){
		totaloffset=(offsettype=="left")? totaloffset+parentEl.offsetLeft : totaloffset+parentEl.offsetTop;
		parentEl=parentEl.offsetParent;
	}
	return totaloffset;
},

css:function(el, targetclass, action){
	var needle=new RegExp("(^|\\s+)"+targetclass+"($|\\s+)", "ig")        
	if (action=="check")
		return needle.test(el.className)
	else if (action=="remove")
		el.className=el.className.replace(needle, "")
	else if (action=="add" && !needle.test(el.className))
		el.className+=" "+targetclass
},

showmenu:function(dropmenu, e){
	if (this.enablereveal[0]){
		if (!dropmenu._trueheight || dropmenu._trueheight<10)
			dropmenu._trueheight=dropmenu.offsetHeight
		clearTimeout(this.revealtimers[dropmenu.id])
		dropmenu.style.height=dropmenu._curheight=0
		dropmenu.style.overflow="hidden"
		dropmenu.style.visibility="visible"
		this.revealtimers[dropmenu.id]=setInterval(function(){cssdropdown.revealmenu(dropmenu)}, 10)
	}
	else{
		dropmenu.style.visibility="visible"
	}
	this.css(this.asscmenuitem, "selected", "add")
},

revealmenu:function(dropmenu, dir){
	var curH=dropmenu._curheight, maxH=dropmenu._trueheight, steps=this.enablereveal[1]
	if (curH<maxH){
		var newH=Math.min(curH, maxH)
		dropmenu.style.height=newH+"px"
		dropmenu._curheight= newH + Math.round((maxH-newH)/steps) + 1
	}
	else{ //if done revealing menu
		dropmenu.style.height="auto"
		dropmenu.style.overflow="hidden"
		clearInterval(this.revealtimers[dropmenu.id])
	}
},

clearbrowseredge:function(obj, whichedge){
	var edgeoffset=0
	if (whichedge=="rightedge"){
		var windowedge=document.all && !window.opera? this.standardbody.scrollLeft+this.standardbody.clientWidth-15 : window.pageXOffset+window.innerWidth-15
		var dropmenuW=this.dropmenuobj.offsetWidth
		if (windowedge-this.dropmenuobj.x < dropmenuW)  //move menu to the left?
			edgeoffset=dropmenuW-obj.offsetWidth
	}
	else{
		var topedge=document.all && !window.opera? this.standardbody.scrollTop : window.pageYOffset
		var windowedge=document.all && !window.opera? this.standardbody.scrollTop+this.standardbody.clientHeight-15 : window.pageYOffset+window.innerHeight-18
		var dropmenuH=this.dropmenuobj._trueheight
		if (windowedge-this.dropmenuobj.y < dropmenuH){ //move up?
			edgeoffset=dropmenuH+obj.offsetHeight
			if ((this.dropmenuobj.y-topedge)<dropmenuH) //up no good either?
				edgeoffset=this.dropmenuobj.y+obj.offsetHeight-topedge
		}
	}
	return edgeoffset
},

dropit:function(obj, e, dropmenuID){
	if (this.dropmenuobj!==null) //hide previous menu
		this.hidemenu(); //hide menu
	this.clearhidemenu();
	this.dropmenuobj=document.getElementById(dropmenuID); //reference drop down menu                              
	this.asscmenuitem=obj //reference associated menu item 
        cssdropdown.processReleases();
	this.showmenu(this.dropmenuobj, e)
	this.dropmenuobj.x=this.getposOffset(obj, "left")
	this.dropmenuobj.y=this.getposOffset(obj, "top")
	this.dropmenuobj.style.left=this.dropmenuobj.x-this.clearbrowseredge(obj, "rightedge")+"px"
	this.dropmenuobj.style.top=this.dropmenuobj.y-this.clearbrowseredge(obj, "bottomedge")+obj.offsetHeight+1+"px"
	this.positionshim() //call iframe shim function
},

positionshim:function(){ //display iframe shim function
	if (this.iframeshimadded){
		if (this.dropmenuobj.style.visibility=="visible"){
			this.shimobject.style.width=this.dropmenuobj.offsetWidth+"px"
			this.shimobject.style.height=this.dropmenuobj._trueheight+"px"
			this.shimobject.style.left=parseInt(this.dropmenuobj.style.left)+"px"
			this.shimobject.style.top=parseInt(this.dropmenuobj.style.top)+"px"
			this.shimobject.style.display="block"
		}
	}
},

hideshim:function(){
	if (this.iframeshimadded)
		this.shimobject.style.display='none'
},

isContained:function(m, e){
	var e=window.event || e
	var c=e.relatedTarget || ((e.type=="mouseover")? e.fromElement : e.toElement)
	while (c && c!=m)try {c=c.parentNode} catch(e){c=m}
	if (c==m)
		return true
	else
		return false
},

dynamichide:function(m, e){
	if (!this.isContained(m, e)){
		this.delayhidemenu()
	}
},

delayhidemenu:function(){
	this.delayhide=setTimeout("cssdropdown.hidemenu()", this.disappeardelay) //hide menu
},

hidemenu:function(){
    if (this.asscmenuitem !==""){ 
	this.css(this.asscmenuitem, "selected", "remove")
	this.dropmenuobj.style.visibility='hidden'
	this.dropmenuobj.style.left=this.dropmenuobj.style.top="-1000px"
	this.hideshim()
    }
},

clearhidemenu:function(){
	if (this.delayhide!="undefined")
		clearTimeout(this.delayhide)
},

addEvent:function(target, functionref, tasktype){
	if (target.addEventListener)
		target.addEventListener(tasktype, functionref, false);
	else if (target.attachEvent)
		target.attachEvent('on'+tasktype, function(){return functionref.call(target, window.event)});
},

startchrome:function(){
	if (!this.domsupport)
		return;
	this.standardbody=(document.compatMode==="CSS1Compat")? document.documentElement : document.body;
        
        var fclist_e = $('ul.flightControllerList');//
        fclist_e.append('<li><a href="https://github.com/cleanflight/cleanflight/releases" title="Navigate to Release Repository to download older versions" target="_blank">Release Repository</a></li>');
        for (var i = 0; i < fcList.length; i++) {            
            fclist_e.append('<li><a href="#" rel="selectedFC" name="'+fcList[i].name+'">' + fcList[i].name + '</a></li>');            
        }
                
        
                //for (var ids=0; ids<arguments.length; ids++){
		//var menuitems=document.getElementById(arguments[ids]).getElementsByTagName("a");
                var menuitems=document.getElementsByTagName("a");
                
		for (var i=0; i<menuitems.length; i++){
			if (menuitems[i].getAttribute("rel")){
				var relvalue=menuitems[i].getAttribute("rel");
				var asscodropdownmenu=document.getElementById(relvalue);                                
				this.addEvent(asscodropdownmenu, function(){cssdropdown.clearhidemenu();}, "mouseover");
				this.addEvent(asscodropdownmenu, function(e){cssdropdown.dynamichide(this, e);}, "mouseout");
				this.addEvent(asscodropdownmenu, function(){cssdropdown.delayhidemenu();}, "click");
				try{
					menuitems[i].innerHTML=menuitems[i].innerHTML+" "+this.dropdownindicator;
				}catch(e){}
                                
				this.addEvent(menuitems[i], function(e){ //show drop down menu when main menu items are clicked //mouse over-ed
					if (cssdropdown.isContained(this, e)){
						var evtobj=window.event || e;
						cssdropdown.dropit(this, evtobj, this.getAttribute("rel"));
					}
				}, "click");
                                
				this.addEvent(menuitems[i], function(e){cssdropdown.dynamichide(this, e);}, "mouseout"); //hide drop down menu when main menu items are mouse out
				this.addEvent(menuitems[i], function(){cssdropdown.dynamichide()}, "click") //hide drop down menu when main menu items are clicked on
			}
		} //end inner for
	//} //end outer for
	if (this.enableiframeshim && document.all && !window.XDomainRequest && !this.iframeshimadded){ //enable iframe shim in IE5.5 thru IE7?
		document.write('<IFRAME id="iframeshim" src="about:blank" frameBorder="0" scrolling="no" style="left:0; top:0; position:absolute; display:none;z-index:90; background: transparent;"></IFRAME>')
		this.shimobject=document.getElementById("iframeshim") //reference iframe object
		this.shimobject.style.filter='progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)'
		this.iframeshimadded=true
	}
}, //end startchrome

/************************/

processReleases:function (){    
            
    $.get('https://api.github.com/repos/cleanflight/cleanflight/releases', function (releases){
           
            if (cssdropdown.dropmenuobj===null) 
                return;                            
            selectedRelease = null;
            var releases_e = cssdropdown.dropmenuobj;
             //make sure we lock, in each iteration            
            $("a.load_remote_file").addClass('locked');            
            $('a.loading').empty();
            releases_e.innerHTML='<a  name="loading">Loading....</a>';
                        
            for (var releaseIndex = 0; releaseIndex < releases.length; releaseIndex++) {
                if (releaseIndex > 3) //only grab the latest four versions
                    break;
                var iteration = 0;
                $.get(releases[releaseIndex].assets_url).done(
                        (function (releases, releaseIndex, releases_e, assets) {

                            var release = releases[releaseIndex];
                            for (var assetIndex = 0; assetIndex < assets.length; assetIndex++) {

                                var asset = assets[assetIndex];
                                var targetFromFilenameExpression = /.*_(.*)\.(.*)/;
                                var match = targetFromFilenameExpression.exec(asset.name);
                                if (!match) {
                                    continue;
                                }
                                var target = match[1];

                                if (target !== cssdropdown.asscmenuitem.getAttribute('name').toUpperCase()) {
                                    continue;
                                }
                                ;

                                var format = match[2];

                                if (format !== 'hex') {
                                    continue;
                                }
                                ;

                                var date = new Date(release.published_at);
                                var pattern = new String("{0}-{1}-{2} {3}:{4}");

                                var formattedDate = pattern.format(
                                        date.getFullYear(),
                                        date.getMonth() + 1,
                                        date.getDate(),
                                        date.getUTCHours(),
                                        date.getMinutes()
                                        );

                                var summary = {
                                    "releaseUrl": release.html_url,
                                    "name": release.name,
                                    "url": asset.browser_download_url,
                                    "file": asset.name,
                                    "target": target,
                                    "date": formattedDate,
                                    "notes": release.body,
                                    "status": release.prerelease ? "release-candidate" : "stable",
                                    "class": release.prerelease ? "ui-state-disabled" : "releaseList"
                                };

                                var select_e = 
                                    $("<a href='#' id='{0}_{1}' class='{2}'> {3} {4} {5} ({6})</a>".format(
                                        releaseIndex,
                                        assetIndex,
                                        summary.class,
                                        summary.name,
                                        summary.target,
                                        summary.date,
                                        summary.status
                                        )).data('summary', summary);
                                                                                      
                                if (iteration === 0)
                                    $('div[class="dropmenudiv"]').empty().append(select_e);
                                    //$('a[name="loading"]').replaceWith(select_e);
                                else
                                    $('div[class="dropmenudiv"]').append(select_e);
                                    //releases_e.innerHTML += select_e;
                                iteration++;                               
                            }
                        }).bind(this, releases, releaseIndex, releases_e)
                );
            }
           
            $(document).on('click', "a.releaseList", function () {
                //var releaseId = $(this).attr("id");
                selectedRelease = $(this).data('summary');
                //GUI.log(summary.date);
                cssdropdown.hidemenu();
                if (selectedRelease === null) 
                    $("a.load_remote_file").addClass('locked');                
                else 
                    $("a.load_remote_file").removeClass('locked');
                
                if (!GUI.connect_lock) {
                    $('.progress').val(0).removeClass('valid invalid');
                    $('span.progressLabel').text(chrome.i18n.getMessage('firmwareFlasherLoadFirmwareFile'));
                    $('div.git_info').slideUp();
                    $('div.release_info').slideUp();
                    $('a.flash_firmware').addClass('locked');
                }
                $('span.progressLabel').text("Click on Load Firmware [online] to fetch  ->  {0} -- {1}".format(
                        selectedRelease.target,
                        selectedRelease.name)
                        );
            });                    

        }).fail(function (data) {
            if (data["responseJSON"]) {
                GUI.log("<b>GITHUB Query Failed: <code>{0}</code></b>".format(data["responseJSON"].message));
            }
            $('div[class="dropmenudiv"]').empty().append('<a>Offline</a>');
        });                                                                            
        
    }
};
 
