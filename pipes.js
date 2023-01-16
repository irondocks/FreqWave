 /*
    use:        onclick="pipes(this)"
    to begin using the PipesJS code.
    Usable DOM Attributes:
    Attribute   |   Use Case
    -------------------------------------------------------------
    query.......= default query string associated with url
    pipe........= name of id
    goto........= URI to go to
    ajax........= calls and returns this files output
    fileOrder...= ajax to these files, iterating [0,1,2,3]%array.length per call
    index.......= counter of which index to use with file-order to go with ajax
    incrIndex...= increment thru index of file-order (0 moves once) (default: 1)
    decrIndex...= decrement thru index of file-order (0 moves once) (default: 1)
    redirect....= "follow" the ajax call in POST or GET mode
    mode........= "POST" or "GET" (default: "POST")
    data-pipe...= name of class for multi-tag data (augment with pipe)
    multiple....= states that this object has two or more key/value pairs
    remove......= remove element in tag
    display.....= toggle visible and invisible
    insert......= return ajax call to this id
    json........= returns a JSON file set as value
    fs-opts.....= JSON headers for AJAX implementation
    headers.....= headers in CSS markup-style-attribute
    link........= class for operating tag as clickable link
    !!! ALL HEADERS FOR AJAX are available. They will use defaults to
    !!! go on if there is no input to replace them.
*/

function fileOrder(elem)
{
    arr = elem.getAttribute("file-order").split(",");
    index = parseInt(elem.getAttribute("index").toString());
    arr[index];
    if (elem.hasAttribute("incrIndex"))
        index += parseInt(elem.getAttribute("incrIndex").toString()) + 1;
    if (elem.hasAttribute("decrIndex"))
        index -= Math.abs(parseInt(elem.getAttribute("decrIndex").toString())) - 1;
    if (index < 0)
        index = arr.length-1;
    index = index%arr.length;
    elem.setAttribute("index",index.toString());
    pfc = elem.firstChild;
    console.log(pfc);
    console.log(index);
    ppfc = pfc.nextElementSibling;
    ppfc.setAttribute("src",arr[index]);
}

function display(elem)
{
    // Toggle visibility of CSS display style of object
    if (elem.hasOwnProperty("display"))
    {
        var toggle = elem.getAttribute("display");
        doc_set = document.getElementById(toggle);
        if (document.getElementById(toggle) && doc_set.style.display !== "none"){
            doc_set.style.display = "none";
        }
        else if (document.getElementById(toggle) && doc_set.style.display === "none")
        {
            doc_set.style.display = "block";
        }
    }
}

function remove(elem)
{
    // Remove Object
    if (elem.hasOwnProperty("remove"))
    {
        var rem = elem.getAttribute("remove");
        if (document.getElementById(rem)) {
            doc_set = document.getElementById(rem);
            doc_set.remove();
        }
        doc_set.parentNode.removeChild(doc_set);
        
    }
}

function setAJAXOpts(elem, opts)
{
    // communicate properties of Fetch Request
    var method_thru = (opts["method"] !== undefined) ? opts["method"] : (elem == undefined || !elem.hasAttribute("method")) ? "GET" : elem.getAttribute("method");
    var mode_thru = (opts["mode"] !== undefined) ? opts["mode"]: (elem == undefined || !elem.hasAttribute("mode")) ? "no-cors" : elem.getAttribute("mode");
    var cache_thru = (opts["cache"] !== undefined) ? opts["cache"]: (elem == undefined || !elem.hasAttribute("cred")) ? "no-cache" : elem.getAttribute("cache");
    var cred_thru = (opts["cred"] !== undefined) ? opts["cred"]: (elem == undefined || !elem.hasAttribute("cred")) ? "same-origin" : elem.getAttribute("cred");
    // updated "headers" attribute to more friendly "content-type" attribute
    var content_thru = (opts["headers"] !== undefined) ? opts["headers"]: (elem == undefined || !elem.hasAttribute("headers")) ? '{"Access-Control-Allow-Origin":"*","Content-Type":"text/html"}' : elem.getAttribute("headers");
    var redirect_thru = (opts["redirect"] !== undefined) ? opts["redirect"]: (elem == undefined || !elem.hasAttribute("redirect")) ? "manual" : elem.getAttribute("redirect");
    var refer_thru = (opts["referrer"] !== undefined) ? opts["referrer"]: (elem == undefined || !elem.hasAttribute("referrer")) ? "client" : elem.getAttribute("referrer");
    opts = new Map();
    opts.set("method", method_thru); // *GET, POST, PUT, DELETE, etc.
    opts.set("mode", mode_thru); // no-cors, cors, *same-origin
    opts.set("cache", cache_thru); // *default, no-cache, reload, force-cache, only-if-cached
    opts.set("credentials", cred_thru); // include, same-origin, *omit
    opts.set("content-type", content_thru); // content-type UPDATED**
    opts.set("redirect", redirect_thru); // manual, *follow, error
    opts.set("referrer", refer_thru); // no-referrer, *client
    opts.set('body', JSON.stringify(content_thru));
    const abort_ctrl = new AbortController();
    const signal = abort_ctrl.signal;

    return opts;
}

