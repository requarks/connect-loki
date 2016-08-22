# connect-loki

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/requarks/connect-loki/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/Requarks/connect-loki.svg?branch=master)](https://travis-ci.org/Requarks/wiki)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/97c0f52f6fcc471caeccf45827ff3361)](https://www.codacy.com/app/Requarks/connect-loki)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/df3886d694254a248a7585a90bc5faed)](https://www.codacy.com/app/requarks/connect-loki)
[![Dependency Status](https://gemnasium.com/badges/github.com/Requarks/connect-loki.svg)](https://gemnasium.com/github.com/Requarks/connect-loki)
[![Known Vulnerabilities](https://snyk.io/test/github/requarks/connect-loki/badge.svg)](https://snyk.io/test/github/requarks/connect-loki)

##### A Loki.js session store for Connect/Express

### Setup

```shell
npm install connect-loki express-session
```

Pass the `express-session` store into `connect-loki` to create a `LokiStore` constructor.

```js
var session = require('express-session');
var LokiStore = require('connect-loki')(session);

var options = {}; // See available options below

app.use(session({
    store: new LokiStore(options),
    secret: 'keyboard cat'
}));
```

### Options

Setting the `path` to the database file is optional but recommended.

Available parameters:

-	`path` Path to the database file. Defaults to `./session-store.db`
-	`autosave` Set `false` to disable save to disk. Defaults to `true`
-	`logErrors` Whether or not to log client errors. Defaults to `false`
	-	If `true`, a default logging function (`console.error`) is provided.
	-	If a function, it is called anytime an error occurs (useful for custom logging)
	-	If `false`, no logging occurs.

### License

MIT