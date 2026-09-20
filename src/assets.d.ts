// Bun's bundler turns imported assets into URL strings; tell TypeScript about them.
declare module "*.png" {
  const url: string;
  export default url;
}
declare module "*.jpg" {
  const url: string;
  export default url;
}
declare module "*.webp" {
  const url: string;
  export default url;
}
// Side-effect stylesheet imports (`import "./x.css"`).
declare module "*.css";
