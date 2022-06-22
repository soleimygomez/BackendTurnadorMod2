"use strict";

var dotenv = require("dotenv");

dotenv.config();
var my_secret_key = process.env.MY_SECRET_KEY; // const base_URL = "http://backend.avanzocreditos.com:4000";

var base_URL_test = "http://localhost:4000";
var base_URL = "http://localhost:4000";
var front_URL = process.env.FRONT_URL;
var excluded_account = 'EFECTY';
module.exports = {
  my_secret_key: my_secret_key,
  base_URL: base_URL,
  base_URL_test: base_URL_test,
  front_URL: front_URL,
  excluded_account: excluded_account
};