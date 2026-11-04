const { Subject, from } = require('rxjs');
const { debounceTime, distinctUntilChanged, tap, switchMap } = require('rxjs/operators');
const productService = require('../../../../services/product.service.js');
const categoryService = require('../../../../services/category.service.js');
const umService = require('../../../../services/um.service.js');
function getCategoryNameById(categories, id) {
  debugger;
  if (id == null || !Array.isArray(categories) || !categories.length) return 'Sin categoría';
  const nombre = categories.find(c => Number(c.id) === Number(id))?.data?.name_es_CO;
  return typeof nombre === 'string' && nombre.trim() ? nombre : 'Sin categoría';
}
function getUmNameById(ums, id) {
  debugger;
  if (id == null) return 'Sin UM1';
  const idNum = Number(id);
  if (isNaN(idNum)) return 'Sin UM2';
  if (!Array.isArray(ums) || !ums.length) return 'Sin UM3';
  const um = ums.find(u => Number(u.id) === idNum);
  if (!um) return 'Sin UM4';
  const nombre = um?.data?.name;
  return typeof nombre === 'string' && nombre.trim() ? nombre : 'Sin UM5';
}
function searchProducts(hash, list) {
  debugger;
  if (!hash || !hash.trim()) return list;
  return list.filter(p => p.name.toLowerCase().includes(hash.toLowerCase()));
}
function filterByCategory(categories, products, text) {
  debugger;
  const filteredCategories = categories.filter(cat =>
    (cat?.data?.name_es_CO?.toLowerCase() || '').includes(text.toLowerCase())
  );
  const ids = filteredCategories.map(c => Number(c.id));
  const filteredProductsByCategory = products.filter(prod =>
    ids.includes(Number(prod?.data?.categ?.[0]))
  );
  debugger;
  return { filteredCategories, filteredProductsByCategory };
}
function mergeProducts(remote, category) {
  debugger;
  const combined = [...remote, ...category];
  return combined.filter(
    (item, index, self) => index === self.findIndex(p => p.id === item.id)
  );
}
const state = {
  categories: [],
  ums: [],
  productList: [],
  productListFull: [],
  filteredCategories: [],
  filteredProductsByCategory: []
};
const searchSubject = new Subject();
function configureSearchPipeline() {
  searchSubject.pipe(
    debounceTime(500),
    distinctUntilChanged(),
    tap(text => {
      debugger;
      const query = text.trim().toLowerCase();
      if (!query.length) {
        state.productList = state.productListFull.slice(0, 20);
        return;
      }
      const f = filterByCategory(state.categories, state.productListFull, text);
      state.filteredCategories = f.filteredCategories;
      state.filteredProductsByCategory = f.filteredProductsByCategory;
    }),
    switchMap(text => from(productService.searchProducts(text)))
  ).subscribe({
    next: results => {
      debugger;
      state.productList = mergeProducts(results, state.filteredProductsByCategory);
      console.log('productList:', state.productList.length);
    },
    error: error => {
      debugger;
      console.error('Search error:', error);
    }
  });
}
async function refreshView() {
  debugger;
  state.categories = await categoryService.getAllCategories();
  state.ums = await umService.getAllUms();
  state.productList = await productService.getAllProducts();
  state.productListFull = await productService.getAll();
  configureSearchPipeline();
  return state;
}
function onSearch(text) {
  debugger;
  searchSubject.next(text);
}
async function main() {
  console.log('READPRD NODE DEBUG');
  await refreshView();
  console.log(`categories:${state.categories.length} ums:${state.ums.length} products:${state.productListFull.length}`);
  onSearch(process.argv[2] || 'soldadura');
}
module.exports = {
  getCategoryNameById,
  getUmNameById,
  searchProducts,
  filterByCategory,
  mergeProducts,
  state,
  refreshView,
  onSearch
};
if (require.main === module) {
  main().catch(error => {
    debugger;
    console.error('FATAL:', error);
    process.exit(1);
  });
}
