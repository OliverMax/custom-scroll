import "./style.scss";
import { customScroll } from './utils/dom';

const TYPE: 'none' | 'linear' | 'ease' = 'ease';
const IF_NEED = false;
const ALIGN_X: 'left' | 'center' | 'right' = 'center';
const ALIGN_Y: 'top' | 'center' | 'bottom' = 'center';

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.querySelector('input')!;
  const sectionEl = document.querySelector('section')!;

  const findBlockEl = (id: string) => document.getElementById(id);

  inputEl?.addEventListener('keydown', ({ key }) => {
    if (key === 'Enter') {
      const blockEl = findBlockEl(inputEl.value);
      
      if (blockEl instanceof HTMLLIElement) {
        customScroll(blockEl, {
          type: TYPE,
          container: sectionEl,
          ifNeed: IF_NEED,
          alignX: ALIGN_X,
          alignY: ALIGN_Y,
        });
      }
    }
  });

  sectionEl?.addEventListener('click', ({ target }) => {
    if (target instanceof HTMLLIElement) {
      customScroll(target, {
        type: TYPE,
        container: sectionEl,
        ifNeed: IF_NEED,
        alignX: ALIGN_X,
        alignY: ALIGN_Y,
      });
    }
  });
});
