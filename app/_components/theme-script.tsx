import { DARK_CLASS, THEME_STORAGE_KEY } from '@/app/_components/theme-storage'

// Runs synchronously while the HTML parses, so the dark class is in place before first paint.
// A stored choice wins; otherwise the OS preference applies. Storage access can throw in
// locked-down browsers, in which case the page simply renders light.
const script = `(function(){try{var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add(${JSON.stringify(DARK_CLASS)})}catch(e){}})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
