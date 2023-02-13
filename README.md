# mini-crm-for-woo-in-gmail

This project is effectively a recipe for building a simple CRM Gmail add-on for WooCommerce which allows you to see customer and order information inside Gmail when reading email from your customers. When orders do exist for a sender, the add-on also shows links to each recent order, as well as a link to the customer's full order list.

The add-on should work for users of the free Gmail service as well as Google Workspace subscribers.

## How do I get started?

See (./instructions.md).

## How does it work?

The add-on is built using Google Apps Script and Google Cloud, but needs to be created for each WooCommerce site because the Apps Script configuration requires an explicit allowlist of URLs that may be called or linked to.

At present, the recipe doesn't take into account any possible quotas or limits for Google Apps Script or Google Cloud usage, nor does the recipe go beyond setting up a test project.

The actual recipe relies on the code in this project, some script-level configuration properties, and you having a WooCommerce install accessible via HTTPS.