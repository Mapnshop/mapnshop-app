import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every
 * web page during static rendering.
 * The contents of this function only run in Node.js environments and
 * do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
    const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, shrink-to-fit=no"
                />

                {/* 
          This disables the extra scrollbar that usually appears on the body 
          element and ensures the root element fills the full viewport.
        */}
                <ScrollViewStyleReset />

                <style dangerouslySetInnerHTML={{
                    __html: `
                    /* Clean Scrollbars for Web */
                    ::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }
                    ::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    ::-webkit-scrollbar-thumb {
                        background-color: #CBD5E1;
                        border-radius: 4px;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background-color: #94A3B8;
                    }
                    /* Firefox */
                    * {
                        scrollbar-width: thin;
                        scrollbar-color: #CBD5E1 transparent;
                    }
                `}} />

                {/* Add any global CSS or meta tags here */}
                <script
                    src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`}
                    async
                    defer
                />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
