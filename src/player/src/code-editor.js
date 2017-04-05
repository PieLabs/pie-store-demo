import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
  <style>
  :host {
    display: flex;
  } 

  </style>
  <textarea
     rows="10" 
     cols="50"></textarea>
`;
const template = prepareTemplate(html, 'h-pane');
export default class CodeEditor extends HTMLElement {

  constructor() {
    super();
    let sr = applyStyle(this, template);
    this._$textArea = sr.querySelector('textarea');
  }

  connectedCallback() {
    this._$textArea.addEventListener('input', e => {
      console.log('input: ', e);
      try {
        let content = JSON.parse(e.target.value);
        this.dispatchEvent(new CustomEvent('code-editor.change', {
          bubbles: true,
          composed: true,
          detail: { content }
        }));
      } catch (e) {
        console.error(`can't parse the content as json`);
      }
    });
  }

  set content(c) {
    this._content = c;

    try {
      this._$textArea.textContent = JSON.stringify(this._content, null, '  ');
    } catch (e) {
      console.error(`can't set the content`);
    }
  }



}