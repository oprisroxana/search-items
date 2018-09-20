const request = require('request');
const {catObject, catArray} = require('./constants');

let randasin_url = "https://www.amazon.com/s/?rh=n%3A{{NODE}}%2Ck%3A-aaa&page={{PAGE}}";
let  asin2kw = "https://sellercentral.amazon.com/hz/cm/keyword/suggest?asins[]={{ASIN}}";
let volume_url_template = "https://sellercentral.amazon.{{marketplace}}/sspa/hsa/cm/keywords/power";
let suggesturl = "https://completion.amazon.com/search/complete?method=completion&mkt=1&p=Search&l=en_US&b2b=0&fresh=0&sv=desktop&client=amazon-search-ui&x=String&search-alias=aps&q={{q}}&qs={{qs}}&cf=1&fb=1&sc=1&";

const  marketplace = "com";
let opportunities = [];
let total_found = 0;

let n_opps = 10;
let minvol = 3000;
let cat = 0;
let nwords = 0;

let sendResponse = () => {};
let cookieSellerCentral = '';
let cookieAMS = '';

 /* array.random() prototype - return random array element */
 Array.prototype.random = function () {return this[Math.floor((Math.random()*this.length))];}

async function search (req, res, next) {
  const {
    nrwords = 10,
    category = 0,
    minvolume = 3000,
    nropportunities = 10,
    cookiesellercentral,
    cookieams
  } = req.headers;
  
  n_opps = parseInt(nropportunities);
  minvol = parseInt(minvolume);
  cat = catObject[category];
  nwords = parseInt(nrwords);
  
  sendResponse = res;
  cookieAMS = cookieams;
  cookieSellerCentral = cookiesellercentral;
 
  get_opportunities(n_opps)
}

/* start n threads looking for opportunities */	
const get_opportunities = (n) =>{
	for(let i=0;i<n;i++){
		random_asin(random_node());
	}
}


/* return random node */
const random_node = () => cat || catArray.random();

/* generate a random integer between min and max */
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* get a random ASIN from a random page from a random browse node */
const random_asin = (node) => {
	let url = randasin_url.replace("{{NODE}}", node);
	const page = getRandomInt(1, 400);
  url = url.replace("{{PAGE}}", page);

  const options = {
    url,
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
    }
  }

  request(options, (err, res, data) => {
    if (err) console.log(err);

    const regex = /data-asin="(.+?)"/g;
    let m;
    let asins = [];
    do {
      m = regex.exec(data);	
      if(m!=null)
      asins.push(m[1]);
    } while(m);
    random_kw(asins.random());
  });
}

/* get a random keyword from a random ASIN */	
const random_kw = (asin) => {
  const url = asin2kw.replace("{{ASIN}}", asin);
  const options = {
    url,
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
      'cookie': `${cookieSellerCentral}`
    }
  }

  request(options, (err, res, data) => {
    if (err) console.log(err);

    const regex = /<td class="c1">(.*)<\/td>/g;
    let m;
    let kws = [];
    do {
      m = regex.exec(data);	
      if(m!=null) kws.push(m[1]);
    } while(m);
    
    if(kws.length==0) console.log("You need to be logged in Seller Central!");
    get_suggest(kws.random());
  });
}
	
/* get keyword suggestions starting from a seed keyword */
const get_suggest = (keyword) => {
	let url = suggesturl.replace("{{q}}", keyword);
  url = url.replace("{{qs}}", "");
  
  const options = {
    url,
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'accept': 'application/json',
    }
  }

  request(options, (err, res, data) => {
    if (err) console.log(err);

      const r = data && data.split('=')
			const regex = /\,\[\"(.*?)\"\]\,/g;
       
      if(r==undefined||r==null)
      random_asin(random_node());	
			else
      {
        const x1 = regex.exec(r);
        if(x1==undefined||x1==null)
					random_asin(random_node());	
				else
					{
          const x2 = x1[1];	
					if(x2==undefined||x2==null)
						random_asin(random_node());		
					else
						{
            const x3 = x2.split("\",\"");
						if(x3==undefined||x3==null)
							random_asin(random_node());	
						else
							{
							var kwd = x3.slice(0,3).random();
							var kwdl = kwd.split(" ").length;
							if(nwords&&kwdl!=nwords)
								{
								console.log(kwd+" rejected because it has "+kwdl+" words");
								random_asin(random_node());
								}
							else
								get_volume(x3.slice(0,3).random());	
						}
					}
				}
			}
  });
}	
	

/* get exact search volume for keyword - if higher than minvol, add to opportunities */	
const get_volume = (keyword) => {
	const url = volume_url_template.replace("{{marketplace}}",marketplace);
	const klist = [{key: keyword, matchType: "EXACT"}];
  const req = {keywordList: klist, pageId: "https://www.amazon.com/HSA/pages/default"};
  
  const options = {
    url,
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cookie': `${cookieAMS}`
    },
    body: JSON.stringify(req),
    dataType: "json",
    thekw: keyword
  }
  
  request(options, (err, res, result) => {
    if (err) console.log(err);

    const data = JSON.parse(res.body)
    const thekw = options.thekw;
    let volume = 0
  
    if(data==undefined||data[0]==undefined||data[0].impression==undefined) {
      console.log("You need to be logged in AMS!");
    } else {
      volume = Math.round(data[0].impression*30.41);
    }

    if (volume<minvol) {
      console.log("Volume of "+thekw+" is just "+volume+" - because we only have "+total_found+" opportunities, keep looking.");
      console.log(opportunities);
      random_asin(random_node());	
    } else {
      total_found++;
      opportunities.push([thekw,volume]);

      if(total_found==n_opps)show_results(options.response); 
    } 
  }); 
}
	
/* display the results */	
const show_results = () =>{
  let html = "";
	for(let i=0;i<n_opps;i++){
    let x = i+1;
		html += "<p>"+x+". <a target=\"_blank\" href=\"https://www.amazon.com/s/?keywords="+opportunities[i][0]+"\">"+opportunities[i][0]+"</a> - "+opportunities[i][1]+" exact monthly searches</p>";
  }

  sendResponse.send(html)
}

module.exports = search;