import { data } from 'cheerio/lib/api/attributes';

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');

const url = "https://alpacashop.ca/womens-alpaca-apparel/";

let finalres = [];

async function scrapeMain(url,page) {
    
    let result;
    let end_page;
    
    //get amount of pages
    end_page = await get_pagination_end(url,page);

    //sleep to limit requests
    await sleep(1000);

    //pagination loop
    for(let i = 1; i <= end_page; i++){
    
    
    await page.goto(url +'?page='+ i);
    const html = await page.content();
    const $ = await cheerio.load(html);
   

    result = $('li.product').map((index,element) =>{
        
        const titleElement = $(element).find(".card-title");
        
        const id = $(element).find(".quickview").attr("data-product-id");

        const title = titleElement.find('a').text();

        const business_name = $("title").text().split('|')[0].split('s')[1];

        const url = titleElement.find('a').attr('href');

        const place_id = null;
        
        const handle = null;

        const vendor = business_name;

        return{id,title,business_name,url,place_id,handle,vendor};
    }).get();
       
        finalres.push(result);
        
    }

  data = finalres.flat();
  return data;
}

async function scrapeSecondary(item,page)
{
    
    for(var i=0;i<item.length;i++){

        await page.goto(item[i].url)
        const html = await page.content();
        const $ = await cheerio.load(html);
        await sleep(1000);
        
        item[i].tags = [];
         
        //get sizes and colors to make variants
        let sizes = [];
        $(".form-option-variant").each((index,element) => 
        {
            const s = $(element).text();
            if(s != '')
            {
            sizes.push(s);
            }
        });


        let colors = [];
        $(".form-option-variant--color").each((index,element) => 
        {
            const c = $(element).attr("title");
            colors.push(c);
        }); 

        const price = $('div.productView-price > div > span').text().replace('$','').replace('.','');

        //variants
        item[i].variants = await get_variants(price, colors, sizes) 
    
        //images
        item[i].images = $('.productView-thumbnail').map((index,element) =>{
            
            const src = $(element).find('.productView-thumbnail-link').attr("href");
            const position = index + 1;
       
            return{src,position};
        }).get();

        item[i].options = null;

        item[i].rating = null;

      
       
    //body html
    item[i].body_html = $("#description-content").html();
    
    item[i].created_at = Date.now();



      
    //product_type
    item[i].product_type = $(".breadcrumbs li:nth-child(2)").text().trim();

    item[i].published_at = Date.now();

    item[i].updated_at = Date.now();
         
    //colors
    item[i].colors = colors;

    item[i].gender = null;


 
    //price
    item[i].compare_at_price = price;
    item[i].original_price = price;

    item[i].sizes = [];
    item[i].buckets = [];
    item[i].is_on_sale = null;
    item[i].sale_ratio = null;
    item[i].is_available = null;

      
    }

    return item;
}

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

    const last_page = $(".pagination-list li:nth-last-child(2)").text().trim();

    return last_page;
}

async function get_variants(price,colors,sizes)
{
    let variants=[];
    //website only shows available products
    const available = true;
    //does not show onsale or not so assume compare_at same as price
    const compare_at_price = price;

    if(colors.length > 0 && sizes.length == 0)
    {
        for(var i = 0; i < colors.length; i++){
        const color = colors[i];
        const size = null;
        variants.push({price,size,color,available,compare_at_price});}
    }

    else if(colors.length == 0 && sizes.length > 0)
    {
	    for(var i = 0; i < sizes.length; i++){
    	    	const color = null;
    		    const size = sizes[i];
    		    variants.push({price,size,color,available,compare_at_price});}
    }

    else if(colors.length > 0 && sizes.length > 0)
    {
	    for(var i = 0; i < sizes.length; i++){
    		    const size = sizes[i];
    		    for(var j = 0; j < colors.length; j++){
    			    const color = colors[j];
    		    	variants.push({price,size,color,available,compare_at_price});
		    }
	    }
    }

    return variants;
}


//main function to call all scraping functions
export async function main()
{
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();

    //scrape clothing
    const item_title_and_url = await scrapeMain(url,page);
    const item_info = await scrapeSecondary(item_title_and_url,page);

    // convert JSON object to string
    const data = JSON.stringify(item_info);

    // write JSON string to a file
    await writeJSOn("backend/AlpacaScraper/alpaca.json",data);
}

//m();


//---------------utility functions--------------------------------//
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