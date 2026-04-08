import { useEffect } from 'react';

const injected = { current: false };

export default function GoogleTranslate() {
  useEffect(() => {
    if (injected.current) return;
    injected.current = true;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'zh-CN,es,hi,ar,bn,fr,ru,pt,ur,id,de,ja,sw,mr,te,tr,ko,vi,it,pl',
          layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        zIndex: 9999,
      }}
    />
  );
}