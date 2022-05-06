const url_scraper = require('./product_url_scrapper');

const result = [];
const product_urls = [];
const body_html = [];

console.time('execution');

const fossellos = {
    business_name: 'fossellos',
    place_id: 'ChIJGYiXHrX1fVMRCcmNL_DV2ak',
    baseUrl: 'https://www.fossellos.com/',
    paginationSelector: 'div.pagination > ul > li',
    productListSelector: 'div.products-list',
    productLinkSelector: '.product-image-wrapper',
    bodyHtmlSelector: 'div.product-description'
};

export async function getLightspeedProducts() {
    product_urls.push(await url_scraper.scrapeProductUrls(fossellos));

    for (var i = 0; i < 1; i++) {
        for (var j = 0; j < 2; j++) {
            var data = {};
            let response = await fetch(product_urls[i][j]);

            let json = await response.json();
            // console.log('/index.js - json: ', json);
            // data.id = getId(json).toString();
            // data.title = getTitle(json);
            // data.place_id = 'ChIJGYiXHrX1fVMRCcmNL_DV2ak';
            // data.business_name = scrapeBusinessName(json);
            // data.url = getUrl(json);
            // data.vendor = getVendor(json);
            // data.original_price = getPrice(json);
            // data.compare_at_price = getCompareAtPrice(json);
            // data.is_available = getInStock(json);
            // data.variants = getVariants(json);
            // data.images = getImages(json);
            // data.tags = getTags(json);
            // data.body_html = getBodyHtml(json);
            // data.sizes = ['Small', 'Medium', 'Large'];
            // data.buckets = ['trendy'];

            // await result.push(data);
        }
    }

    await console.log(result);
    await console.log('Number of items scraped: ' + result.length);

    //Write to output file
    return result;
    console.timeEnd('execution');
}

/* API FUNCTIONS */

async function getTitle(productJson) {
    return productJson['title'];
}

async function getId(productJson) {
    return productJson['id'];
}

async function getVendor(productJson) {
    return productJson['brand']['title'];
}

async function getVariants(productJson) {
    let cleanVariants;

    async function scrubVariants() {
        cleanVariants = [];

        async function getVariantSize(title) {
            let variantSize;
            let sizeString;

            title = title.split(',');
            sizeString = title[1].replace('"', '').replace('"', '');

            variantSize = sizeString.substring(sizeString.indexOf(' ') + 1);
            return variantSize;
        }
        ``;
        await Object.keys(productJson['variants']).forEach(async (key) =>
            cleanVariants.push({
                id: key,
                sku: productJson['variants'][key]['sku'],
                price: productJson['variants'][key]['price']['price_money_without_currency'],
                size: await getVariantSize(productJson['variants'][key]['title']),
                title: productJson['variants'][key]['title'],
                available: productJson['variants'][key]['stock']['available'],
                compare_at_price: productJson['variants'][key]['price']['price_old_money_without_currency']
            })
        );

        return cleanVariants;
    }

    return await scrubVariants();
}

async function getTags(productJson) {
    var title = await getTitle(productJson);
    var tags = [];

    tags = title.split(' ');

    return tags;
}

async function getImages(productJson) {
    let images = productJson['images'];
    let finalImages = [];
    let finalImage = '';

    images.forEach(async (image) => {
        let imageSplit = await image.split('/');
        imageSplit[7] = '1000x1000x3';
        image = imageSplit.toString();

        finalImage = imageSplit.toString().split(',').join('/');

        finalImages.push({ src: finalImage });
    });

    return finalImages;
}
async function getPrice(productJson) {
    let priceString = productJson['price']['price_money_without_currency'];
    priceString = priceString.replace('.', '');

    return +priceString;
}

async function getCompareAtPrice(productJson) {
    try {
        let comparePriceString = productJson['price']['price_old_money_without_currency'];
        comparePriceString = comparePriceString.replace('.', '');

        return comparePriceString;
    } catch (e) {
        console.log('This product does not have a compare price');
        return;
    }
}

async function getDescription(productJson) {
    return productJson['description'];
}

async function getInStock(productJson) {
    return productJson['stock']['available'];
}

async function getUrl(productJson) {
    return productJson['url'];
}

/* UTILITY FUNCTIONS */

async function scrapeBusinessName(productJson) {
    const url = await getUrl(productJson);
    let startPos = url.indexOf('.');
    let endPos = url.indexOf('.', startPos + 1);

    return url.substring(startPos + 1, endPos);
}

async function getBodyHtml(productJson) {
    let url = await getUrl(productJson);

    return url_scraper.body_html[url];
}

//Stops the program for a specified number of seconds
async function sleep(miliseconds) {
    return new Promise((resolve) => setTimeout(resolve, miliseconds));
}
