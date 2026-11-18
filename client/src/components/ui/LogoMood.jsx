/**
 * LogoMood — the UniFyle folder mark with a changeable face.
 *   sad : frown, worried brows and a tear (destructive questions)
 *   ask : one raised brow and an unsure mouth (everything else)
 * Same paths and gradients as unifyle-mark.svg, so it matches the brand logo.
 */
export function LogoMood({ mood = 'ask', size = 88, className = '' }) {
  const stroke = { stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  return (
    <svg width={size} height={size * 0.797} viewBox="195 220 640 510" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={mood === 'sad' ? 'UniFyle logo looking sad' : 'UniFyle logo looking unsure'}>
      <defs>
        <linearGradient id="lm-back" x1="215" y1="240" x2="740" y2="600" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4aa6fb" /><stop offset="0.55" stopColor="#2a6ff0" /><stop offset="1" stopColor="#1550d0" />
        </linearGradient>
        <linearGradient id="lm-front" x1="240" y1="360" x2="800" y2="712" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3f8ef7" /><stop offset="0.6" stopColor="#3a7cf4" /><stop offset="1" stopColor="#8ccbff" />
        </linearGradient>
        <linearGradient id="lm-tab" x1="279" y1="288" x2="404" y2="330" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d6ecff" /><stop offset="1" stopColor="#8fc8ff" />
        </linearGradient>
        <linearGradient id="lm-shine" x1="280" y1="351" x2="640" y2="520" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" /><stop offset="1" stopColor="#fff" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <path d="M207 593V365C207 290 262 230 334 230H413C440 230 459 239 477 258C493 274 512 278 534 278H645C693 278 728 308 734 353L750 586C755 644 711 688 651 688H302C243 688 207 654 207 593Z" fill="#dff0ff" fillOpacity="0.9" />
      <path d="M212 592V366C212 293 266 237 335 237H413C439 237 457 245 474 263C491 279 511 282 535 282H644C691 282 723 311 729 355L744 587C749 642 709 682 650 682H303C246 682 212 651 212 592Z" fill="url(#lm-back)" />
      <path d="M300 288H384C396 288 404 297 404 309C404 321 396 330 384 330H300C288 330 279 321 279 309C279 297 288 288 300 288Z" fill="url(#lm-tab)" />
      <path d="M390 349H727C788 349 829 395 814 457L768 629C754 684 720 716 666 716H307C244 716 208 675 222 612L273 434C289 381 329 349 390 349Z" fill="#e8f4ff" fillOpacity="0.95" />
      <path d="M391 354H726C784 354 824 397 809 456L763 628C749 681 718 711 665 711H308C248 711 213 673 227 613L278 436C293 385 332 354 391 354Z" fill="url(#lm-front)" />
      <path d="M391 351H727C775 351 810 380 814 420C800 380 770 357 725 357H391C335 357 296 386 277 434C291 381 333 351 391 351Z" fill="url(#lm-shine)" />

      {/* eyes */}
      <path d="M431 500C431 492 438 485 446 485C454 485 461 492 461 500V514C461 522 455 529 446 529C437 529 431 522 431 514V500Z" fill="#fff" />
      <path d="M599 500C599 492 606 485 614 485C622 485 629 492 629 500V514C629 522 623 529 614 529C605 529 599 522 599 514V500Z" fill="#fff" />

      {mood === 'sad' ? (
        <>
          {/* worried brows, higher at the centre */}
          <path d="M424 470 L468 450" strokeWidth="11" {...stroke} />
          <path d="M636 470 L592 450" strokeWidth="11" {...stroke} />
          {/* frown */}
          <path d="M488 574C506 548 556 548 574 574" strokeWidth="15" {...stroke} />
          {/* tear */}
          <path d="M631 540C631 540 646 556 646 566C646 574 640 580 632 580C624 580 618 574 618 566C618 556 631 540 631 540Z" fill="#d7ecff" />
        </>
      ) : (
        <>
          {/* one flat brow, one raised */}
          <path d="M424 466 L466 466" strokeWidth="11" {...stroke} />
          <path d="M592 458 L636 440" strokeWidth="11" {...stroke} />
          {/* unsure mouth */}
          <path d="M492 566C512 554 530 574 552 562C560 558 566 556 572 560" strokeWidth="15" {...stroke} />
        </>
      )}
    </svg>
  );
}
