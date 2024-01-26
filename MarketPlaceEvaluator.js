const cheerio = require('cheerio');
const axios = require("axios");
const { convert } = require('html-to-text');
const  countries  = require('world_countries_lists/data/countries/en/countries.json');



class MarketPlaceEvaluator {
  static DEFAULT = {
    TARGET: ['country','country of origin','place of origin'],
    MESSAGES: ['not found', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'default',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }

  
  static DESERTCART = {
    TARGET: ['from'],
    MESSAGES: ['not found', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'desertcart',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }

  static SHOPEE = {
    TARGET: ['Shipping From'],
    MESSAGES: ['not found', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'shopee',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }

  static DARAZ = {
    TARGET: ['Shipping From'],
    MESSAGES: ['product is no longer available', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'daraz',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }

  static MANOMANO = {
    TARGET: ['Shipping From'],
    MESSAGES: ['product is no longer available', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'manomano',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }
  
  static UBUY = {
    TARGET: ['imported from'],
    MESSAGES: ['product is no longer available', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'ubuy',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }

  static AMAZON = {
    TARGET: ['origin'],
    MESSAGES: ['sorry', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'amazon',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }

  static EBAY = {
    TARGET: ['Country of Origin'],
    MESSAGES: ['page is missing', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'ebay',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }

  
  static ALIBABA = {
    TARGET: ['Place of Origin'],
    MESSAGES: ['page is missing', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'alibaba',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }

  
  static JUMIA = {
    TARGET: ['Production Country'],
    MESSAGES: ['page is missing', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'jumia',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }


  static FRUUGO = {
    TARGET: ['Production Country'],
    MESSAGES: ['no longer available', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'fruugo',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }

  static GLOBALSOURCES = {
    TARGET: ['Production Country','origin'],
    MESSAGES: ['no longer available', 'home page', 'error','404'],
    RANGE : 100,
    marketplaceQuery: 'globalsources',
    async evaluate(url){
      return await evaluateMarketPlace(url,this)
    }
  }
}

// console.log(countries[0])
//detect by country name ie China Germany
//detect by country code alpha 2 cn
//detect by country code alpha 3 chn


//returns true or false
async function evaluateMarketPlace(url,info){
  try {
    console.log("evaluating "+url)
    // Fetch HTML of the page we want to scrape
    const { data } = await axios.get(url);
    // Load HTML we fetched in the previous line
    const $ = cheerio.load(data);
    const html = $('body').html()
    const text = convertToHtml(html)

    const {TARGET, MESSAGES, RANGE} = info
    const target = TARGET
    const targetError = MESSAGES
    const findRange = RANGE
    
    let foundCountry = ""
    const value = getTargetFieldValue(text,target,findRange)
    console.log(value)
    if(value){
      console.log("got target field")
      // console.log(value)
      //check target field for country
      foundCountry = await countries.find(country=>{
        //check for country
        //check for alpha 2
        //check for alpha 3
        console.log(country)
        // if(value.indexOf(country.name.toLowerCase()) >= 0 ||
        // value.indexOf(country.alpha2.toLowerCase()) >= 0 ||
        // value.indexOf(country.alpha3.toLowerCase()) >= 0){
        if(value.indexOf(country.name.toLowerCase()) >= 0){
          return true
        }else{
          return false
        }
      })
    }

    if(foundCountry){
      console.log("the country is " + foundCountry.name)
      console.log("Found country")
      return foundCountry.name
    }else if(checkProductNotExist(text,targetError)){
      // determine if product not found error message is found
      console.log("product not found")
      return "product not found"
    }else{
      //else no country found and error message found
      console.log("country not found")
      return "country not found"
    }

  }catch(err){
    // console.log(err)
    console.log(err.code)
    console.log(err.response.status)
    // console.log(err)
    throw err.response.status
  }
}

//returns string of 100 length
function getTargetFieldValue(text, targets, findRange = 100){
  
  
  const foundTarget = targets.some(target => {
    return (text).match(target.toLowerCase())
  })
  console.log("found get target "+ foundTarget)
  if(foundTarget){
    
    for(let i=0;i<targets.length;i++){
      const indexOfTarget = text.indexOf(targets[i].toLowerCase())
      // console.log(indexOfTarget)
      if(indexOfTarget > 0){
        const retrivePossibleTargetValue = text.slice(indexOfTarget,indexOfTarget+findRange)
        // console.log(retrivePossibleTargetValue)
        return retrivePossibleTargetValue
      }
    }
  }
  return false
}


//find text error, 404, product not found
function checkProductNotExist(text, targets){
  
  // console.log(text)
  const foundTarget = targets.some(target => {
    return (text).match(target.toLowerCase())
  })
  if(foundTarget){
    return true
  }
  return false
}


function convertToHtml(html){
  const options = {
    wordwrap: 100,
  };
  const conversionText = convert(html, options);
  const text = conversionText.toLowerCase()

  return text
}


module.exports = {MarketPlaceEvaluator};