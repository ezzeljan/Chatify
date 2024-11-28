import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [languages] = useState([
    { label: 'Afrikaans' },
    { label: 'Albanian' },
    { label: 'Amharic' },
    { label: 'Arabic' },
    { label: 'Armenian' },
    { label: 'Azerbaijani' },
    { label: 'Basque' },
    { label: 'Belarusian' },
    { label: 'Bengali' },
    { label: 'Bosnian' },
    { label: 'Bulgarian' },
    { label: 'Catalan' },
    { label: 'Bisaya' },
    { label: 'Chinese (Simplified)' },
    { label: 'Chinese (Traditional)' },
    { label: 'Corsican' },
    { label: 'Croatian' },
    { label: 'Czech' },
    { label: 'Danish' },
    { label: 'Dutch' },
    { label: 'English' },
    { label: 'Esperanto' },
    { label: 'Estonian' },
    { label: 'Finnish' },
    { label: 'French' },
    { label: 'Frisian' },
    { label: 'Galician' },
    { label: 'Georgian' },
    { label: 'German' },
    { label: 'Greek' },
    { label: 'Gujarati' },
    { label: 'Haitian Creole' },
    { label: 'Hausa' },
    { label: 'Hawaiian' },
    { label: 'Hebrew' },
    { label: 'Hindi' },
    { label: 'Hmong' },
    { label: 'Hungarian' },
    { label: 'Icelandic' },
    { label: 'Igbo' },
    { label: 'Indonesian' },
    { label: 'Irish' },
    { label: 'Italian' },
    { label: 'Japanese' },
    { label: 'Javanese' },
    { label: 'Kannada' },
    { label: 'Kazakh' },
    { label: 'Khmer' },
    { label: 'Korean' },
    { label: 'Kurdish' },
    { label: 'Kyrgyz' },
    { label: 'Lao' },
    { label: 'Latin' },
    { label: 'Latvian' },
    { label: 'Lithuanian' },
    { label: 'Luxembourgish' },
    { label: 'Macedonian' },
    { label: 'Malagasy' },
    { label: 'Malay' },
    { label: 'Malayalam' },
    { label: 'Maltese' },
    { label: 'Maori' },
    { label: 'Marathi' },
    { label: 'Mongolian' },
    { label: 'Myanmar (Burmese)' },
    { label: 'Nepali' },
    { label: 'Norwegian' },
    { label: 'Nyanja (Chichewa)' },
    { label: 'Odia (Oriya)' },
    { label: 'Pashto' },
    { label: 'Persian' },
    { label: 'Polish' },
    { label: 'Portuguese' },
    { label: 'Punjabi' },
    { label: 'Romanian' },
    { label: 'Russian' },
    { label: 'Samoan' },
    { label: 'Scots Gaelic' },
    { label: 'Serbian' },
    { label: 'Sesotho' },
    { label: 'Shona' },
    { label: 'Sindhi' },
    { label: 'Sinhala (Sinhalese)' },
    { label: 'Slovak' },
    { label: 'Slovenian' },
    { label: 'Somali' },
    { label: 'Spanish' },
    { label: 'Sundanese' },
    { label: 'Swahili' },
    { label: 'Swedish' },
    { label: 'Tagalog' },
    { label: 'Tajik' },
    { label: 'Tamil' },
    { label: 'Telugu' },
    { label: 'Thai' },
    { label: 'Turkish' },
    { label: 'Ukrainian' },
    { label: 'Urdu' },
    { label: 'Uyghur' },
    { label: 'Uzbek' },
    { label: 'Vietnamese' },
    { label: 'Welsh' },
    { label: 'Xhosa' },
    { label: 'Yiddish' },
    { label: 'Yoruba' },
    { label: 'Zulu' },
  ]);

  const languageToCountryCode = {
    'Afrikaans': 'ZA',
    'Albanian': 'AL',
    'Amharic': 'ET',
    'Arabic': 'SA',
    'Armenian': 'AM',
    'Azerbaijani': 'AZ',
    'Basque': 'ES',
    'Belarusian': 'BY',
    'Bengali': 'BD',
    'Bosnian': 'BA',
    'Bulgarian': 'BG',
    'Catalan': 'ES',
    'Bisaya': 'PH',
    'Chinese (Simplified)': 'CN',
    'Chinese (Traditional)': 'TW',
    'Corsican': 'FR',
    'Croatian': 'HR',
    'Czech': 'CZ',
    'Danish': 'DK',
    'Dutch': 'NL',
    'English': 'GB',
    'Esperanto': 'EO',
    'Estonian': 'EE',
    'Finnish': 'FI',
    'French': 'FR',
    'Frisian': 'NL',
    'Galician': 'ES',
    'Georgian': 'GE',
    'German': 'DE',
    'Greek': 'GR',
    'Gujarati': 'IN',
    'Haitian Creole': 'HT',
    'Hausa': 'NG',
    'Hawaiian': 'US',
    'Hebrew': 'IL',
    'Hindi': 'IN',
    'Hmong': 'CN',
    'Hungarian': 'HU',
    'Icelandic': 'IS',
    'Igbo': 'NG',
    'Indonesian': 'ID',
    'Irish': 'IE',
    'Italian': 'IT',
    'Japanese': 'JP',
    'Javanese': 'ID',
    'Kannada': 'IN',
    'Kazakh': 'KZ',
    'Khmer': 'KH',
    'Korean': 'KR',
    'Kurdish': 'IQ',
    'Kyrgyz': 'KG',
    'Lao': 'LA',
    'Latin': 'VA',
    'Latvian': 'LV',
    'Lithuanian': 'LT',
    'Luxembourgish': 'LU',
    'Macedonian': 'MK',
    'Malagasy': 'MG',
    'Malay': 'MY',
    'Malayalam': 'IN',
    'Maltese': 'MT',
    'Maori': 'NZ',
    'Marathi': 'IN',
    'Mongolian': 'MN',
    'Myanmar (Burmese)': 'MM',
    'Nepali': 'NP',
    'Norwegian': 'NO',
    'Nyanja (Chichewa)': 'MW',
    'Odia (Oriya)': 'IN',
    'Pashto': 'AF',
    'Persian': 'IR',
    'Polish': 'PL',
    'Portuguese': 'PT',
    'Punjabi': 'IN',
    'Romanian': 'RO',
    'Russian': 'RU',
    'Samoan': 'WS',
    'Scots Gaelic': 'GB',
    'Serbian': 'RS',
    'Sesotho': 'LS',
    'Shona': 'ZW',
    'Sindhi': 'PK',
    'Sinhala (Sinhalese)': 'LK',
    'Slovak': 'SK',
    'Slovenian': 'SI',
    'Somali': 'SO',
    'Spanish': 'ES',
    'Sundanese': 'ID',
    'Swahili': 'TZ',
    'Swedish': 'SE',
    'Tagalog': 'PH',
    'Tajik': 'TJ',
    'Tamil': 'IN',
    'Telugu': 'IN',
    'Thai': 'TH',
    'Turkish': 'TR',
    'Ukrainian': 'UA',
    'Urdu': 'PK',
    'Uyghur': 'CN',
    'Uzbek': 'UZ',
    'Vietnamese': 'VN',
    'Welsh': 'GB',
    'Xhosa': 'ZA',
    'Yiddish': 'IL',
    'Yoruba': 'NG',
    'Zulu': 'ZA',
  };

  return (
    <LanguageContext.Provider value={{ languages, languageToCountryCode }}>
      {children}
    </LanguageContext.Provider>
  );
};
