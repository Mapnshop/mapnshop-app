export const COUNTRY_CODES = [
    { code: 'US', dial_code: '+1', flag: '🇺🇸', name: 'United States' },
    { code: 'CA', dial_code: '+1', flag: '🇨🇦', name: 'Canada' },
    { code: 'GB', dial_code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: 'FR', dial_code: '+33', flag: '🇫🇷', name: 'France' },
    { code: 'DE', dial_code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: 'IT', dial_code: '+39', flag: '🇮🇹', name: 'Italy' },
    { code: 'ES', dial_code: '+34', flag: '🇪🇸', name: 'Spain' },
    { code: 'AU', dial_code: '+61', flag: '🇦🇺', name: 'Australia' },
    { code: 'IN', dial_code: '+91', flag: '🇮🇳', name: 'India' },
    { code: 'JP', dial_code: '+81', flag: '🇯🇵', name: 'Japan' },
    { code: 'CN', dial_code: '+86', flag: '🇨🇳', name: 'China' },
    { code: 'BR', dial_code: '+55', flag: '🇧🇷', name: 'Brazil' },
    { code: 'MX', dial_code: '+52', flag: '🇲🇽', name: 'Mexico' },
    { code: 'ZA', dial_code: '+27', flag: '🇿🇦', name: 'South Africa' },
    { code: 'NG', dial_code: '+234', flag: '🇳🇬', name: 'Nigeria' },
    { code: 'DZ', dial_code: '+213', flag: '🇩🇿', name: 'Algeria' },
    { code: 'MA', dial_code: '+212', flag: '🇲🇦', name: 'Morocco' },
    { code: 'TN', dial_code: '+216', flag: '🇹🇳', name: 'Tunisia' },
] as const;

export type CountryCodeItem = typeof COUNTRY_CODES[number];
