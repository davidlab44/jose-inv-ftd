function urlAllCategories(host){
  return `${host}/categ`;
}

function urlCategById(host,id){
  return `${host}/categ?id=eq.${id}`;
}

function nodeHost(){
  const host=process.env.PIM_API_HOST;if(!host)throw new Error('PIM_API_HOST no está definido');return host;
}

async function request(url){debugger;const response=await fetch(url);debugger;if(!response.ok)throw new Error(`HTTP ${response.status}: ${await response.text()}`);const data=await response.json();debugger;return data;}

async function getAllCategories(){return request(urlAllCategories(nodeHost()));}

async function getCategById(id){
  return request(urlCategById(nodeHost(),id));
}

module.exports={
  urlAllCategories,urlCategById,request,getAllCategories,getCategById
};
