var Twit;
var _ = require('lodash');
var jsforce;


/**
 * GET /api/salesforce
 * Salesforce API example.
 */
exports.getSalesforce = function(req, res, next) {
    jsforce = require('jsforce');
    var token = _.find(req.user.tokens, { kind: 'salesforce' });
    console.log("accesstoken retreived:", token.accessToken);
    console.log("Instance_URL :", token.accessToken.params.instance_url);

    var conn = new jsforce.Connection({
            clientId : process.env.SALESFORCE_ID,
            clientSecret : process.env.SALESFORCE_SECRET,
            redirectUri : process.env.SALESFORCE_CALLBACK_URL,
            instanceUrl : token.accessToken.params.instance_url,
            accessToken : token.accessToken.params.access_token,
            refreshToken : token.refreshToken
        });

    var records = [];
    conn.query("SELECT Id, Name FROM Contact", function(err, res) {
        if (err) { return console.error(err); }
        console.log("total : " + res.totalSize);
        console.log("fetched : " + res.records.length);
        console.log(res.records[0]);
    });


//Add A Plotly Plot
    var plotly = require('plotly')(process.env.PLOTLY_ID, process.env.PLOTLY_API_KEY);
/*
    plotly.getFigure('process.env.PLOTLY_ID', 'salesforce/lead-distributions', function (err, figure) {
        if (err) console.log(err);
        console.log(figure);
    });
    */
/*

    var conn = new jsforce.Connection({
        oauth2 : {
            clientId : process.env.SALESFORCE_ID,
            clientSecret : process.env.SALESFORCE_SECRET,
            redirectUri : process.env.SALESFORCE_CALLBACK_URL
        },
        instanceUrl : token.refreshToken.instance_url,
        accessToken : token.accessToken,
        refreshToken : token.refreshToken
    });
    conn.on("refresh", function(accessToken, res) {
        // Refresh event will be fired when renewed access token
        // to store it in your storage for next request
    });
    var records = [];
    conn.query("SELECT Id, Name FROM Account", function(err, result) {
        if (err) { return console.error(err); }
        console.log("total : " + result.totalSize);
        console.log("fetched : " + result.records.length);
    });
*/
    res.render('api/salesforce', {
        title: 'Salesforce API',
        // accounts: result.records
    });


};


/**
 * GET /api/twitter
 * Twiter API example.
 */
exports.getSalesforcebad = function(req, res, next) {
    Twit = require('twit');

    var token = _.find(req.user.tokens, { kind: 'twitter' });
    var T = new Twit({
        consumer_key: process.env.TWITTER_KEY,
        consumer_secret: process.env.TWITTER_SECRET,
        instanceUrl : token.accessToken.params.instance_url,
        accessToken : token.accessToken.params.access_token,
        refreshToken : token.refreshToken
    });
    T.get('search/tweets', { q: 'nodejs since:2013-01-01', geocode: '40.71448,-74.00598,5mi', count: 10 }, function(err, reply) {
        if (err) {
            return next(err);
        }
        res.render('api/twitter', {
            title: 'Twitter API',
            tweets: reply.statuses
        });
    });
};

/**
 * POST /api/twitter
 * Post a tweet.
 */
exports.postSalesforce = function(req, res, next) {
    req.assert('tweet', 'Tweet cannot be empty.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/api/twitter');
    }

    var token = _.find(req.user.tokens, { kind: 'twitter' });
    var T = new Twit({
        consumer_key: process.env.TWITTER_KEY,
        consumer_secret: process.env.TWITTER_SECRET,
        instanceUrl : token.accessToken.params.instance_url,
        accessToken : token.accessToken.params.access_token,
        refreshToken : token.refreshToken
    });
    T.post('statuses/update', { status: req.body.tweet }, function(err, data, response) {
        if (err) {
            return next(err);
        }
        req.flash('success', { msg: 'Tweet has been posted.'});
        res.redirect('/api/twitter');
    });
};

