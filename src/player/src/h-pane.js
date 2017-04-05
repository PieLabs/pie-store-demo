import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
  <style>
  :host {
    display: flex;
  } 
  ::slotted(*){
    padding: 10px;
    flex: 1 1 auto;
  }
  </style>
  <slot></slot>
`;

const template = prepareTemplate(html, 'h-pane');

export default class HPane extends HTMLElement {

  constructor() {
    super();
    let sr = applyStyle(this, template);
  }
}