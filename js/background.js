var c = {
    _styles: {
        str: 'background: #f2dede; padding: 2px 2px; border-bottom: 1px solid #a94442;',
        obj: 'padding: 2px 0px;'
    },
    _targets: {
        popup: false,
        background: true,
        content: true
    },

    log: function() { c._write("log", Array.prototype.slice.call(arguments)); },
    info: function() { c._write("info", Array.prototype.slice.call(arguments)); },
    warn: function() { c._write("warn", Array.prototype.slice.call(arguments)); },
    debug: function() { c._write("debug", Array.prototype.slice.call(arguments)); },
    error: function() { c._write("error", Array.prototype.slice.call(arguments)); },
    group: function() { c._write("group", Array.prototype.slice.call(arguments)); },
    groupEnd: function() { c._write("groupEnd", Array.prototype.slice.call(arguments)); },

    _write: function(action, args) {
        a = ['%c[B]', c._styles.str];
        for (arg in args) {
            switch (typeof args[arg]) {
                case "string":
                case "int":
                case "bool":
                    a[0] += "%c%s";
                    a.push(c._styles.str);
                    a.push(args[arg]);
                    break;

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
        if (c._targets.background) { console[action].apply(console, a); }
        if (c._targets.content) {
            var params = {
                method: "console",
                action: action,
                args: a
            };

            chrome.tabs.query({ active: true }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, params, function(response) {});
            });
        }
    }
};

// Listen for messages from content
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.method) {
        case "console":
            console[request.action].apply(console, request.args)
            break;
    }
});
