var c = {
    _console: chrome.extension.getBackgroundPage().console,
    _styles: {
        str: 'background: #dff0d8; padding: 2px 2px; border-bottom: 1px solid #4cae4c;',
        sys: 'background: #dff0d8; padding: 2px 2px; border-bottom: 1px solid #4cae4c; font-weight: bold;',
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
        a = ['%c[P]', c._styles.str];
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

        if (c._targets.popup) { console[action].apply(console, a); }
        if (c._targets.background) {
            chrome.extension.getBackgroundPage().console[action]
                .apply(chrome.extension.getBackgroundPage().console, a);
        }
        if (c._targets.content) {
            content.postMessage({
                method: "console",
                action: action,
                args: a
            });
        }
    }
};

var background = chrome.runtime.connect({name: "popup2background"});
background.postMessage({method: "ready"});
background.onMessage.addListener(function(request) {
    c.group("background.onMessage.addListener");
    c.log("request", request);

    switch(request.method) {
        case "ready":
            c.log("connected");
            break;

        default:
            c.log("no method for " + request.method);
    }

    c.groupEnd();
});
