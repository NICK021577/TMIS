import { useConfirm } from '../modals/confirmContext';
import { useEffect, useRef, useState } from 'react';
import { Button, Callout, Field, Icon, Panel, PanelTitle, Switch, inputCls, textareaCls } from '../ui';
import { AgencyMark } from '../ui/AgencyMark';
import { useStore } from '../../hooks/useStore';
import { SaveBar, same } from './SettingsKit';
import {
  BRAND_PRESETS, SHADE_MIN, SHADE_MAX, SWATCHES, clampShade, hexToHsl, hslToHex, scale,
} from '../../lib/brand';

function ParticipantPreview() {
  const { profile, cover } = useStore();
  const [subscribed, setSubscribed] = useState(false);
  return (
    <div>
      <p className="mb-2 text-[11px] text-ink-400">LIVE PARTICIPANT PREVIEW</p>
      <div className="mx-auto max-w-[260px] overflow-hidden rounded-[26px] bg-white shadow-[0_14px_34px_rgba(70,100,200,0.18)] ring-1 ring-black/5">
        {cover
          ? <img src={cover} alt="" className="h-20 w-full object-cover" />
          : <div className="h-20 bg-gradient-to-br from-brand-900 to-brand-500" />}
        <div className="px-4 pb-4">
          <AgencyMark size={48} className="-mt-6 ring-4 ring-white" />
          <h3 className="mt-2 text-[13px] font-medium leading-snug text-ink-950">{profile.name}</h3>
          <p className="text-[11px] text-ink-500">@{profile.shortName.toLowerCase()} · Government agency</p>
          <p className="text-[11px] text-ink-500">12.4K subscribers</p>
          <button onClick={() => setSubscribed((v) => !v)}
            className={`mt-3 w-full rounded-full py-1.5 text-xs font-medium ${subscribed ? 'bg-brand-100 text-brand-700' : 'bg-brand-600 text-white'}`}>
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
          <div className="mt-3 flex gap-4 border-b border-black/5 text-xs"><span className="border-b-2 border-brand-600 pb-1.5 font-medium text-brand-700">Activities</span><span className="pb-1.5 text-ink-500">About</span></div>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-brand-50 p-2.5">
            <span className="grid h-9 w-9 flex-shrink-0 place-content-center rounded-lg bg-white text-center text-brand-700"><strong className="block text-xs font-medium leading-none">17</strong><small className="text-[8px]">JUN</small></span>
            <span className="min-w-0"><strong className="block truncate text-[11px] font-medium text-ink-950">Rubber Production and Tapping Technology</strong><small className="text-[10px] text-ink-500">Registration open · 8 slots left</small></span>
          </div>
          <p className="mt-3 text-[10px] leading-snug text-ink-400">Participants subscribe to an agency for updates, then register separately for each activity they want to attend.</p>
        </div>
      </div>
    </div>
  );
}

