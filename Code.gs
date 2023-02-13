/**
 * Callback to render the add-on when no email is selected.
 *
 * @return {CardService.Card} The card to show the user.
 */
function onHomePage() {
  var builder = CardService.newCardBuilder();

  builder.addSection(
    CardService.newCardSection()
      .setHeader( 'Mini CRM for Woo in Gmail' )
      .addWidget( buildKeyValueWidget( 'Store URL', getWooCommerceHost() ) )
  );

  if  ( ! areWooCommerceCredentialsConfigured() ) {
    builder.addSection(
      CardService.newCardSection()
        .setHeader( 'Configuration Error' )
        .addWidget(
          CardService.newTextParagraph()
            .setText( '<b>Your consumer keys are not set up correctly!</b>' )
        )
    );
  }

  return builder.build();
}

/**
 * Callback to render the content for a specific email message.
 * 
 * @param {Object} event The triggering event from Gmail.
 * @return {CardService.Card} The card content.
 */
function onGmailMessage( event ) {
  if ( '' === getWooCommerceHost( false ) ) {
	return buildErrorCard( 'Configuration Error', 'You need to configure the WOOCOMMERCE_HOST setting' );
  }

  if ( ! areWooCommerceCredentialsConfigured() ) {
	return buildErrorCard( 'Configuration Error', 'You need to set up your WooCommerce API keys' );
  }

  // Get the ID of the message the user has open.
  const messageId = event.gmail.messageId;

  // Get an access token scoped to the current message and use it for GmailApp
  // calls.
  const accessToken = event.gmail.accessToken;
  GmailApp.setCurrentMessageAccessToken( accessToken );

  // Get the subject of the email.
  const message = GmailApp.getMessageById( messageId );

  const emailAddress = getEmailAddressFromMessage( message );

  const orderDataForEmailAddress = fetchOrdersForEmailAddress( emailAddress );

  return buildCustomerCard( emailAddress, orderDataForEmailAddress );
}

/**
 * Build an error card.
 *
 * @param {string} message The error message to display.
 * @returns {CardService.Card}
 */
function buildErrorCard( header, message ) {
  const builder = CardService.newCardBuilder();
  
  builder.addSection(
	CardService.newCardSection()
		.setHeader( header )
		.addWidget(
			CardService.newTextParagraph()
				.setText( message )
		)
  );

  return builder.build();
}

/**
 * Get the sender's email address from a Gmail message.
 *
 * @param {GmailApp.GmailMessage} message The Gmail message we are looking at.
 * @return {string} The sender's email address.
 */
function getEmailAddressFromMessage( message ) {
  const from = message.getFrom();

  const nameAndEmailInFromMatcher = /[^<>]+/gi;
  
  const nameAndEmailMatchResult = from.match( nameAndEmailInFromMatcher );

  if ( nameAndEmailMatchResult === null || nameAndEmailMatchResult.length < 2 ) {
    return from;
  }

  return nameAndEmailMatchResult[1];
}

/**
 * Build the content to show for a specific customer.
 *
 * @param {string} emailAddress The sender's email address.
 * @param {WooCommerceOrderResult} orderDataForEmailAddress The order details for the email address.
 * @returns {CardService.Card} The card to show the user.
 */
function buildCustomerCard( emailAddress, orderDataForEmailAddress ) {
  const builder = CardService.newCardBuilder();

  if ( orderDataForEmailAddress.error ) {
    const errorSection = CardService.newCardSection()
      .setHeader( 'Error' )
      .addWidget( buildKeyValueWidget( 'Email', emailAddress ?? '(No email)' ) )
      .addWidget( buildKeyValueWidget( 'Error', orderDataForEmailAddress.error ) );

      builder.addSection( errorSection );

      return builder.build();
  }

  if ( ! Array.isArray( orderDataForEmailAddress.orders ) || orderDataForEmailAddress.orders.length < 1 ) {
    const noOrdersSection = CardService.newCardSection()
      .setHeader( 'No Orders' )
      .addWidget(
        CardService.newTextParagraph()
          .setText( 'No orders for <b>' + emailAddress + '</b>' )
      );
    
    builder.addSection( noOrdersSection );

    return builder.build();
  }

  const customerDetailsSection = buildCustomerDetailsSection( emailAddress, orderDataForEmailAddress.orders );

  if ( customerDetailsSection ) {
    builder.addSection( customerDetailsSection );
  }

  const recentPurchasesSection = buildRecentPurchasesSection( orderDataForEmailAddress.orders );

  builder.addSection( recentPurchasesSection );

  var fixedFooter = CardService.newFixedFooter()
    .setPrimaryButton( buildTextButtonWidget( 'View all customer orders', getWooCommerceLinkForCustomer( emailAddress ) ) );
  
  builder.setFixedFooter( fixedFooter );

  return builder.build();
}

/**
 * @param {string} emailAddress
 * @param {WooCommerceOrder[]} orders
 * @returns {CardService.CardSection|null}
 */
