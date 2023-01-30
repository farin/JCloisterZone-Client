// http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html
function locale_cs_sk(n, choicesLength) {
  const plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2;
  return (plural+1)
}
function locale_la(n, choicesLength) {
  const plural=(n%10==1 && n%100!=11 ? 0 : n != 0 ? 1 : 2);
  return (plural+1)
}
function locale_lt(n, choicesLength) {
  const plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2);
  return (plural+1)
}
function locale_pl(n, choicesLength) {
  const plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);
  return (plural+1)
}
function locale_ro(choice, choicesLength) {
  const plural=(n==1 ? 0 : (n==0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2);
  return (plural+1);
}
function locale_ru(choice, choicesLength) {
  const plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);
  return (plural+1);
}
function locale_uk(choice, choicesLength) {
  const plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);
  return (plural+1);
}
      
export default (context) => {
  return {
    pluralizationRules: {
      "cs": locale_cs_sk,
      "la": locale_la,
      "lt": locale_lt,
      "pl": locale_pl,
      "ro": locale_ro,
      "ru": locale_ru,
      "sk": locale_cs_sk,
      "uk": locale_uk,
    }
  }
}