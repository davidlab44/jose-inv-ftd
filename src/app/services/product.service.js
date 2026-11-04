function urlAll(host) { return `${host}/prdt`; }
function urlAllProducts(host,limit=20) { return `${host}/prdt?limit=${limit}`; }
function urlSearch(host,hash) { return `${host}/prdt?data->>name=ilike.*${encodeURIComponent(hash)}*&limit=20`; }
function urlById(host,id) { return `${host}/prdt?id=eq.${id}`; }
function urlByBarcode(host,barcode) { return `${host}/prdt?data->>barcode=eq.${barcode}&limit=1`; }
function nodeHost(){const host=process.env.PIM_API_HOST;if(!host)throw new Error('PIM_API_HOST no está definido');return host;}
async function request(url,options={}){debugger;const response=await fetch(url,options);debugger;if(!response.ok)throw new Error(`HTTP ${response.status}: ${await response.text()}`);const text=await response.text();debugger;return text?JSON.parse(text):null;}
async function getAll(){return request(urlAll(nodeHost()));}
async function getAllProducts(limit=20){return request(urlAllProducts(nodeHost(),limit));}
async function searchProducts(hash){return request(urlSearch(nodeHost(),hash));}
async function getProductById(id){return request(urlById(nodeHost(),id));}
async function getProductByBarcode(barcode){return request(urlByBarcode(nodeHost(),barcode));}
async function post(data){return request(`${urlAll(nodeHost())}?select=*`,{method:'POST',headers:{'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify({data})});}

  async function patch(id,data){
    return request(urlById(nodeHost(),id),{
      method:'PATCH',
      headers:{'Content-Type':'application/json','Prefer':'return=representation'},
      body:JSON.stringify({data})
    });
  }

       async function updateProductQty(id,p){return request(urlById(nodeHost(),id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:p.data})});}
async function deleteProduct(id){return request(urlById(nodeHost(),id),{method:'DELETE',headers:{'Content-Type':'application/json'}});}
module.exports={urlAll,urlAllProducts,urlSearch,urlById,urlByBarcode,request,getAll,getAllProducts,searchProducts,getProductById,getProductByBarcode,post,patch,updateProductQty,delete:deleteProduct};
