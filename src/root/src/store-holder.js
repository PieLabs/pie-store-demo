
const html = `
  <h1>Store Holder</h1>
  <slot></slot>
`;
export default class StoreHolder extends HTMLElement {

  constructor(){
    super();
  }

  connectedCallback(){
    console.log('store holder');
  }
}