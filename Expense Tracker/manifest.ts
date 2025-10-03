export const manifestForPlugIn = {

  name: "Qwizzy",
  short_name: "Qwizzy",
  description: "this is a community for developer to ask question and get answer",
  icons: [
    {
      src: '/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
      purpose: 'apple-touch-icon',
    },
    {
      src: '/maskable_icon.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
  theme_color: '#171717',
  background_color: '#f0e7db',
  display: "standalone",
  scope: '/',
  start_url: "/",
  orientation: 'portrait-primary',

};