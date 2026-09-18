export function urlAllProducts(host, limit = 20) {
  return `${host}/prdt?limit=${limit}`;
}
export function urlLastProducts(host, limit = 20) {
  return `${host}/prdt?order=id.desc&limit=${limit}`;
}
export function urlNext20Desc(host, since_id, limit = 20) {
  return `${host}/prdt?id=lt.${since_id}&order=id.desc&limit=${limit}`;
}
