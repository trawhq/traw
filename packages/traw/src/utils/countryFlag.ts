export function getCountryFlagByLocale(locale: string): string {
  switch (locale) {
    case 'en-US':
      return '🇺🇸';
    case 'en-GB':
      return '🇬🇧';
    case 'en-AU':
      return '🇦🇺';
    case 'en-CA':
      return '🇨🇦';
    case 'en-IN':
      return '🇮🇳';
    case 'en-NZ':
      return '🇳🇿';
    case 'en-ZA':
      return '🇿🇦';
    case 'en-PH':
      return '🇵🇭';
    case 'en-IE':
      return '🇮🇪';
    case 'en-SG':
      return '🇸🇬';
    case 'en-ZW':
      return '🇿🇼';
    case 'en-JM':
      return '🇯🇲';
    case 'en-BZ':
      return '🇧🇿';
    case 'en-TT':
      return '🇹🇹';
    case 'ko-KR':
      return '🇰🇷';
    case 'ja-JP':
      return '🇯🇵';
    case 'zh-CN':
      return '🇨🇳';
    case 'zh-HK':
      return '🇭🇰';
    case 'zh-TW':
      return '🇹🇼';
    case 'zh-SG':
      return '🇸🇬';
    default:
      return '';
  }
}
