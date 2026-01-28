import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
    window: {
        width,
        height,
    },
    isSmallDevice: width < 375,
    isDesktop: width >= 768,

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },

    borderRadius: {
        sm: 6,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },

    maxWidth: 600, // For centering content on desktop
};
