/*
Template for Weebly-based sites
 */

const axios = require("axios");
const chalk = require('chalk');                      // npm i chalk@2.4.1
const baseURL = 'ENTER ';
//baseURL is the ALL products call should look something like this: https://cdn5.editmysite.com/app/store/api/v18/editor/users/131535993/sites/542536437781936289/products?page=1&per_page=180&sort_by=popularity_score&sort_order=desc&categories[]=11ea7aa7c1810cefae500cc47a2ae330&include=images,media_files&excluded_fulfillment=dine_in
const businessName = 'ENTER BUSINESS NAME'
let count = 0;


const main = async (urlCall) =>{
    const response = await axios(urlCall);
    //console.log(response.data.data);

    const data = await Object.values(response.data.data).map(async item =>{
        count++;

        const id = item.id;
        const title = item.name;
        const business_name = businessName;
        const url = item.site_link;
        const place_id = item.site_id;
        //const colors = [];
        const product_type = item.product_type;
        const original_price = item.price.high_subunits;
        let productId = getId(url);
        const sizes = await getSizes(productId);
        const images = item.images;
        //  const options = await getOptions(productId);
        const created_at = item.created_date;
        const updated_at = item.updated_date;
        const is_on_sale = item.on_sale;
        const rating = item.avg_rating_all;
        const body_html = await getDescription(productId);


        return{
            id,
            title,
            url,
            business_name,
            place_id,
            //colors,
            product_type,
            original_price,
            sizes,
            images,
            created_at,
            updated_at,
            is_on_sale,
            rating,
            body_html
        };

    });

    Promise.all(data).then(
        value => {
            for(var i =0; i < value.length; i++){
                console.log(chalk.green('This is item number: ') + chalk.blue(i));
                for(v in value[i]){
                    // if(v == 'images' || v == 'IMAGES'){        //used to see what's inside images
                    //     console.log(v);
                    //     for(prop in value[i]['images'])
                    //         console.log(value[i]['images'][prop])
                    // }
                    console.log(chalk.red(v.toUpperCase()) + ": " + value[i][v]);
                }
            }
        }
    )
    await console.log('Total number of items scraped: ' + count);
}



const getId = function(productUrl){
    let parts = productUrl.split('/');
    let id = parts[parts.length-1];

    return id;
}

const getDescription = async (productId) => {
    try{
        const productCall = `https://cdn5.editmysite.com/app/store/api/v18/editor/users/117455569/sites/947780008751768186/store-locations/11e9bd18fde6323080f40cc47a2b63ac/products/${productId}`;
        const response = await axios(productCall);
        const data = response.data.data;
        return data['short_description']
    }catch (err){
        console.log('error getting description')
    }
}

const getSizes = async (productId)=> {
    let sizes = [];
    try {
        const productCall = `https://cdn5.editmysite.com/app/store/api/v18/editor/users/117455569/sites/947780008751768186/store-locations/11e9bd18fde6323080f40cc47a2b63ac/products/${productId}/skus?page=1&per_page=100&include=image,media_files,product`;
        let response = await axios(productCall);
        let data = response.data.data
        for (p in data) {
            if (data[p].inventory > 0) {
                sizes.push(data[p].name);
            }
        }
        return sizes;
    }catch (err){
        console.log('error getting sizes');
    }
}

main(baseURL);