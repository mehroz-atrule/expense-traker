import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { manifestForPlugIn } from "./manifest";
// https://vite.dev/config/
export default defineConfig({
  server: {
        host: true, // This will expose the server to the network
        
      },
  plugins: [react(), VitePWA(manifestForPlugIn)],
})
