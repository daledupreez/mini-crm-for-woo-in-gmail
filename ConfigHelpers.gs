/**
 * Get the configured WooCommerce host name from the `WOOCOMMERCE_HOST`
 * script property.
 *
 * @param {boolean} includeProtocol 
 * @returns {string} The WooCommerce site's host name.
 */
function getWooCommerceHost( includeProtocol = true ) {
	const wooCommerceHost = PropertiesService.getScriptProperties()
    .getProperty( 'WOOCOMMERCE_HOST' );

	if ( includeProtocol ) {
	  return 'https://' + wooCommerceHost;
	}

	return wooCommerceHost;
}

/**
 * Get the full path to WP Admin for your WordPress site.
 *
 * @returns {string} The full URL for WP Admin.
 */
function getWpAdminPath() {
	return getWooCommerceHost() + "/wp-admin/";
}

/**
 * Get the REST API prefix for your WordPress site.
 * Starts by checking the `REST_API_PREFIX` script property,
 * and falls back on the WordPress default of `/wp-json` if 
 * the script property is not defined.
 *
 * @returns {string} The WordPress REST API prefix for the site.
 */
function getRestApiPrefix() {
	const restPrefix = PropertiesService.getScriptProperties()
    .getProperty( 'REST_API_PREFIX' );
  
  if ( restPrefix && restPrefix !== '' ) {
    return restPrefix;
  }

  return '/wp-json';
}

/**
 * Get the base WooCommerce REST API URL.
 *
 * @param {string} version The REST API version. Defaults to `v3`.
 * @returns {string} The base WooComemrce REST API URL.
 */
function getBaseApiUrl( version = 'v3' ) {
	return getWooCommerceHost() + getRestApiPrefix() + '/wc/' + version;
}

/**
 * Get the WooCommerce Customers URL.
 *
 * @returns {string}
 */
function getCustomersUrl() {
	return getBaseApiUrl() + '/customers';
}

/**
 * Get the WooCommerce Orders URL.
 *
 * @returns {string}
 */

function getOrdersUrl() {
	return getBaseApiUrl() + '/orders';
}

/**
 * Get the maximum number of orders.
 * Starts by checking the `MAX_ORDER_COUNT` script property.
 * If that is not defined, or not a valid integer > 0,
 * we default to 10.
 *
 * @returns {number} The maximum number of orders we should fetch and display.
 */
function getMaxOrderCount() {
	const maxOrderCountConfig = getScriptPropertyValue( 'MAX_ORDER_COUNT' );
  if ( maxOrderCountConfig !== '' ) {
    const maxOrderCount = parseInt( maxOrderCountConfig, 10 );
    if ( ! isNaN( maxOrderCount ) && maxOrderCount > 0 ) {
      return maxOrderCount;
    }
  }

  return 10;
}

/**
 * Do we have valud WooCommerce credentials configured?
 *
 * @returns {boolean} Do we have WooCommerce credentials configured?
 */
function areWooCommerceCredentialsConfigured() {
  const { wooConsumerKey, wooConsumerSecret } = getWooCommerceCredentials();

  if ( wooConsumerKey === '' || 'ck_' !== wooConsumerKey.substring( 0, 3 ) ) {
    return false;
  }

  if ( wooConsumerSecret === '' || 'cs_' !== wooConsumerSecret.substring( 0, 3 ) ) {
    return false;
  }

  return true;
}

/**
 * The currently configured WooCommerce credentials.
 * @typedef {Object} WooCommerceCredentials
 * @property {string} wooConsumerKey The configured WooCommerce consumer key.
 * @property {string} wooConsumerSecret The configured WooCommerce consumer secret.
 */

/**
 * Get the currently configured WooCommerce credentials.
 * @returns {WooCommerceCredentials} The stored WooCommerce credentials.
 */
function getWooCommerceCredentials() {
  const credentials = getScriptProperties( [ 'WOOCOMMERCE_CONSUMER_KEY', 'WOOCOMMERCE_CONSUMER_SECRET' ] );

  return {
    wooConsumerKey: credentials.WOOCOMMERCE_CONSUMER_KEY,
    wooConsumerSecret: credentials.WOOCOMMERCE_CONSUMER_SECRET
  };
}

/**
 * Get the script property's value.
 *
 * @param {string} propertyName The name of the script property.
 * @returns {string} The script property's value.
 */
function getScriptPropertyValue( propertyName ) {
  return PropertiesService.getScriptProperties()
    .getProperty( propertyName );
}

/**
 * Fetch multiple script properties as an object.
 *
 * @param {string[]} propertyNames The names of the properties to fetch.
 * @returns {Object} The values of the properties indexed by their name.
 */
function getScriptProperties( propertyNames ) {
  const scriptProperties = PropertiesService.getScriptProperties();

  return Object.fromEntries(
    propertyNames.map(
      ( propertyName ) => {
        return [ propertyName, scriptProperties.getProperty( propertyName ) ];
      }
    )
  );
}
