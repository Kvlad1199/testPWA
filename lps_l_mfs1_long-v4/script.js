function showNextBlock(nextBlockNumber) {
  let blocks = document.querySelectorAll('.chat-box');
  blocks.forEach((block) => {
    block.classList.remove('active');
  });

  let nextBlock = document.querySelector('.chat-box' + nextBlockNumber);
  if (nextBlock) {
    nextBlock.classList.add('active');

    if (nextBlockNumber === 4) {
      setTimeout(() => {
        showPopup1();
      }, 300);
    }
  }
}

function showPopup1() {
  const overlay = document.getElementById('popup1-overlay');
  overlay.classList.remove('hidden');

  setTimeout(() => {
    overlay.classList.add('show');
    document.body.classList.add('popup1-was-opened');
  }, 10);
}
