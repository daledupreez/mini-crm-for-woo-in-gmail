# Setup Instructions

This document describes the recipe for setting up a Google Workspace Add-On that allows you to see customer and order information inside Gmail when reading email from your customers. When orders do exist for a sender, the add-on also shows links to each recent order, as well as the customer's full order list.

**NOTE:** I honestly don't know what Google quotas or limits you might hit if you enable this for your store. But I think it's worth exploring!

## Prerequisites

You're going to need all of the following before you can make use of this recipe:
 * A WordPress site with WooCommerce installed and HTTPS enabled
 * A Gmail account or a Google Workspace account
 * Some willingness to tinker!

## 1. Create a Google Cloud Project

1. While logged into your Google account, navigate to https://console.cloud.google.com/home/.
2. At the top of the screen, click on the dropdown to select a project.
3. Click on the _New Project_ button.
4. Give your project a descriptive name so you know what it's for.
5. If you're only using the free Gmail service, skip setting the _Location_ field. If you have a paid Google Workspace subscription, you can choose to select a value via search. (_I don't know what that looks like!_)
6. Click on the _Create_ button.
7. Once the project has been created, switch to the project - this should be automatic for your first project, but can be done by clicking the _Select Project_ link if it's not your first Google Cloud Project.
8. You should see your dashboard, which should display your _Project number_ -- make a note of this number for Step 3.
9. Mouse over the _APIs & Services_ option in the left menu, and then select the _OAuth consent screen_ option from the submenu.
10. This takes you to the OAuth consent screen setup.
    - If you have a Google Workspace subscription, it is probably best if you pick _Internal_ from the screen.
	- If you just have free Gmail, you must select _External_, as it's the only option you can pick.
11. Click on the _Create_ button.
12. Give your app a meaningful name, your email address for support, and your email address for developer contact information.
13. Click on _Save and continue_.
14. This shows the _Scopes_ page - click on the _Save and continue_ button without changing anything.
15. Click on the _Add users_ button in the _Test users_ section.
16. Add your Gmail address in the text field, and any other users who should have access, and then click on the _Add_ button.
17. Click on the _Save and continue_ button.

## 2. Get WooCommerce REST API Keys

For this step, we want to create REST API keys that allow your add-on to read information from your WooCommerce store.

Follow [these instructions](https://woocommerce.github.io/woocommerce-rest-api-docs/#rest-api-keys) to create a special pair of values that allow for access to your store. You should only create the new API key with _Read_ permissions. Once you have created the keys, keep this tab open so you can copy the values over in the next step.

## 3. Create a Google Apps Script project

Next, we need to create a Google Apps Script project:

1. While logged into your Google account, navigate to https://script.google.com/home and click on _New project_.
2. Click in the top bar where it says _Untitled project_, and rename the project so you know what the project is for.
3. Click on the _Project Settings_ option on the left menu. It has a gear icon by default.
4. Update the time zone if you would like.
5. Ensure the _Show "appsscript.json" manifest file in editor_ option is checked.
6. In the _Google Cloud Platform (GCP) Project_ section, click on the _Change project_ button.
7. Enter your Google Cloud Project Number from step 1 and click on the _Set project_ button.
8. In the _Script Properties_ section, click on the _Add script property_ button three times to create three new properties.
9. We now want to add the following script property values:

| Property                      | Value                 |
| ----------------------------- | --------------------- |
| `WOOCOMMERCE_CONSUMER_KEY`    | `ck_...` - the consumer key from Step 2 |
| `WOOCOMMERCE_CONSUMER_SECRET` | `cs_...` - the consumer secret from Step 2 |
| `WOOCOMMERCE_HOST`            | `example.com` - your website URL _without_ the `https://` or any trailing slashes  |

   - _NOTE:_ If your WordPress site is using a non-standard REST API prefix which is not `/wp-json`, you should also set the `REST_API_PREFIX` script property.
10. After entering all the values, click on the _Save script properties_ button.

## 4. Update `appsscript.json`

1. Still in your Google Apps Script project, click on the _Editor_ option in the left menu.
2. Then click on `appsscript.json` in the _Files_ section of the screen.
3. We now want to configure your add-on. Copy the `timeZone` value in the file to another location -- we'll want to get that back in a second.
4. Copy the contents of the `appsscript.json` file from this project and replace the contents of the `appsscript.json` file in your project.
5. Copy back the `timeZone` setting you had before.
6. We're now going to replace some values in the content you just copied:

| Property name         | Value              |
| --------------------- | ------------------ |
| `urlFetchWhitelist`   | You must replace `[YOUR-DOMAIN]` with your website address |
| `name`                | Use a short name for the add-on |
| `logoUrl`             | Specify the URL for a logo that you can identify easily. You can also leave this as-is |
| `openLinkUrlPrefixes` | You must replace `[YOUR-DOMAIN]` with your website address. You _must_ keep the `/` at the end of the value. |

7. Once you've made the changes above, click the _Save_ button (or hit `Ctrl+S`).

## 5. Copy the code files

We now want to copy across all of the `.gs` files from this directory into your Apps Script project.

1. Click on `Code.gs` in the _Files_ section of the UI, and then remove all the text in the main editor section.
2. Copy the contents of the `Code.gs` file in this directory, and paste them into the editor on the right.
3. Click on the _Save_ button (or hit `Ctrl+S`).

For each of the remaining `.gs` files in this directory, follow these steps:

1. Next to the _Files_ header, click the `+` icon, and then select `Script` from the dropdown.
2. Type the name of the file you want to copy _without_ the `.gs` part of the name, and then hit `Enter`.
   - For example, you should only type `Constants` for the `Constants.gs` file.
3. Select all the text in the editor on the right, and delete it.
4. Copy all the text from the `.gs` file in this directory, and paste it into the editor.
5. Click on the _Save_ button (or hit `Ctrl+S`).

You'll need to follow these steps until you have all of the following files in your Apps Script project:
 * `Code.gs`
 * `ConfigHelpers.gs`
 * `Constants.gs`
 * `DataRetrieval.gs`

## 6. Enable testing for the add-on

We can now set up the add-on for testing as follows:

1. Click on the _Deploy_ button at the top of the screen, and then select _Test deployments_ from the dropdown.
2. Click on the _Install_ button next to the _Application(s): Gmail_ option.
3. After the _Install_ button text changes to _Uninstall_, click on the _Done_ button.

## 7. Test the add-on

Login in to Gmail or refresh a page that already has Gmail loaded.

You should see your chosen logo appear in the Gmail add-ons section, which is to the right of the email content by default.

Click on the logo to open the add-on and show if it's working correctly.

The first time you open the add-on, it will prompt for authorization. Work through the flow to give the add-on the necessary permissions (which are to run as an add on, read your email, and open external links.) Take careful note of which option you're picking -- at least one step has the _Continue_ buttonas the non-default option.

To see customer-specific information, open an email from an existing customer.