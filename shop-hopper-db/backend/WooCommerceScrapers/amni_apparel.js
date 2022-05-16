const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const url = "https://amniapparel.com/shopnow/";
let finalres = new Array();

async function scrapeMain(page) {
    
    let result;

    //get last page
    let end_page;
    end_page = await get_pagination_end(url,page);
    await sleep(1000);
    //pagination loop
    for(let i = 1; i <= end_page; i++){
      
    await page.goto(url +'/page/'+ i +'/');
    const html = await page.content();
    const $ = await cheerio.load(html);
      
    result = $('.product-type-variable').map((index,element) =>{

        const titleElement = $(element).find(".woocommerce-loop-product__title");
        const urlElement = $(element).find(".woocommerce-loop-product__link");
        
        const id = $(element).attr("class").split(" ")[2].split("-")[1];
        const title = titleElement.text();
        const business_name = $("title").text().split("|")[1].trim(); 
        const url = urlElement.attr('href');
        
        return{id,title,business_name,url};
    }).get();
        finalres.push(result);
    }

  finalres = finalres.flat();
  return finalres;
}


async function scrapeSecondary(item,page)
{
    
    for(var i=0;i<item.length;i++){

        await page.goto(item[i].url)
        const html = await page.content();
        const $ = await cheerio.load(html);
        await sleep(1000);

        //vendor
        item[i].vendor = $(".woocommerce-product-attributes-item--attribute_pa_brands").find('.woocommerce-product-attributes-item__value').text();

        //scrape tags
        let tags = [];
        $(".tagged_as").find('a').each((index,element) => 
        {
            const tag = $(element).text()
            tags.push(tag);
        });
        //insert tags into JSON
        item[i].tags = tags;
      
        //variant
        const v = JSON.parse($(".cart").attr("data-product_variations"));
        let index = 1;
        item[i].variants = Object.values(v).map(elem => {
            const id = elem.variation_id;
            const sku = elem.sku;
            let price = elem.display_price.toString().replace(".","");
            
            if(elem.display_price.toString().indexOf(".") == -1)
            {
 
                 price = price + "00";
            }
        
            const size = elem.attributes.attribute_pa_size;
            let color = elem.attributes.attribute_pa_color;
 
            if(color == undefined)
            {
                 color = "";
            }
        
            const position = index;
             index++;
        
            const available = elem.is_in_stock;
            let compare_at_price = elem.display_regular_price.toString().replace(".","");

            if(elem.display_regular_price.toString().indexOf(".") == -1)
            {
 
                compare_at_price = compare_at_price + "00";
            }
 
        
            return{id,sku,price,size,color,position, available, compare_at_price};
             
         });
                
        //images
        item[i].images = $('.woocommerce-product-gallery__image').map((index,element) =>{
            
            const src = $(element).find("a").find("img").attr("data-large_image");
            const width = $(element).find("a").find("img").attr("data-large_image_width");
            const height = $(element).find("a").find("img").attr("data-large_image_height");
            const position = index + 1;
       
            return{src,height,width,position};
        }).get();
      
      
    //body html
    item[i].body_html = $(".et_pb_wc_description_0_tb_body").find('.et_pb_module_inner').html();
      
    //product_type
     let categories = [];
     $(".posted_in").find('a').each((index,element) => 
     {
         const tag = $(element).text()
         categories.push(tag);
     });

     item[i].product_type = categories[0];

    //colors
    item[i].colors = $('.woocommerce-product-attributes-item--attribute_pa_color').find('.woocommerce-product-attributes-item__value').text().trim().split(',');
 
    //price
    item[i].compare_at_price = $('.et_pb_wc_price_0_tb_body > div > p > span').find('bdi').text().replace('$','').replace('.','');

    item[i].original_price = item[i].compare_at_price;

    if(item[i].original_price.length == 0)
    {
        item[i].original_price = $('.et_pb_wc_price_0_tb_body > div > p > ins > span').find('bdi').text().replace('$','').replace('.','');
        item[i].compare_at_price = $('.et_pb_wc_price_0_tb_body > div > p > del > span').find('bdi').text().replace('$','').replace('.','');
    }

    item[i].original_price = parseInt(item[i].original_price);
    item[i].compare_at_price = parseInt(item[i].compare_at_price);

         
    }
    
    return item;
}


export async function main()
{
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    const item_title_and_url = await scrapeMain(page);
    const item_info = await scrapeSecondary(item_title_and_url,page);

    let data = JSON.stringify(item_info);

    await writeJSOn("backend/WooCommerceScrapers/amni_apparel.json",data);

    data = item_info;

    return data;

}

//main();



//limit number of requests
async function sleep(miliseconds)
{
    return new Promise(resolve => setTimeout(resolve,miliseconds));
}

//function to get how many pages will needed to be scraped
async function get_pagination_end(url,page)
{

    await page.goto(url);
    const html = await page.content();
    const $ = await cheerio.load(html);

    const last_page = $(".page-numbers li:nth-last-child(2)").text();

    return last_page;
}

//write json file
async function writeJSOn(filename, data)
{
     fs.writeFile(filename, data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}