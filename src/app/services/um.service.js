function urlAllUms(host){return `${host}/um`;}
function urlUmById(host,id){return `${host}/um?id=eq.${id}`;}
function nodeHost(){const host=process.env.API_HOST;if(!host)throw new Error('API_HOST no está definido');return host;}
async function request(url){debugger;const response=await fetch(url);debugger;if(!response.ok)throw new Error(`HTTP ${response.status}: ${await response.text()}`);const data=await response.json();debugger;return data;}
async function getAllUms(){return request(urlAllUms(nodeHost()));}
async function getUmById(id){return request(urlUmById(nodeHost(),id));}
module.exports={urlAllUms,urlUmById,request,getAllUms,getUmById};
