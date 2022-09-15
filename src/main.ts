import "./style.scss";
import { scroll } from './utils/dom';

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
        scroll(blockEl, {
          container: sectionEl,
          ifNeed: false,
          alignX: ALIGN_X,
          alignY: ALIGN_Y,
        });
      }
    }
  });

  sectionEl?.addEventListener('click', ({ target }) => {
    if (target instanceof HTMLLIElement) {
      scroll(target, {
        container: sectionEl,
        ifNeed: false,
        alignX: ALIGN_X,
        alignY: ALIGN_Y,
      });
    }
  });
});

// scrollTo или scrollTop