function buildCustomerDetailsSection( emailAddress, orders ) {
  const mostRecentOrder = orders[0] ?? null;

  if ( ! mostRecentOrder ) {
    return null;
  }

  const customerName = getNameFromOrder( mostRecentOrder );

  if ( ! customerName ) {
    return null;
  }

  const maxOrderCount = getMaxOrderCount();

  const recentOrderMessage = orders.length >= maxOrderCount
    ? orders.length + ' (or more) recent purchases'
    : orders.length + ' recent purchase(s)';

  const ordersTotal = orders.reduce(
    ( runningTotal, order ) => {
      
      return runningTotal + getAmountFromString( order.total );
    },
    0
  );

  return CardService.newCardSection()
    .setHeader( 'Customer Details' )
    .addWidget( buildKeyValueWidget( 'Name', customerName ) )
    .addWidget( buildKeyValueWidget( 'Email', emailAddress ) )
    .addWidget( CardService.newDecoratedText()
      .setTopLabel( 'Purchase history' )
      .setText( recentOrderMessage + '<br/>' + mostRecentOrder.currency_symbol + String( ordersTotal ) + ' total purchases' )
    );
}

/**
 * Build the Recent Purchases section using the supplied orders.
 *
 * @param {WooCommerceOrder[]} orders
 * @returns {CardService.CardSection} 
 */
function buildRecentPurchasesSection( orders ) {
  const recentPurchasesSection = CardService.newCardSection()
    .setHeader( 'Recent purchases' );
  
  orders.forEach( ( order, index ) => {
    if ( index > 0 ) {
      recentPurchasesSection.addWidget( CardService.newDivider() );
    }
    recentPurchasesSection.addWidget( buildRecentPurchaseWidget( order ) );
  } );

  return recentPurchasesSection;
}

/**
 * @param {string} stringAmount
 * @return {number}
 */
function getAmountFromString( stringAmount ) {
  const numberParts = stringAmount.split( '.' );
  if ( numberParts.length === 1 ) {
    return parseInt( stringAmount, 10 );
  }

  return parseInt( numberParts[0], 10 ) + ( parseInt( numberParts[1], 10 ) / 100 );
}

/**
 * Get the customer name from an order, using the billing first and last names.
 *
 * @param {WooCommerceOrder} order 
 * @returns {string}
 */
function getNameFromOrder( order ) {
  const firstName = order?.billing?.first_name;
  const lastName = order?.billing?.last_name;

  if ( ! firstName || ! lastName ) {
    return null;
  }

  return String( firstName ) + ' ' + String( lastName );
}

/**
 * @param {string} buttonText 
 * @param {string|null} url 
 * @returns {CardSection.TextButton}
 */
function buildTextButtonWidget( buttonText, url ) {
  var button = CardService.newTextButton()
        .setText( buttonText );
  
  if ( ! url ) {
    return button;
  }

  return button.setOpenLink(
    CardService.newOpenLink()
      .setUrl( url )
  );
}

/**
 * 
 * @param {string} label 
 * @param {string} value 
 * @returns {CardSection.KeyValue}
 */
function buildKeyValueWidget( label, value ) {
  return CardService.newKeyValue()
    .setTopLabel( label )
    .setContent( value );
}

/**
 * @param {WooCommerceOrder} order
 * @return {CardService.DecoratedText}
 */
function buildRecentPurchaseWidget( order ) {
  const orderDate = ( order.date_created ?? 'Unknown date' ).split( 'T' )[0];
  const itemCount = order?.line_items?.length ?? 0;
  const itemText = itemCount > 1
    ? order.line_items.length + ' items'
    : itemCount === 1
      ? '1 item'
      : 'Unknown items';

  return CardService.newDecoratedText()
    .setTopLabel( orderDate + ' | ' + itemText )
    .setText( '<b>' + order.currency_symbol + getAmountFromString( order.total ) + '</b><br/>' + formatOrderStatus( order.status ) )
    .setButton( buildTextButtonWidget( 'View order', getWooCommerceLinkForOrder( order.id ) ) );
}

/**
 * @param {string|null} emailAddress
 * @returns {string}
 */
function getWooCommerceLinkForCustomer( emailAddress ) {
  if ( ! emailAddress ) {
    return getWooCommerceOrdersLink();
  }

  return getWooCommerceOrdersLink( { s: emailAddress } );
}

/**
 * @param {Object} urlParams 
 * @returns {string}
 */
function getWooCommerceOrdersLink( urlParams = {} ) {
  return getWpAdminPath() + 'edit.php'
    + buildUrlParams( {
        post_status: 'all',
        post_type: 'shop_order',
        ...urlParams
    } );
}

/**
 * @param {number|null} orderId 
 * @returns {string}
 */
function getWooCommerceLinkForOrder( orderId ) {
  if ( ! orderId ) {
    return WOOCOMMERCE_HOST;
  }

  return getWpAdminPath() + 'post.php?post=' + orderId + '&action=edit';
}

/**
 * @param {string} orderStatus
 * @returns {string}
 */
function formatOrderStatus( orderStatus ) {
  if ( COMPLETED_STATUSES.includes( orderStatus ) ) {
    return getOrderStatusForDisplay( orderStatus );
  }

  return '<b>' + getOrderStatusForDisplay( orderStatus ) + '</b>';
}

/**
 * @param {string} orderStatus 
 * @returns {string}
 */
function getOrderStatusForDisplay( orderStatus ) {
  return orderStatus.split( '-' ).map(
    ( word ) => word.charAt( 0 ).toUpperCase() + word.substring( 1 )
  ).join( ' ' );
}
