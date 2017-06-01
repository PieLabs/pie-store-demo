import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
<style> 
  :host{
    display: block;
    background-color: var(--store-header-bg, rgba(0,0,0,0.2));
    padding: 20px;
  }
  
  centered-content{
    display: flex;
    justify-content: space-between;
  }
  a {
    color: white;
    text-decoration: none;
    transition: color 100ms linear;
  }
  a:hover{
    color: var(--store-link-hover-color, green);
  }
  
</style>
<centered-content>
  <div class="brand"><a href="/">pie-store</a></div>
  <a href="/logout">logout</a>
</centered-content>
`;

const template = prepareTemplate(html, 'store-header');

export default class StoreHeader extends HTMLElement {
  constructor() {
    super();
    let sr = applyStyle(this, template);
  }

}