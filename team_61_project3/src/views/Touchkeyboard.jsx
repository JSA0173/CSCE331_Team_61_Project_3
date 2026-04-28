import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

/**
 * TouchKeyboard — slide-up on-screen keyboard for touchscreen kiosk views.
 *
 * SETUP:
 *   1. Wrap your kiosk root with <KeyboardProvider>
 *   2. Replace every <input> with <TouchInput>
 *
 * TouchInput props:
 *   value        {string}    controlled value
 *   onChange     {fn}        called with new string (not an event)
 *   placeholder  {string}
 *   label        {string}    shown as title in the keyboard header
 *   numeric      {boolean}   opens in number/symbol mode by default
 *   onEnter      {fn}        called when user taps Enter
 *   style/className          passed through to the input element
 */

// ─── Context ─────────────────────────────────────────────────────────────────
const KeyboardContext = createContext(null);
export const useKeyboard = () => useContext(KeyboardContext);

// ─── Key layout ──────────────────────────────────────────────────────────────
const ROWS_ALPHA = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
];
const ROWS_NUM = [
  ['1','2','3','4','5','6','7','8','9','0'],
  ['-','/',':',';','(',')','$','&','@','"'],
  ['.',',','?','!','\'','#','%','+','='],
];

// ─── KeyboardProvider ─────────────────────────────────────────────────────────
export function KeyboardProvider({ children }) {
  const [visible,  setVisible]  = useState(false);
  const [closing,  setClosing]  = useState(false);
  const [value,    setValue]    = useState('');
  const [label,    setLabel]    = useState('');
  const [shifted,  setShifted]  = useState(false);
  const [numMode,  setNumMode]  = useState(false);
  const cbRef    = useRef(null);
  const enterRef = useRef(null);
  const timerRef = useRef(null);

  const open = useCallback((currentValue, onChange, opts = {}) => {
    clearTimeout(timerRef.current);
    cbRef.current    = onChange;
    enterRef.current = opts.onEnter ?? null;
    setValue(currentValue ?? '');
    setLabel(opts.label ?? '');
    setNumMode(opts.numeric ?? false);
    setShifted(false);
    setClosing(false);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 300);
  }, []);

  const press = useCallback((char) => {
    setValue(prev => {
      const next = prev + (shifted ? char.toUpperCase() : char);
      cbRef.current?.(next);
      return shifted ? prev + char.toUpperCase() : prev + char;
    });
    setShifted(false);
  }, [shifted]);

  const backspace = useCallback(() => {
    setValue(prev => {
      const next = prev.slice(0, -1);
      cbRef.current?.(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setValue('');
    cbRef.current?.('');
  }, []);

  const space = useCallback(() => {
    setValue(prev => {
      const next = prev + ' ';
      cbRef.current?.(next);
      return next;
    });
  }, []);

  const enter = useCallback(() => {
    enterRef.current?.();
    close();
  }, [close]);

  return (
    <KeyboardContext.Provider value={{ open, close }}>
      {children}
      {createPortal(
        <Keyboard
          visible={visible}
          closing={closing}
          value={value}
          label={label}
          shifted={shifted}
          numMode={numMode}
          onShift={() => setShifted(s => !s)}
          onNumMode={() => setNumMode(s => !s)}
          onPress={press}
          onBackspace={backspace}
          onClear={clear}
          onSpace={space}
          onEnter={enter}
          onClose={close}
        />,
        document.body
      )}
    </KeyboardContext.Provider>
  );
}

// ─── Keyboard UI ─────────────────────────────────────────────────────────────
function Keyboard({
  visible, closing, value, label,
  shifted, numMode,
  onShift, onNumMode, onPress, onBackspace, onClear, onSpace, onEnter, onClose,
}) {
  if (!visible) return null;

  const rows = numMode ? ROWS_NUM : ROWS_ALPHA;

  const keyStyle = (extra = {}) => ({
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    height:          52,
    minWidth:        36,
    flex:            1,
    borderRadius:    10,
    border:          'none',
    fontSize:        18,
    fontWeight:      500,
    cursor:          'pointer',
    userSelect:      'none',
    WebkitUserSelect:'none',
    touchAction:     'manipulation',
    transition:      'background 0.08s, transform 0.08s',
    background:      '#ffffff',
    color:           '#1a1a2e',
    boxShadow:       '0 2px 0 #b0b8cc',
    ...extra,
  });

  const wrapStyle = {
    position:        'fixed',
    bottom:          0,
    left:            0,
    right:           0,
    zIndex:          999999,
    background:      'linear-gradient(180deg, #dde3ef 0%, #c8d0e0 100%)',
    borderTop:       '1px solid #b0b8cc',
    borderRadius:    '20px 20px 0 0',
    padding:         '12px 8px 24px',
    boxShadow:       '0 -4px 24px rgba(0,0,0,0.18)',
    animation:       closing
      ? 'kb-slide-down 0.3s cubic-bezier(0.4,0,1,1) forwards'
      : 'kb-slide-up 0.3s cubic-bezier(0,0,0.2,1) forwards',
  };

  return (
    <>
      <style>{`
        @keyframes kb-slide-up   { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes kb-slide-down { from { transform: translateY(0); }    to { transform: translateY(100%); } }
        .kb-key:active { transform: scale(0.92); background: #e2e8f4 !important; }
        .kb-key-dark:active { transform: scale(0.92); filter: brightness(0.88); }
      `}</style>

      {/* Backdrop — tap outside to close */}
      <div
        onClick={onClose}
        style={{ position:'fixed', inset:0, zIndex:999998, background:'transparent' }}
      />

      <div style={wrapStyle}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, padding:'0 4px' }}>
          <div style={{
            flex: 1,
            background: '#fff',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 15,
            color: value ? '#1a1a2e' : '#9aa3b5',
            minHeight: 32,
            border: '1.5px solid #a0aabd',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {label && <span style={{ color:'#6b7a99', fontSize:12, marginRight:6 }}>{label}:</span>}
            {value || <span style={{ color:'#9aa3b5' }}>…</span>}
          </div>
          <button
            className="kb-key-dark"
            onClick={onClose}
            style={{
              ...keyStyle({ background:'#4a5568', color:'#fff', minWidth:44, flex:'none', boxShadow:'0 2px 0 #2d3748', fontSize:14 }),
            }}
          >✕</button>
        </div>

        {/* Rows */}
        {rows.map((row, ri) => (
          <div key={ri} style={{ display:'flex', justifyContent:'center', gap:5, marginBottom:5 }}>
            {ri === 2 && !numMode && (
              <button
                className="kb-key-dark"
                onClick={onShift}
                style={keyStyle({ background: shifted ? '#4a90d9' : '#8896aa', color:'#fff', minWidth:48, flex:'none', fontSize:16, boxShadow: shifted ? '0 2px 0 #2e6db5' : '0 2px 0 #5a6a80' })}
              >⇧</button>
            )}
            {row.map(k => (
              <button
                key={k}
                className="kb-key"
                onPointerDown={e => { e.preventDefault(); onPress(k); }}
                style={keyStyle()}
              >
                {shifted && !numMode ? k.toUpperCase() : k}
              </button>
            ))}
            {ri === 2 && !numMode && (
              <button
                className="kb-key-dark"
                onPointerDown={e => { e.preventDefault(); onBackspace(); }}
                style={keyStyle({ background:'#8896aa', color:'#fff', minWidth:48, flex:'none', fontSize:16, boxShadow:'0 2px 0 #5a6a80' })}
              >⌫</button>
            )}
            {ri === 2 && numMode && (
              <button
                className="kb-key-dark"
                onPointerDown={e => { e.preventDefault(); onBackspace(); }}
                style={keyStyle({ background:'#8896aa', color:'#fff', minWidth:48, flex:'none', fontSize:16, boxShadow:'0 2px 0 #5a6a80' })}
              >⌫</button>
            )}
          </div>
        ))}

        {/* Bottom row */}
        <div style={{ display:'flex', gap:5, marginTop:5 }}>
          <button
            className="kb-key-dark"
            onClick={onNumMode}
            style={keyStyle({ background: numMode ? '#4a90d9' : '#8896aa', color:'#fff', minWidth:72, flex:'none', fontSize:13, boxShadow: numMode ? '0 2px 0 #2e6db5' : '0 2px 0 #5a6a80' })}
          >{numMode ? 'ABC' : '123'}</button>

          <button
            className="kb-key"
            onPointerDown={e => { e.preventDefault(); onSpace(); }}
            style={keyStyle({ flex:1, fontSize:14, color:'#6b7a99' })}
          >space</button>

          <button
            className="kb-key-dark"
            onClick={onClear}
            style={keyStyle({ background:'#e07b7b', color:'#fff', minWidth:60, flex:'none', fontSize:13, boxShadow:'0 2px 0 #b85555' })}
          >Clear</button>

          <button
            className="kb-key-dark"
            onClick={onEnter}
            style={keyStyle({ background:'#4CAF50', color:'#fff', minWidth:80, flex:'none', fontSize:14, boxShadow:'0 2px 0 #357a38' })}
          >Enter ↵</button>
        </div>
      </div>
    </>
  );
}

// ─── TouchInput ───────────────────────────────────────────────────────────────
/**
 * Drop-in replacement for <input> in touchscreen views.
 *
 * Props:
 *   value      {string}   controlled value
 *   onChange   {fn}       called with new string value (not an event object)
 *   label      {string}   shown in the keyboard header
 *   numeric    {boolean}  start in number/symbol mode
 *   onEnter    {fn}       called when Enter is tapped
 *   placeholder, style, className — passed through
 */
export function TouchInput({ value, onChange, label, numeric, onEnter, placeholder, style, className, ...rest }) {
  const { open } = useKeyboard();

  const handleFocus = useCallback((e) => {
    e.target.blur(); // prevent native keyboard on mobile
    open(value, onChange, { label, numeric, onEnter });
  }, [open, value, onChange, label, numeric, onEnter]);

  return (
    <input
      {...rest}
      readOnly
      value={value}
      placeholder={placeholder}
      className={className}
      style={{ cursor: 'pointer', ...style }}
      onFocus={handleFocus}
      onClick={handleFocus}
    />
  );
}