export default function BrandingTab({ readOnly, notify }) {
  const { profile, setProfile, brand, setBrand, logo, setLogo, cover, setCover } = useStore();
  const confirm = useConfirm();
  const fileRef = useRef(null);
  const coverRef = useRef(null);
  const [coverError, setCoverError] = useState('');
  const [hex, setHex] = useState(() => hslToHex(brand.h, brand.s, clampShade(brand.l)));
  const [name, setName] = useState(profile.name);
  const [desc, setDesc] = useState(profile.description);

  // Colors and the logo preview live, so the last saved state is kept to discard back to.
  const [saved, setSaved] = useState({ brand, logo, cover, name: profile.name, desc: profile.description });
  const dirty = !same(brand, saved.brand) || logo !== saved.logo || cover !== saved.cover || name !== saved.name || desc !== saved.desc;
  const latest = useRef({ dirty, saved, setBrand, setLogo, setCover });
  latest.current = { dirty, saved, setBrand, setLogo, setCover };
  const revert = () => { setBrand(saved.brand); setLogo(saved.logo); setCover(saved.cover); setCoverError(''); setName(saved.name); setDesc(saved.desc); setHex(hslToHex(saved.brand.h, saved.brand.s, clampShade(saved.brand.l))); };
  const save = () => {
    setProfile({ ...profile, name, description: desc });
    setSaved({ brand, logo, cover, name, desc });
    notify?.('Branding saved. Your sidebar and participant pages are updated');
  };
  // Leaving the tab without saving drops the unsaved preview.
  useEffect(() => () => { const l = latest.current; if (l.dirty) { l.setBrand(l.saved.brand); l.setLogo(l.saved.logo); l.setCover(l.saved.cover); } }, []);

  const applyBrand = (next) => {
    const merged = { ...brand, ...next };
    setBrand(merged);
    setHex(hslToHex(merged.h, merged.s, clampShade(merged.l)));
  };
  const pickPreset = (p) => applyBrand({ preset: p.id, h: p.h, s: p.s, l: p.l });
  const custom = brand.preset === 'custom';
  const onHex = (v) => {
    setHex(v);
    const hsl = hexToHsl(v);
    if (hsl) setBrand({ ...brand, preset: 'custom', h: hsl.h, s: hsl.s, l: clampShade(hsl.l) });
  };
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogo(URL.createObjectURL(file));
    notify?.('Logo previewed. Save to keep it');
    e.target.value = '';
  };

  const onCover = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setCoverError('Use a PNG, JPG or WebP image.'); return; }
    if (file.size > 5 * 1048576) { setCoverError('The image is larger than 5 MB.'); return; }
    setCoverError('');
    setCover(URL.createObjectURL(file));
    notify?.('Cover photo previewed. Save to keep it');
  };

  const swatches = scale(brand);

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_300px]">
      <Panel>
        <PanelTitle title="Participant-facing brand" subtitle="Used on your agency page, published activities, and participant notifications." />
        {readOnly && <div className="mb-4"><Callout tone="info" icon="lock">Only Agency Administrators can change branding.</Callout></div>}

        <fieldset disabled={readOnly} className="space-y-5 disabled:opacity-70">
          {/* Logo */}
          <div className="glass-inset flex flex-wrap items-center gap-4 rounded-2xl p-4">
            <AgencyMark size={56} />
            <div className="min-w-0 flex-1">
              <strong className="block text-[13px] font-medium text-ink-950">Agency logo</strong>
              <p className="text-xs text-ink-500">Square PNG or SVG, at least 512 × 512. Branded into the sidebar.</p>
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/svg+xml" hidden onChange={onFile} />
            <Button variant="secondary" size="sm" icon="upload" onClick={() => fileRef.current?.click()}>{logo ? 'Replace logo' : 'Upload logo'}</Button>
            {logo && <Button variant="ghost" size="sm" onClick={async () => { if (await confirm({ tone: 'danger', title: 'Remove the agency logo?', message: 'The sidebar will show your agency’s initials instead.', detail: 'Save to apply the change.', confirmLabel: 'Remove logo' })) { setLogo(null); } }}>Remove</Button>}
          </div>

          {/* Cover photo */}
          <div className="glass-inset space-y-3 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <strong className="block text-[13px] font-medium text-ink-950">Cover photo</strong>
                <p className="text-xs text-ink-500">Wide image shown at the top of your public agency page. PNG, JPG or WebP, up to 5 MB. About 1600 × 500 works best.</p>
              </div>
              <input ref={coverRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onCover} />
              <Button variant="secondary" size="sm" icon="upload" onClick={() => coverRef.current?.click()}>{cover ? 'Replace cover' : 'Upload cover'}</Button>
              {cover && <Button variant="ghost" size="sm" onClick={async () => { if (await confirm({ tone: 'danger', title: 'Remove the cover photo?', message: 'Your public page will go back to the default brand-color banner.', detail: 'Save to apply the change.', confirmLabel: 'Remove cover' })) { setCover(null); setCoverError(''); } }}>Remove</Button>}
            </div>
            <div className="relative h-28 overflow-hidden rounded-xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-400 sm:h-32">
              {cover ? <img src={cover} alt="Cover photo preview" className="h-full w-full object-cover" /> : <span className="absolute inset-0 grid place-items-center text-xs text-white/80">Default banner. Upload a cover to replace it.</span>}
            </div>
            {coverError && <p className="flex items-center gap-1.5 text-xs text-danger"><Icon name="alert" size={13} />{coverError}</p>}
          </div>

          <Field label="Display name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Agency description"><textarea rows={2} className={textareaCls} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>

          {/* Presets */}
          <div>
            <span className="mb-2 block text-xs text-ink-600">Brand color preset</span>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[...BRAND_PRESETS, { id: 'custom', label: 'Custom brand color', note: 'Pick your own hue', h: brand.h, s: brand.s, l: brand.l }].map((p) => {
                const on = brand.preset === p.id;
                return (
                  <button key={p.id} type="button" aria-pressed={on} onClick={() => (p.id === 'custom' ? applyBrand({ preset: 'custom' }) : pickPreset(p))}
                    className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all ${on ? 'bg-white ring-2 ring-brand-500/60' : 'glass-inset hover:bg-white/70'}`}>
                    <i className="h-9 w-9 flex-shrink-0 rounded-xl shadow-inner" style={{ background: hslToHex(p.h, p.s, clampShade(p.l)) }} />
                    <span className="min-w-0 flex-1"><strong className="block text-[13px] font-medium text-ink-950">{p.label}</strong><small className="text-xs text-ink-500">{p.note}</small></span>
                    {on && <Icon name="check" size={15} className="text-brand-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tint */}
          <div className="glass-inset flex items-center justify-between gap-4 rounded-2xl p-4">
            <div>
              <strong className="block text-[13px] font-medium text-ink-950">Tint the console glass with the brand color</strong>
              <small className="text-xs text-ink-500">Off keeps the default blue glass. On, the frosted background follows the hue of your brand color.</small>
            </div>
            <Switch checked={brand.tint} onChange={(v) => setBrand({ ...brand, tint: v })} label="Tint the console glass" />
          </div>

          {/* Custom colour */}
          {custom && (
            <div className="glass-inset space-y-4 rounded-2xl p-4">
              <strong className="block text-[13px] font-medium text-ink-950">Custom brand color</strong>
              {[
                ['Hue', 'h', 0, 360, `linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)`],
                ['Saturation', 's', 20, 100, null],
                ['Shade', 'l', SHADE_MIN, SHADE_MAX, null],
              ].map(([label, key, min, max, bg]) => (
                <label key={key} className="grid grid-cols-[84px_1fr] items-center gap-3 text-xs text-ink-600">
                  {label}
                  <input type="range" min={min} max={max} value={key === 'l' ? clampShade(brand.l) : brand[key]} style={bg ? { background: bg } : undefined}
                    onChange={(e) => applyBrand({ preset: 'custom', [key]: Number(e.target.value) })} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-brand-200 accent-brand-600" />
                </label>
              ))}
              <div className="flex flex-wrap gap-2">
                {SWATCHES.map((c) => (
                  <button key={c} type="button" aria-label={`Use ${c}`} onClick={() => onHex(c)} className="h-7 w-7 rounded-lg ring-2 ring-white" style={{ background: c }} />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input type="color" value={hex.length === 7 ? hex : '#3b72e6'} onChange={(e) => onHex(e.target.value)} aria-label="Pick colour" className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
                <input className={`${inputCls} !w-32 uppercase`} value={hex} onChange={(e) => onHex(e.target.value)} aria-label="Hex colour" />
                <small className="min-w-[160px] flex-1 text-xs text-ink-500">Shade is limited so white text stays readable.</small>
              </div>
              <div className="flex h-9 overflow-hidden rounded-xl" aria-label="Palette preview">
                {swatches.map((c, i) => <span key={i} className="flex-1" style={{ background: c }} />)}
              </div>
            </div>
          )}

          <Callout tone="info" icon="sparkle">
            <strong className="block font-medium">Recommended theming model</strong>
            Keep the management console structurally consistent for all agencies. Apply each agency’s logo, primary color, and cover identity most strongly on participant-facing discovery pages.
          </Callout>
        </fieldset>
        {!readOnly && <SaveBar dirty={dirty} canSave={!!name.trim()} onDiscard={revert} onSave={save} />}
      </Panel>

      <ParticipantPreview />
    </div>
  );
}
