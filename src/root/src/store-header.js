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
  
</style>
<centered-content>
  <div class="brand">pie-store</div>
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