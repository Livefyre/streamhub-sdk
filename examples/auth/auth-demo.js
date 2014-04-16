require([
    'auth',
    'auth-livefyre',
    'auth/contrib/auth-button',
    'auth-livefyre/livefyre-auth-delegate',
    'streamhub-sdk/debug',
    'streamhub-sdk/jquery',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-sdk/collection',
    'streamhub-sdk/content',
    'streamhub-sdk/auth'
],function (auth, authLivefyre, createAuthButton, livefyreAuthDelegate, debug, $, ListView, Collection, Content, Auth) {
    window.auth = auth;
    var log = debug('streamhub-sdk/auth-demo');
    var authButton = createAuthButton(auth, document.getElementById('auth-button'));

    authLivefyre.plugin(auth);
    var delegate = window.delegate = livefyreAuthDelegate('http://www.livefyre.com');
    auth.delegate(delegate);

    var livefyreUser = auth.get('livefyre');
    var $tokenInput = $('*[name=lftoken]');
    function setUser (user) {
        $tokenInput.val(user.get('token'));
    }
    if (livefyreUser) {
        setUser(livefyreUser);
    }
    auth.on('login.livefyre', setUser);
    auth.on('logout', function () {
        $tokenInput.val('');
    });

    var opts = {
        "network": "livefyre.com",
        "siteId": "313878",
        "articleId": "1",
        "environment": "livefyre.com"
    };
    var listView = window.view = new ListView({
        el: document.getElementById("listView")
    });

    var collection = window.collection = new Collection(opts);

    collection.pipe(listView);

    var $writeForm = $('#write-form');
    $writeForm.submit(function (e) {
        e.preventDefault();

        var formArray = $writeForm.serializeArray(),
            body = formArray[0].value,
            tweetId = formArray[1].value,
            lftoken = formArray[2].value,
            contentToWrite;
        if (body) {
            contentToWrite = new Content(body);
        } else if (tweetId) {
            contentToWrite = { tweetId: tweetId };
        }
        if (lftoken) {
            Auth.setToken(lftoken);
        }
        if ( ! Auth.getToken() || ! contentToWrite) {
            alert("Cant write. Not enough info");
            return;
        }
        collection.write(contentToWrite);

    });
});
