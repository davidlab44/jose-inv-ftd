let env='prod';

export const environment={
  production:true,
  apiHost:'https://invapi'+env+'.inbemetal.com',
  pimApiHost:'https://pimapi'+env+'.inbemetal.com',
  ocrUrl:'https://ocr.inbemetal.com',
  s3aws:env==='dev'
    ? 'https://s3dev.inbemetal.com/'
    : 'https://s3aws.inbemetal.com/',
  s3mnt:env==='dev'
    ? 'https://s3mntdev.inbemetal.com/'
    : 'https://s3mntprod.inbemetal.com/',
  db:"na",
  i:38,
  p:"tumae",
};


