const countryCodes = require('country-codes-list')
const cheerio = require('cheerio');
const axios = require("axios");
const {MarketPlaceEvaluator} = require('./MarketPlaceEvaluator');

const links = require('./links');
const englishLinks = require('./englishLinks').links;
// console.log(links)

// const link = "https://www.ebay.ie/itm/256354742894?hash=item3bafeef26e:g:jegAAOSwu29lifwJ&amdata=enc%3AAQAIAAAA4PMNG27S2uhemOV7a3i9BqOBx7XQInaiW1lHEfubGqpniXixqR%2F4CXrkWz%2BUSb%2BPFzwKx8KbUIVHUN8aVUnWmtQpv0z7g4uwxZVXNLWTyrdKRqr4a5T61%2BcSYEns2rLslE%2B7mU7fo2%2FXObwExC8On2OcNwRdX62Q7WACMxRUNJfDDs8iiU8%2BI7R8eytye9PUkg2t6wySiam8lgF0KWlPUBG3GXZP93%2F5Mpje5Ej8xMju9yzpqr%2BwayTFEgmVdrANCgbUuEhTXYsQLv2%2FbdAYL6%2BNf80bUVJ0dNoT%2FjDcPKvT%7Ctkp%3ABFBMgKfm0Zpj";
// const url = new URL(link);
// const tld = url.hostname.split('.').pop();
// console.log(url.hostname)
// console.log(url.host)
// console.log('Original Link:', link);
// console.log('Top-Level Domain (TLD):', tld);


const deadSites = [];
const marketPlaceFoundCountry = []
const marketPlaceNotFoundCountry = []
const productNotFound = []


// Create a function to get the marketplace information based on the URL
function getMarketplaceInfo(url) {
    const marketplaceKeys = Object.keys(MarketPlaceEvaluator);
    let longestMatch = null;
    let longestMatchLength = 0;

    for (const key of marketplaceKeys) {
        const marketplace = MarketPlaceEvaluator[key];
        if (url.includes(marketplace.marketplaceQuery)) {
            if (marketplace.marketplaceQuery.length > longestMatchLength) {
                longestMatch = marketplace;
                longestMatchLength = marketplace.marketplaceQuery.length;
            }
        }
    }

    return longestMatch ? longestMatch : MarketPlaceEvaluator['DEFAULT'];
}

async function classifyURL(url) {
  let marketPlace = getMarketplaceInfo(url);
  let evaluated;
  try {
    evaluated = await marketPlace.evaluate(url);
  } catch (error) {
    console.log(error)
    if(error==503){
      productNotFound.push(url)
    }else{
      deadSites.push(url);
    }
  }
  console.log("----------------------------------------------------------")

  if (evaluated) {
    if(evaluated == "product not found"){
      productNotFound.push(url)
    }else if(evaluated == "country not found"){
      marketPlaceNotFoundCountry.push(url)
    }else{
      marketPlaceFoundCountry.push([url,evaluated]);
    }
  }

}

async function classifyURLs(urls, concurrentLimit) {
  let links = urls.links
  for(let i=0;i<concurrentLimit;i++){
    await classifyURL(links[i])
  }
  // console.log(urls)
}



(async () => {
  console.log("evaluating") 
  // await MarketPlaceEvaluator.DEFAULT.evaluate(englishLinks[0])
  await classifyURLs(links,10)
  console.log("found country")
  console.log(marketPlaceFoundCountry)
  console.log("country notfound")
  console.log(marketPlaceNotFoundCountry)
  console.log("product notfound")
  console.log(productNotFound)
  console.log("dead sites")
  console.log(deadSites)
  
})()


// console.log(myCountryCodesObject)

// const countries = []~
// const excempt = []

// links.map(link=>{
//   const url = new URL(link);
//   const tld = url.hostname.split('.').pop();
//   let TLD = tld.toUpperCase();
//   //if no tld not in countries
//   //check subdomain
//   if(TLD in myCountryCodesObject && !excempts.includes(link)){
//     let TLD = tld.toUpperCase();
//     if(countries[TLD] != null)
//     countries[TLD]++
//     else
//     countries[TLD]=1
//   }else{
//     if(excempt[TLD] != null)
//     excempt[TLD]++
//     else
//     excempt[TLD]=1

//   }
// })

// console.log(countries)
// console.log(excempt)
// const link = "https://german.alibaba.com/p-detail/Wholesale-1601006130256.html?spm=a2700.picsearch.normal_offer.d_image.1b085f937iKuxv";
// (async () => {
//   try {
//     // Fetch HTML of the page we want to scrape
//     const { data } = await axios.get(link);
//     // Load HTML we fetched in the previous line
//     const $ = cheerio.load(data);
//     // console.log($('span:contains("Country")').length)
//     // console.log($('span:contains("Country")').parent().text());
//     let p = $('div > div:contains("Ursprungsort")').parent()
//     console.log("text")
//     console.log(p.text())
//   }catch(err){
//     console.log(err)
//   }
// })()


async function scrapeData(link) {
  try {
    // Fetch HTML of the page we want to scrape
    const { data } = await axios.get(link);
    // Load HTML we fetched in the previous line
    const $ = cheerio.load(data);
    // console.log($('span:contains("Country")').length)
    // console.log($('span:contains("Country")').parent().text());
    let p = $('span:contains("Country")').parent()
    if(p.length == 0)
      p = $('div:contains("Country")').parent()
    if(p.length == 0)
      p = $('div:contains("Place")').parent()

    if(p.length == 0)
      p = $('font:contains("Place")').parent()
    console.log(p.length)

    const pp = (p) => {
      return p.parent()
    }

    const loopThroughCountryNames = (p) => {
      return countryNames.find(c => {
        return p.text().includes(c)
      })
    }
    const url = new URL(link);
    console.log(url.hostname)
    for(let i=0;i<5;i++){
      p = pp(p)
      let c = loopThroughCountryNames(p)
      if(c){
        console.log("Found")
        console.log(c)
        break;
      }else{
        console.log("not found")
      }
    }
    // $('*:contains("Country")').map(l=>{
    //   console.log(l.text())
    // })

  }catch(err){
    console.log("err")
  }
}

// Google Translate API key

// // Function to translate text using libretranslate API
// async function translateText(text, targetLanguage) {
//   const apiUrl = `https://libretranslate.de/translate`;

//   try {
//     const response = await axios.post(apiUrl, {
//       q: text,
//       source: 'auto', // Source language code (e.g., 'en' for English)
//       target: targetLanguage,
//     });

//     return response.data.translatedText;
//   } catch (error) {
//     console.error('Error translating text:', error.message);
//     throw error;
//   }
// }

// // Example usage
// async function main() {
//   try {
//     const targetLanguage = 'en'; // Target language code (e.g., 'es' for Spanish)
//     const originalUrl = link;

//     // Fetch the original page content
//     const originalResponse = await axios.get(originalUrl);
//     const originalContent = originalResponse.data;

//     // Translate the content
//     const translatedContent = await translateText(originalContent, targetLanguage);

//     // Now you can proceed with scraping the translated content
//     console.log(translatedContent);
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }

// Run the main function
// main();