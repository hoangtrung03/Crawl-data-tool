const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const urlArr = [
  "https://cellphones.com.vn/mobile/tecno.html",
  "https://cellphones.com.vn/mobile/asus.html",
  "https://cellphones.com.vn/mobile/nokia.html",
  "https://cellphones.com.vn/mobile/realme.html",
  "https://cellphones.com.vn/mobile/vivo.html",
  "https://cellphones.com.vn/mobile/oppo.html",
  "https://cellphones.com.vn/mobile/xiaomi.html",
  "https://cellphones.com.vn/mobile/samsung.html",
  "https://cellphones.com.vn/mobile/apple.html",
];

async function scrapeProductData(url, data) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    let name = $(".box-product-name").text().trim();
    let image = $(".box-ksp img").attr("src");
    let priceTemp = $(".product__price--show").text();
    let price = Number(priceTemp.trim().replace(/[^\d]/g, ""));
    let priceTempBefore = $(".product__price--through").text();
    let price_before_discount = Number(
      priceTempBefore.trim().replace(/[^\d]/g, "")
    );
    //idcategory gau bong: 641feb8f991f08003372d90b
    //idcategory laptop: 641f145a7ab142003231ece6
    //idcategory smart phone: 641a5fc38383ec002c66151f
    let category = "641a5fc38383ec002c66151f";
    let quantity = Math.floor(Math.random() * 200) + 60;
    let sold = Number(quantity / 2);
    let view = Math.floor(Math.random() * 1000) + 600;
    let randDecimal = Math.random() * (4 - 3 + 1) + 3;
    const rating = Number(randDecimal.toFixed(1));
    const images = [];
    $(".gallery-slide img").each(function () {
      const src = $(this).attr("src");
      images.push(src);
    });
    console.log(images);

    let productData = {
      name,
      image,
      images,
      price,
      price_before_discount,
      category,
      quantity,
      sold,
      view,
      rating,
    };
    // console.log(productData);
    let rawData = fs.readFileSync("data.json");
    let jsonData = JSON.parse(rawData);

    if (!Array.isArray(jsonData)) {
      jsonData = [];
    }

    let isProductExist = jsonData.some((p) => p.name === name);

    if (!isProductExist) {
      jsonData.push(productData);
      fs.writeFileSync("data.json", JSON.stringify(jsonData));
      console.log(`Đã ghi ${productData.name} vào file JSON`);
      data.push(productData);
    } else {
      console.log(`Đã tồn tại ${productData.name} trong file JSON`);
    }
  } catch (error) {
    console.error(error);
  }
}

async function scrapeSite(url) {
  let data = [];
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const productLinks = $(".product-info a");

    for (let i = 0; i < productLinks.length; i++) {
      let productUrl = $(productLinks[i]).attr("href");
      await scrapeProductData(productUrl, data);
    }
  } catch (error) {
    console.error(error);
  }
}

urlArr.forEach((url) => {
  console.log('Đang crawl data tại: ', url);
  scrapeSite(url);
});
