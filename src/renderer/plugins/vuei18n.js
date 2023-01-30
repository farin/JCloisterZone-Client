// http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html
function getPluralCode(locale, n, choicesLength) {
  let plural = 0;
  switch(locale) {
    case 'cs':
      plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2;
      break;
    case 'la':
      plural=(n%10==1 && n%100!=11 ? 0 : n != 0 ? 1 : 2);
      break;
    case 'lt':
      plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2);
      break;
    case 'pl':
      plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);
      break;
    case 'ro':
      plural=(n==1 ? 0 : (n==0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2);
      break;
    case 'ru':
      plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);
      break;
    case 'sk':
      plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2;
      break;
    case 'uk':
      plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);
      break;
    default:
      plural=(n==1) ? 0 : 1;
  }
  plural++;
  return (choicesLength<plural) ? choicesLength : plural;
}
function locale_cs(choice, choicesLength) {
  return getPluralCode('cs', choice, choicesLength);
}
function locale_la(choice, choicesLength) {
  return getPluralCode('la', choice, choicesLength);
}
function locale_lt(choice, choicesLength) {
  return getPluralCode('lv', choice, choicesLength);
}
function locale_pl(choice, choicesLength) {
  return getPluralCode('pl', choice, choicesLength);
}
function locale_ro(choice, choicesLength) {
  return getPluralCode('ro', choice, choicesLength);
}
function locale_ru(choice, choicesLength) {
  return getPluralCode('ru', choice, choicesLength);
}
function locale_sk(choice, choicesLength) {
  return getPluralCode('sk', choice, choicesLength);
}
function locale_uk(choice, choicesLength) {
  return getPluralCode('uk', choice, choicesLength);
}
      
export default (context) => {
  return {
    pluralizationRules: {
      "cs": locale_cs,
      "la": locale_la,
      "lt": locale_lt,
      "pl": locale_pl,
      "ro": locale_ro,
      "ru": locale_ru,
      "sk": locale_sk,
      "uk": locale_uk,
    }
  }
}