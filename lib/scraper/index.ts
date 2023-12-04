"use server"

import axios from "axios";
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from "../utils";



export async function scrapeAmazonProduct(url:string){
    if(!url)return;


    // BrightData proxy configration
    const username = String(process.env.BRIGHT_DATA_USENAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;

    const options ={
        auth:{
            username:`${username}-session-${session_id}`,
            password,
        },
        host:'brd.superproxy.io',
        port,
        rejectUnauthorized:false,
    }

    try{
        const response = await axios.get(url,options)
        const $ = cheerio.load(response.data);

        // Extract the product
        const title = $(`#productTitle`).text().trim();
        const currentPrice = extractPrice(
            $('.priceToPay sapn.a-price-whole'),
            $('a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('.a-price.a-text-price'),
            $('.a-offscreen'),

        );
        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price'),
        );
        const outOfStock = $('#availiblity span').text().trim().toLocaleLowerCase() === 'currently unavailable';
        const image = $('#imageBlkFront').attr('data-a-dynamic-image') ||
                      $('#landingImage').attr('data-a-dynamic-image')  ||
                      '{}'
        const imagesUrls = Object.keys(JSON.parse(image))
        const currency = extractCurrency($('.a-price-symbol'))
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g,'');
        const description = extractDescription($)


        // Consrtuct Data Object With scraped information 
        const data = {
            url,
            currency : currency || '$',
            image:imagesUrls[0],
            title,
            currentPrice:Number(currentPrice) ||Number(originalPrice),
            originalPrice:Number(originalPrice)|| Number(currentPrice),
            priceHistory:[],
            discountRate:Number(discountRate),
            category:'category',
            reviewsCount:100,
            stars:4.5,
            isOutOfStock:outOfStock,
            description,
            lowestPrice:Number(currentPrice) ||Number(originalPrice),
            highestPrice:Number(originalPrice) ||Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        }

        return data;        

    }catch(error:any){
        throw new Error(`failed to scrape product: ${error.message} `)
    }
}