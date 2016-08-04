'use strict';

import request from 'request';
import * as validUrl from 'valid-url';
import * as linkParser from '../../components/parser/linkParser';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode, message) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send({message: message, err: err});
  };
}

/**
 * Creates a entry that watches a specific product
 */
export function create(req, res, next) {
  
  var url = req.body.url;

  if (!validUrl.isUri(url)) {
    return handleError(res, 400, "Invalid url")();
  }

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      linkParser.parseLink(body);
    }
    else {
      handleError(res, 500, "Could not process url.");
    }
  });

  res.status(200).json({url: url});

}
