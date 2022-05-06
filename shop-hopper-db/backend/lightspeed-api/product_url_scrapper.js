

const request = require('request-promise');
const cheerio = require('cheerio');

let pageUrl = '';
let productListLength = 0;
let page$;
let pageHtml;

let body_html = {};

/* SCRAPER FUNCTIONS */

async function scrapeProductUrls(site, product_type) {
    const product_urls = [];

    const route = 'https://www.fossellos.com/shop/tops/';
    const html = await request.get(route);
    const $ = await cheerio.load(html);

    let paginationEnd;
    let productUrl;
    let productElement;


    try {
        if (typeof site.paginationSelector === 'string')
            if ($(site.paginationSelector).length) paginationEnd = $(site.paginationSelector).eq(-2).text();
            else {
                paginationEnd = 1;
                console.log('`' + route + '`' + ' has no pagination');
            }
        else if (Number.isInteger(site.paginationSelector)) paginationEnd = site.paginationSelector;
        else throw 'Invalid pagination';
    } catch (err) {
        console.log('Please enter a valid pagination value (Selector or Integer)');
    }

    for (var i = 1; i <= paginationEnd; i++) {
        await sleep(1000);
        let productItemSelector = '';
        pageUrl = route + 'page' + i + '.html';
        pageHtml = await request.get(pageUrl);
        page$ = cheerio.load(pageHtml);

        if (site.removeNodes) removeNodes(page$, site.removeNodes);

        if (site.productItemSelector) productItemSelector = site.productItemSelector;

        productListLength = await page$(site.productListSelector).children(productItemSelector).length;

        for (var j = 0; j < productListLength; j++) {
            productElement = await page$(site.productListSelector).children().eq(j);
            productUrl = await page$(productElement).find(site.productLinkSelector).attr('href');

            let html = await scrapeBodyHtml(productUrl, site);
            body_html[productUrl] = html;

            productUrl = productUrl.replace('.html', '.ajax');
            console.log(productUrl);

            product_urls.push(productUrl);
        }
    }

    return product_urls;
}

async function removeNodes(page$, nodes) {
    nodes.forEach((element) => {
        page$(element).remove();
    });
}

async function scrapeBodyHtml(productUrl, site) {
    const html = await request.get(productUrl);
    const $ = await cheerio.load(html);

    let bodyHtml = $(site.bodyHtmlSelector).prop('outerHTML');

    return bodyHtml;
}
/* UTILITY FUNCTIONS */

//Stops the program for a specified number of seconds
async function sleep(miliseconds) {
    return new Promise((resolve) => setTimeout(resolve, miliseconds));
}

module.exports = { scrapeProductUrls: scrapeProductUrls, body_html };