function pipes(el) {

    elem = document.getElementById(el.id);
    opts = new Map();

    if (elem.hasAttribute("ajax") && elem.getAttribute("ajax"))
    {
        if (elem.classList.contains("link"))
        {
            window.location.href = elem.getAttribute("ajax");
            return;
        }
        if (elem.hasAttribute("query"))
        {
            var optsArray = elem.getAttribute("query").split(";");

            var p = document.createElement("p");
            optsArray.forEach((e,f) => {
                var g = e.split(":");
                p.setAttribute(g[0], g[1]);
            });

            if (elem.hasAttribute("headers"))
            {
                var optsArray = elem.getAttribute("headers").split(";");
                optsArray.forEach((e,f) => {
                    var g = e.split(":");
                    p.setAttribute(g[0], g[1]);
                });
            }

            p.click();
            navigate(p);
            p.remove();
            return;
        }
        if (elem.hasAttribute("headers"))
        {
            var optsArray = elem.getAttribute("headers").split(";");
            optsArray.forEach((e,f) => {
                var g = e.split(":");
                p.setAttribute(g[0], g[1]);
            });

            p.click();
            navigate(p);
            return;
        }
        if (elem.hasAttribute("query"))
        {
            var optsArray = elem.getAttribute("query").split(";");
            optsArray.forEach((e,f) => {
                var g = e.split(":");
                p.setAttribute(g[0], g[1]);
            });

            p.click();
            navigate(p);
            return;
        }
        if (elem.hasAttribute("fs-opts"))
        {
            var fs=require('fs');
            var json = elem.getAttribute("fs-opts").toString();
            var data=fs.readFileSync(json, 'utf8');
            var words=JSON.parse(data);
            var opts = setAJAXOpts(words);
            navigate(elem, opts, null);
        }
        if (elem.hasAttribute("json") && elem.getAttribute("json"))
        {
            var fs=require('fs');
            var json = elem.getAttribute("json").toString();
            var data=fs.readFileSync(json, 'utf8');
            var words=JSON.parse(data);
            return words;
        }
        if (elem.hasAttribute("insert") && elem.getAttribute("insert"))
        {
            document.getElementById(elem.getAttribute("insert").toString()).innerHTML = navigate(elem); // elem.getAttribute("ajax");
        }
    }
    // This is a quick way to make a downloadable link in an href
    else if (ev.target.classList == "download")
    {
        var text = ev.target.getAttribute("file");
        var element = document.createElement('a');
        var location = ev.target.getAttribute("directory");
        element.setAttribute('href', location + encodeURIComponent(text));

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

        return;
    }
    navigate(elem);
}

function formAJAX(el)
{
    elem = document.getElementById(el.id);
    //use 'data-pipe' as the classname to include its value
    // specify which pipe with pipe="target.id"
    var elem_values = document.getElementsByClassName("data-pipe");
    var elem_qstring = (elem.hasAttribute("query")) ? elem.getAttribute("query").toString() : "";

    // No, 'pipe' means it is generic. This means it is open season for all with this class
    for (var i = 0; i < elem_values.length; i++) {
    //if this is designated as belonging to another pipe, it won't be passed in the url
        if (elem_values && !elem_values[i].hasOwnProperty("pipe") || elem_values[i].getAttribute("pipe") == elem.id)
            elem_qstring = elem_qstring + elem_values[i].name + "=" + elem_values[i].value + "&";
        // Multi-select box
        console.log(".");
        if (elem_values[i].hasOwnProperty("multiple"))
        {
            for (var o of elem_values.options) {
                if (o.selected) {
                    elem_qstring = elem_qstring + "&" + elem_values[i].name + "=" + o.value;
                }
            }
        }
    }
    console.log(elem.getAttribute("ajax") + "?" + elem_qstring.substr(1));
    elem_qstring = elem.getAttribute("ajax") + "?" + elem_qstring.substr(1);
    return encodeURI(elem_qstring);
}

