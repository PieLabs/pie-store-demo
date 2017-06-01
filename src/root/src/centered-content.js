import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
<style> 
  :host{
    display: block;
    margin: 0 auto;
    max-width: var(--centered-content-width, 500px);
  }
</style>
<slot></slot>
`;

const template = prepareTemplate(html, 'centered-content');

export default class CenteredContent extends HTMLElement {
  constructor() {
    super();
    let sr = applyStyle(this, template);
  }

}