var c = {
    _styles: {
        str: 'background: #d9edf7; padding: 2px 2px; border-bottom: 1px solid #31708f;',
        sys: 'background: #d9edf7; padding: 2px 2px; border-bottom: 1px solid #31708f; font-weight: bold;',
        obj: 'padding: 2px 0px;'
    },
    _targets: {
        popup: true,
        background: false,
        content: true
    },

    log: function() { c._write("log", Array.prototype.slice.call(arguments)); },
    info: function() { c._write("info", Array.prototype.slice.call(arguments)); },
    warn: function() { c._write("warn", Array.prototype.slice.call(arguments)); },
    debug: function() { c._write("debug", Array.prototype.slice.call(arguments)); },
    error: function() { c._write("error", Array.prototype.slice.call(arguments)); },
    group: function() { c._write("group", Array.prototype.slice.call(arguments)); },
    groupEnd: function() { c._write("groupEnd", Array.prototype.slice.call(arguments)); },
    clear: function() { c._write("clear", Array.prototype.slice.call(arguments)); },

    _write: function(action, args) {
        a = ['%c[C]', c._styles.str];
        for (arg in args) {
            switch (typeof args[arg]) {
                case "string":
                case "int":
                case "number":
                    a[0] += "%c%s";
                    a.push(c._styles.str);
                    a.push(args[arg]);
                    break;

                case "boolean":
                case "undefined":
                case "null":
                    a[0] += "%c%s";
                    a.push(c._styles.sys);
                    a.push(args[arg])
                    break;

                case "function":
                case "object":
                    a[0] += " %c%o"
                    a.push(c._styles.obj);
                    a.push(args[arg]);
                    break;

                default:
                    a.push("unknown: " + typeof args[arg]);
            }
        }

        if (c._targets.popup) { }
        if (c._targets.background) {
            background.postMessage({
                method: "console",
                action: action,
                args: a
            });
        }
        if (c._targets.content) { console[action].apply(console, a); }
    }
};

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name == "popup2content") {
        popup = port;
        popup.onMessage.addListener(function(request) {
            methods(request);
        });
        popup.postMessage({method: "ready"});
    }
});

function methods(msg) {
    switch(msg.method) {
        case "ready":
            c.log("got ready");
            break;

        case "console":
            console[msg.action].apply(console, msg.args);
            break;

        default:
            c.log("unknown method: " + msg.method);

        c.groupEnd();
    }
}

background = chrome.runtime.connect({name: "content2background"});
background.postMessage({method: "ready"});
background.onMessage.addListener(function(msg) {
    switch(msg.method) {
        case "ready":
            c.log("got ready");
            break;

        case "console":
            console[msg.action].apply(console, msg.args);
            break;

        default:
            c.log("unknown method: " + msg.method);
    }
});

var content = {
    init: function() {
        c.log('Content script loaded.');
    }
};

jQuery( document ).ready(function($) { content.init(); });
