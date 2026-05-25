// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
const env='prod'; // 'dev' | 'prod' 

export const environment = {
  production: false,
  apiHost: 'https://invapi'+env+'.inbemetal.com',
  bkt: "ist"+env,  
  ocrUrl: 'https://ocr.inbemetal.com',
  s3aws: 'https://s3aws.inbemetal.com/',
  //apiHost: '/jsonrpc',
  db:"na",
  i:38,
  p:"tumae"
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