function navigate(ev, opts = [], headers = [])
{
    // This is a quick if to make a downloadable link in an href
    if (ev.classList.contains("download"))
    {
        var text = ev.getAttribute("file");
        var element = document.createElement('a');
        var location = ev.getAttribute("directory");
        element.setAttribute('href', location + encodeURIComponent(text));

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

        return;
    }
    if (ev.classList.contains("redirect"))
    {
        window.location.href = ev.getAttribute("ajax") + (ev.hasAttribute("query")) ? "?" + ev.getAttribute("query") : "";
    }
    const elem = ev;
    classToAJAX(elem, opts, headers);
}

// deprecated
// function captureAJAXResponse(elem, opts)
// {
//     f = 0;

//     opts = setAJAXOpts(elem, opts);

//     var opts_req = new Request(elem.getAttribute("ajax").toString());
//     const abort_ctrl = new AbortController();
//     const signal = abort_ctrl.signal;

//     fetch(opts_req, {
//         signal
//     });

//     setTimeout(() => abort_ctrl.abort(), 10 * 1000);
//     const __grab = async (opts_req, opts) => {
//     return fetch(opts_req, opts)
//         .then(function(response) {
//             return response.text().then(function(text) {
//                 if (response.status == 404)
//                     return;
//                 return text;
//             });
//         });
//     }
//     return __grab(opts_req, opts);
// }

function notify(targetname) {

    elem = document.getElementsByTagName(targetname)[0];

    opts = new Map();
    f = 0;

    collectURLData(elem).forEach((e,f) => {
        let header_array = ["POST","no-cors","no-cache"," ",'{"Access-Control-Allow-Origin":"*","Content-Type":"text/html"}', "manual", "client"];
        opts.set(e, header_array[f]);
    });

    content_thru = '{"Access-Control-Allow-Origin":"*","Content-Type":"text/html"}';
    var opts_req = new Request(elem.getAttribute("ajax"));
    opts.set('body', JSON.stringify({"Access-Control-Allow-Origin":"*","Content-Type":"text/html"}));
    const abort_ctrl = new AbortController();
    const signal = abort_ctrl.signal;

    fetch(opts_req, {
        signal
    });

    target__ = targetname;

    setTimeout(() => abort_ctrl.abort(), 10 * 1000);
    const __grab = async (opts_req, opts) => {
    return fetch(opts_req, opts)
        .then(function(response) {
            if (response.status == 404)
                    return;
            return response.text().then(function(text) {
                
                    if (undefined == document.getElementsByTagName(targetname)[0]) {

                        ppr = document.createElement(targetname);
                        ppr.style.position = "absolute";
                        ppr.style.backgroundColor = "navy";
                        ppr.style.wordwrap = true;
                        ppr.style.width = window.innerWidth / 4;
                        ppr.style.zIndex = 3;
                        p.innerText = text;
                        p.style.position = "relative";
                        ppr.setAttribute("notify-ms",3000);
                        document.body.insertBefore(ppr,document.body.firstChild);
                    }
                    else {
                        ppr = document.getElementsByTagName(targetname)[0];
                    }
                        let p = document.createElement("p");
                        p.innerText = text;
                        p.style.position = "relative";
                        ppr.insertBefore(p,ppr.firstChild);
                    var xy = parseInt(elem.getAttribute("notify-ms"));
                    setTimeout(function(){
                        ppr.removeChild(ppr.lastChild);
                    }, xy);
                return;
            });
        });
    }
    __grab(opts_req, opts);
}

function classToAJAX(elem, opts = null, headers = null)
{
	//formAJAX at the end of this line
	elem_qstring = elem_qstring + "&" + elem.name + "=" + elem.value + "&" + formAJAX(elem, opts, headers);
    console.log(elem.getAttribute("ajax") + "?" + elem_qstring);
    elem_qstring = elem.getAttribute("ajax") + "?" + elem_qstring;
    elem_qstring = encodeURI(elem_qstring);

    opts = setAJAXOpts(elem, opts);
    content_thru = '{"Access-Control-Allow-Origin":"*","Content-Type":"text/html"}';
    var opts_req = new Request(elem_qstring);
    opts.set('body', JSON.stringify({"Access-Control-Allow-Origin":"*","Content-Type":"text/html"}));
    const abort_ctrl = new AbortController();
    const signal = abort_ctrl.signal;

    fetch(opts_req, {
        signal
    });

    setTimeout(() => abort_ctrl.abort(), 10 * 1000);
    const __grab =  (opts_req, opts) => {
    return fetch(opts_req, opts)
        .then(function(response) {
            if (response.status == 404)
                return;
            return response.text().then(function(text) {
                {
                    let td = '<p>' + text + '</p>';
                    document.getElementById(elem.getAttribute("insert").toString()).innerHTML = td;
                }
                return;
            });
        });
    }
    __grab(opts_req, opts);
}

function rem(elem)
{
    elem.remove();
}
