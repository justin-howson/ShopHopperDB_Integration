/*
Okanagan Skate Scraper
https://www.okanaganskate.com/
 */

//const fetch = require('node-fetch'); // npm install node-fetch@2
const axios = require("axios");
const chalk = require('chalk');                      // npm i chalk@2.4.1
const fs = require('fs')
const baseURL = 'https://cdn5.editmysite.com/app/store/api/v17/editor/users/117455569/sites/947780008751768186/products?page=1&per_page=120&sort_by=category_order&sort_order=asc&categories[]=11ea746b801d3743a53a0cc47a2b63cc&include=images,media_files&excluded_fulfillment=dine_in';
const businessName = 'Okanagan Skate'
let count = 0;


const main = async (urlCall) =>{
    const response = await axios(urlCall);
    //console.log(response.data.data);

    const data = await Object.values(response.data.data).map(async item =>{
        count++;

        const id = item.id.toString();
        const title = item.name;
        const business_name = businessName;
        const url = item.site_link;
        const place_id = item.site_id;
        //handle
        const colors = [];
        //vendor
        const tags = [];
        const product_type = item.product_type;
        const original_price = item.price.high_subunits;
        const compare_at_price = original_price;
        let productId = getId(url);
        const sizes = await getSizes(productId);
        //const images = item.images;
        const images = await getImages(item.images.data); // gets every absolute url image
        //  const options = await getOptions(productId);
        const created_at = item.created_date;
        const updated_at = item.updated_date;
        const is_on_sale = item.on_sale;
        const rating = item.avg_rating_all;
        //const body_html = await getDescription(productId);
        const body_html = item.short_description;


        return{
            id,
            title,
            business_name,
            url,
            place_id,
            tags,
            images,
            rating,
            body_html,
            //created_at,
            product_type,
            //updated_at,
            colors,
            compare_at_price,
            original_price,
            sizes, 
            is_on_sale
        };

    });

    Promise.all(data).then(
        value => {
            for(var i =0; i < value.length; i++){
               // console.log(chalk.green('This is item number: ') + chalk.blue(i));
                for(let v in value[i]){
                    // if(v == 'images' || v == 'IMAGES'){
                    //     console.log(v);
                    //     for(prop in value[i]['images'])
                    //         console.log(value[i]['images'][prop])
                    // }
                   // console.log(chalk.red(v.toUpperCase()) + ": " + value[i][v]);
                }
                try {
                    fs.writeFileSync('./okanaganSkate.json', JSON.stringify(value, null, 4));
                }
                catch (err){
                    console.log('error writing to file okanagan ' + err.message)
                }
            }
        }
    )
    await console.log('Total number of items scraped for Okanagan Skate is: ' + count);
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
        console.log('error getting desription')
    }
}

const getSizes = async (productId)=> {
    let sizes = [];
    try {
        const productCall = `https://cdn5.editmysite.com/app/store/api/v18/editor/users/117455569/sites/947780008751768186/store-locations/11e9bd18fde6323080f40cc47a2b63ac/products/${productId}/skus?page=1&per_page=100&include=image,media_files,product`;
        let response = await axios(productCall);
        let data = response.data.data
        for (let p in data) {
            if (data[p].inventory > 0) {
                sizes.push(data[p].name);
            }
        }
        return sizes;
    }catch (err){
        console.log('error getting sizes');
    }
}

const getImages = async (arr) =>{

    let images = [];
    let src;
    for(let i=0; i<arr.length; i++){

        arr.map((index,element) =>{
            if(element == 'absolute_url'){
                src = arr[i][index]
               
            }
            
            const position = index + 1;
       
            return{src,position};
        });  
        }

    return images;
}
module.exports={main,baseURL,count};

main(baseURL);