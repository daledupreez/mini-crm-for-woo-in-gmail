/**
 * @typedef {Object} WooCommerceOrder
 * @property {string} create_date
 * @property {string} currency_symbol
 * @property {number} id
 * @property {Object[]} line_items
 * @property {string} status
 * @property {string} total
 */

/**
 * @typedef {Object} WooCommerceOrderResult
 * @property {string} error
 * @property {WooCommerceOrder[]} orders
 */

/**
 * Find orders for the supplied email address.
 *
 * @param {string} emailAddress The email address to look up.
 * @returns {WooCommerceOrderResult}
 */
function fetchOrdersForEmailAddress( emailAddress ) {
  const ordersWithEmailAddressUrl = getOrdersUrl();
  const urlParams = {
    search: emailAddress,
    per_page: getMaxOrderCount(),
  };

  const fetchResult = makeWooCommerceApiCall( ordersWithEmailAddressUrl, urlParams );

  if ( fetchResult.error ) {
    return {
      error: fetchResult.error
    };
  }

  return {
    orders: fetchResult.data,
  };
}

/**
 * Extract URL parameters from urlParams as key/value pairs, and return an encoded string,
 * including a leading `?`.
 *
 * @param {Object} urlParams A set of key/value pairs to add to a URL.
 * @returns {string}
 */
function buildUrlParams( urlParams = {} ) {
  const encodedKeyValuePairs = Object.entries( urlParams ).map(
    ( [ key, value ] ) => encodeURIComponent( key ) + '=' + encodeURIComponent( value )
  );

  if ( ! encodedKeyValuePairs.length ) {
    return '';
  }

  return '?' + encodedKeyValuePairs.join( '&' );
}

/**
 * @typedef {Object} WooCommerceApiCallOptions
 * @property {boolean} debugUrl Flag to control whether we log the URL for debugging.
 */

/**
 * @typedef {Object} WooCommerceApiCallResult
 * @property {string} error An error message if an error occurred.
 * @property {Object|Array} data The returned data.
 */

/**
 * Make an API call to a WooCommerce REST API.
 *
 * @param {string} url 
 * @param {Object} urlParams 
 * @param {WooCommerceApiCallOptions} options 
 * @returns {WooCommerceApiCallResult}
 */
function makeWooCommerceApiCall( url, urlParams = {}, options = {} ) {
  const { wooConsumerKey, wooConsumerSecret } = getWooCommerceCredentials();
 
  const query = buildUrlParams( urlParams );

  const httpResponse = UrlFetchApp.fetch( url + query, {
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode( wooConsumerKey + ':' + wooConsumerSecret )
    }
  } );

  if ( options && options?.debugUrl ) {
    Logger.log( {
      'function': 'makeWooCommerceApiCall',
      url,
      query
    } );
  }

  if ( 200 !== httpResponse.getResponseCode() ) {
    Logger.log( 'API call returned unexpected response code: ' + httpResponse.getResponseCode() + '; Response body: ' + httpResponse.getContentText() );

    return {
      error: 'API call failed'
    };
  }

  const httpResponseHeaders = httpResponse.getHeaders();
  
  const contentTypeHeader = httpResponseHeaders['Content-Type'];

  if ( 'application/json; charset=UTF-8' !== httpResponseHeaders['Content-Type'] ) {
    Logger.log( {
      error: 'Unexpected content type',
      contentType: contentTypeHeader,
      headers: httpResponseHeaders
    } );

    return {
      error: 'API call returned unexpected content'
    };
  }

  return {
    data: JSON.parse( httpResponse.getContentText() ),
  };
}