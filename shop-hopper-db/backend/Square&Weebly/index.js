const kaleco = require('./Weebly/Kaleco/index');
const okanagan = require('./Weebly/OkanaganSkate/index');
const morgane = require('./Square/Morgane/index');
const sassyShoes = require('./Square/SassyShoes/index');
const tigerLily = require('./Square/TigerLily/index');


export const scrapeAll = async ()=> {

   // await kaleco.main(kaleco.baseURL);
   const data =await okanagan.main(okanagan.baseURL);
   //await morgane.main(morgane.baseURL);
   //await sassyShoes.main(sassyShoes.baseURL);
   //await tigerLily.main(tigerLily.baseURL);

   console.log(data);

   return data;

}


//scrapeAll();
