const axios = require('axios');
const cheerio = require('cheerio');
//let productCall = `https://cdn5.editmysite.com/app/store/api/v18/editor/users/131535993/sites/542536437781936289/store-locations/11ea74fbb0ae20b2ae500cc47a2ae330/products/${productId}/skus?page=1&per_page=100&include=image,media_files,product`

let site = 'https://www.kaleco.ca/product/BambooPrintDrapeNeckTop/1415'
let productUrl = 'product/V-NeckTop/375';



export const getId = function(productUrl){
    let parts = productUrl.split('/');
    let id = parts[parts.length-1];

    return id;
}

export const getDescription = async (productId) => {
        try{
        const productCall = `https://cdn5.editmysite.com/app/store/api/v18/editor/users/131535993/sites/542536437781936289/store-locations/11ea74fbb0ae20b2ae500cc47a2ae330/products/${productId}?include=images,options,modifiers,category,media_files,fulfillment`;
        const response = await axios(productCall);
        const data = response.data.data;
        return data['short_description']
        }catch (err){
            console.log('error getting desription')
        }
}
