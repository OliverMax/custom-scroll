import "./style.scss";
import { scrollToTarget } from './utils';

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.querySelector('input')!;
  const ulEl = document.querySelector('ul')!;
  const sectionEl = document.querySelector('section')!;

  const findBlockEl = (id: string) => document.getElementById(id);

  inputEl?.addEventListener('change', () => {
    const blockEl = findBlockEl(inputEl.value);
    
    if (blockEl instanceof HTMLLIElement) {
      scrollToTarget({
        target: blockEl,
        container: sectionEl,
        scroll: ulEl,
        always: true,
      })
        ?.then(() => {
          console.log('+');
        });
    }
  });

  sectionEl?.addEventListener('click', ({ target }) => {
    if (target instanceof HTMLLIElement) {
      scrollToTarget({
        target: target,
        container: sectionEl,
        scroll: ulEl,
        always: true,
      })
        ?.then(() => {
          console.log('+');
        });
    }
  });
});
