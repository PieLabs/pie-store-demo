import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
  <style>
  :host {
    display: flex;
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