const env='dev';

export const environment={
  production:true,
  apiHost:'https://invapi'+env+'.inbemetal.com',
  ocrUrl:'https://ocr.inbemetal.com',
  s3aws:env==='dev'
    ? 'https://s3dev.inbemetal.com/'
    : 'https://s3aws.inbemetal.com/',
//  s3aws: 'https://s3aws.inbemetal.com/',
  db:"na",
  i:38,
  p:"tumae",
};


