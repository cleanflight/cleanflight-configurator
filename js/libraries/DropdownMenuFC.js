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
        
//** Updated: Feb 4th, 2015 adaptation for use in CleanFlight by tricopterY - this is a quick hack and not recommended in production

var cssdropdown = {
disappearDelay: 250, //set delay in miliseconds before menu disappears onmouseout
dropdownIndicator: '<img src="./images/down.svg" border="0" />', //specify full HTML to add to end of each menu item with a drop down menu
enableReveal: [true, 5], //enable swipe effect? [true/false, steps (Number of animation steps. Integer between 1-20. Smaller=faster)]
sortArr: [],
subMenuItem: null,

//No need to edit beyond here////////////////////////

dropMenuObj: null, associateMenuItem: null, domSupport: document.all || document.getElementById, standardBody: null, iframeshimadded: false, revealTimers: {},

getPosOffset: function(what, offsettype){
    var totaloffset = (offsettype === "left")? what.offsetLeft : what.offsetTop;
    var parentEl = what.offsetParent;
    while (parentEl !== null){
        totaloffset = (offsettype === "left")? totaloffset+parentEl.offsetLeft : totaloffset+parentEl.offsetTop;
        parentEl = parentEl.offsetParent;
    }
    return totaloffset;
},

css: function(el, targetclass, action){
    var needle = new RegExp("(^|\\s+)" + targetclass + "($|\\s+)", "ig");        
    if (action === "check")
            return needle.test(el.className);
    else if (action === "remove")
            el.className = el.className.replace(needle, "");
    else if (action === "add" && !needle.test(el.className))
            el.className += " "+targetclass;
},

showMenu: function(dropmenu, e){
    if (this.enableReveal[0]){
        if (!dropmenu._trueheight || dropmenu._trueheight<10)
                dropmenu._trueheight=dropmenu.offsetHeight;
        clearTimeout(this.revealTimers[dropmenu.id]);
        dropmenu.style.height = dropmenu._curheight=0;
        dropmenu.style.overflow = "hidden";
        dropmenu.style.visibility = "visible";
        this.revealTimers[dropmenu.id]=setInterval(function(){cssdropdown.revealMenu(dropmenu);}, 10);
    }
    else{
    	dropmenu.style.visibility = "visible";
    }
    this.css(this.associateMenuItem, "selected", "add");
},

revealMenu: function(dropmenu, dir){
    var curH=dropmenu._curheight, maxH=dropmenu._trueheight, steps=this.enableReveal[1];
    if (curH<maxH){
        var newH = Math.min(curH, maxH);
        dropmenu.style.height = newH+"px";
        dropmenu._curheight = newH + Math.round((maxH-newH)/steps) + 1;
    }
    else{ //if done revealing menu
        dropmenu.style.height = "auto";
        dropmenu.style.overflow = "hidden";
        clearInterval(this.revealTimers[dropmenu.id]);
    }
},

clearBrowserEdge: function(obj, whichedge){
    var edgeoffset=0;
    if (whichedge === "rightedge"){
        var windowedge = document.all && !window.opera
            ? this.standardBody.scrollLeft + this.standardBody.clientWidth - 15 
            : window.pageXOffset+window.innerWidth - 15;
        var dropmenuW = this.dropMenuObj.offsetWidth;
        if (windowedge - this.dropMenuObj.x < dropmenuW)  //move menu to the left?
                edgeoffset = dropmenuW - obj.offsetWidth;
    }
    else{
        var topedge = document.all && !window.opera
            ? this.standardBody.scrollTop 
            : window.pageYOffset;
        var windowedge = document.all && !window.opera
            ? this.standardBody.scrollTop+this.standardBody.clientHeight - 15 
            : window.pageYOffset+window.innerHeight - 18;
        var dropmenuH = this.dropMenuObj._trueheight;
        if (windowedge - this.dropMenuObj.y < dropmenuH){ //move up?
                edgeoffset = dropmenuH+obj.offsetHeight;
                if ((this.dropMenuObj.y - topedge)<dropmenuH) //up no good either?
                        edgeoffset = this.dropMenuObj.y + obj.offsetHeight-topedge;
        }
    }
    return edgeoffset;
},

positionShim: function(){ //display iframe shim function
    if (this.iframeshimadded){
        if (this.dropMenuObj.style.visibility === "visible"){
            this.shimobject.style.width = this.dropMenuObj.offsetWidth + "px";
            this.shimobject.style.height = this.dropMenuObj._trueheight + "px";
            this.shimobject.style.left = parseInt(this.dropMenuObj.style.left) + "px";
            this.shimobject.style.top = parseInt(this.dropMenuObj.style.top) + "px";
            this.shimobject.style.display = "block";
        }
    }
},

hideShim: function(){
    if (this.iframeshimadded)
        this.shimobject.style.display = 'none';
},

isContained: function(m, evt){
    var e = window.event || evt;
    var c = e.relatedTarget || ((e.type === "mouseover") ? e.fromElement : e.toElement);
    while (c && c !== m) try {c = c.parentNode;} catch(e){c = m;};
    if (c === m)
        return true;
    else
        return false;
},

dynamicHide: function(m, e){
    if (!this.isContained(m, e)){
        this.delayhidemenu();
    }
},

delayHideMenu: function(){
    this.delayhide = setTimeout("cssdropdown.hideMenu()", this.disappearDelay); //hide menu
},

hideMenu: function(){
    if (this.associateMenuItem !== ""){ 
	this.css(this.associateMenuItem, "selected", "remove");
	this.dropMenuObj.style.visibility = 'hidden';
	this.dropMenuObj.style.left = this.dropMenuObj.style.top= "-1000px";
	this.hideShim();
    }
},

clearHideMenu: function(){
    if (this.delayhide !== "undefined")
            clearTimeout(this.delayhide);
},

addEvent: function(target, functionref, tasktype){
    if (target.addEventListener)
        target.addEventListener(tasktype, functionref, false);
    else if (target.attachEvent)
        target.attachEvent('on' + tasktype, function(){return functionref.call(target, window.event);});
},

dropSubMenu: function(obj, e, relId){
    if (this.dropMenuObj !== null) //hide previous menu
        this.hideMenu(); //hide menu
    this.clearHideMenu();
    this.dropMenuObj = document.getElementById(relId); //reference dropdown menu                              
    this.associateMenuItem = obj; //reference associated menu item    
    this.buildSubMenu();
    this.showMenu(this.dropMenuObj, e);
    this.dropMenuObj.x = this.getPosOffset(obj, "left");
    this.dropMenuObj.y = this.getPosOffset(obj, "top");
    this.dropMenuObj.style.left = this.dropMenuObj.x - this.clearBrowserEdge(obj, "rightedge") + "px";
    this.dropMenuObj.style.top = this.dropMenuObj.y - this.clearBrowserEdge(obj, "bottomedge") +obj.offsetHeight + 1 + "px";
    this.positionShim(); //call iframe shim function
},

buildDropdownMenu: function(parent, items, related){
    if (!this.domSupport)
        return;
    this.standardBody = (document.compatMode === "CSS1Compat")? document.documentElement : document.body;
        
    for (var i = 0; i < items.length; i++) {        
        parent.append('<li><a href="#" rel="'
                + related
                + '" '
                + 'name="'
                +items[i].name
                +'" title="Only fetches the latest four Releases">'
                + items[i].name
                + '</a></li>'
                );
    }
    
    var menuitems = document.getElementsByTagName("a");

    for (var i = 0; i < menuitems.length; i++){
        if (menuitems[i].getAttribute("rel")){
                var relvalue = menuitems[i].getAttribute("rel");
                var asscodropdownmenu = document.getElementById(relvalue);                                
                this.addEvent(asscodropdownmenu, function(){cssdropdown.clearHideMenu();}, "mouseover");
                this.addEvent(asscodropdownmenu, function(e){cssdropdown.dynamicHide(this, e);}, "mouseout");
                this.addEvent(asscodropdownmenu, function(){cssdropdown.delayHideMenu();}, "click");
                try{
                        menuitems[i].innerHTML = menuitems[i].innerHTML+" "+this.dropdownIndicator;
                }catch(e){}

                this.addEvent(menuitems[i], function(e){ //show drop down menu when main menu items are clicked //don't do mouse over-ed
                        if (cssdropdown.isContained(this, e)){
                                var evtobj = window.event || e;
                                cssdropdown.dropSubMenu(this, evtobj, this.getAttribute("rel"));
                        }                            
                }, "click");
        }
    }    
},

/************************/
processReleases: function (releases) {
    var limit = 3;//zero based, max 4    
    this.sortArr = [];//init
    for (var releaseIndex = 0; releaseIndex < releases.length; releaseIndex++) {
        if (releaseIndex > limit) //we only get the latest four releases
            break;
        $.get(releases[releaseIndex].assets_url).done(
            (function (releases, releaseIndex, assets) {

                var release = releases[releaseIndex];
                for (var assetIndex = 0; assetIndex < assets.length; assetIndex++) {

                    var asset = assets[assetIndex];
                    var targetFromFilenameExpression = /.*_(.*)\.(.*)/;
                    var match = targetFromFilenameExpression.exec(asset.name);
                    if (!match) {
                        continue;
                    }
                    var target = match[1];

                    if (target !== cssdropdown.associateMenuItem.getAttribute('name').toUpperCase()) {
                        continue;
                    }

                    var format = match[2];

                    if (format !== 'hex') {
                        continue;
                    }

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
                        "class": release.prerelease ? "ui-state-disabled" : "release",
                        "id": "{0}_{1}".format(releaseIndex, assetIndex)
                    };

                    var subMenu_e =
                            $("<a href='#' id='{0}' class='{1}'> {2} {3} {4} ({5})</a>".format(
                                    summary.id,
                                    summary.class,
                                    summary.name,
                                    summary.target,
                                    summary.date,
                                    summary.status
                                    )).data('summary', summary);

                    cssdropdown.sortArr.push(subMenu_e);

                    if (cssdropdown.sortArr.length >= limit || releaseIndex === releases.length - 1) {//cater for releases < limit
                        cssdropdown.sortArr.sort(function (a, b) {
                            return a.data('summary').name === b.data('summary').name
                                    ? 0
                                    : (a.data('summary').name < b.data('summary').name ? 1 : -1);
                        });

                        for (var i = 0; i < cssdropdown.sortArr.length; i++) {
                            if (i === 0) //replace 'Loading....'                                     
                                $('a.loading').replaceWith(cssdropdown.sortArr[i]);
                            else
                                $('div.dropmenudiv').append(cssdropdown.sortArr[i]);
                        }
                    }
                }
            }).bind(this, releases, releaseIndex)
        );
    }//for release
},

buildSubMenu: function () {

    if (this.dropMenuObj === null)
        return;

    this.subMenuItem = null;
    //make sure we lock, in each iteration            
    $("a.load_remote_file").addClass('locked');
    $('div[class="dropmenudiv"]').empty().append('<a class="loading">Loading....</a>');
    $.get('https://api.github.com/repos/cleanflight/cleanflight/releases', function (releases) {

        cssdropdown.processReleases(releases);

        //UI Hooks
        $(document).on('click', 'div.options, div.warning', function () {
            cssdropdown.hideMenu();
        });

        $(document).on('click', 'a.release', function () {
            cssdropdown.subMenuItem = $(this).data('summary');
            cssdropdown.hideMenu();

            if (cssdropdown.subMenuItem === null)
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
            
            $('span.progressLabel').text("{0} -- {1}  ~  click on Load Firmware [online] to fetch".format(
                    cssdropdown.subMenuItem.target,
                    cssdropdown.subMenuItem.name)
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
