import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Save, Camera, User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LIFESTYLE_TAGS = [
  'Night Owl', 'Early Bird', 'Studious', 'Fitness Freak', 'Sporty',
  'Party Lover', 'Pet Lover', 'Vegan', 'Non Alcoholic', 'Music Lover', 'Non Smoker',
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [gender, setGender] = useState(user.gender || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [prefs, setPrefs] = useState({
    preferredLocation: user.preferences?.preferredLocation || '',
    budgetMin: user.preferences?.budgetMin || '',
    budgetMax: user.preferences?.budgetMax || '',
    moveInDate: user.preferences?.moveInDate ? user.preferences.moveInDate.slice(0, 10) : '',
    lifestyleTags: user.preferences?.lifestyleTags || [],
    about: user.preferences?.about || '',
  });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const toggleTag = (tag) =>
    setPrefs((p) => ({
      ...p,
      lifestyleTags: p.lifestyleTags.includes(tag)
        ? p.lifestyleTags.filter((t) => t !== tag)
        : [...p.lifestyleTags, tag],
    }));

  /* ---- Avatar upload (image) ---- */
  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { data } = await api.put('/auth/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      setAvatar(data.user.avatar || '');
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', { name, phone, gender, preferences: prefs });
      updateUser(data.user);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeUp">
      <span className="eyebrow">Account</span>
      <h1 className="font-display text-3xl lg:text-4xl text-ink mt-1 mb-8">
        Your <span className="text-gradient-jade">profile</span>
      </h1>

      <form onSubmit={save} className="space-y-6">
        {/* ===== Avatar upload ===== */}
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-jade-light to-violet-light ring-1 ring-ink/10 shadow-card">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User size={36} className="text-slate-light" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-gradient-to-br from-jade to-jade-dark text-paper flex items-center justify-center shadow-glowJade ring-2 ring-paper hover:scale-105 transition-transform disabled:opacity-50"
              aria-label="Change photo"
            >
              <Camera size={15} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              className="hidden"
            />
          </div>
          <p className="text-xs text-slate mt-3">
            {avatarUploading ? 'Uploading…' : 'Click the camera to change your photo'}
          </p>
        </div>

        {/* ===== Basic details ===== */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display text-lg text-ink">Basic details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full name</label>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Gender</label>
            <div className="flex gap-2">
              {['male', 'female', 'other'].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g)}
                  className={`px-4 py-2 rounded-full text-sm capitalize border transition-all duration-300 ${
                    gender === g
                      ? 'bg-jade text-paper border-jade shadow-glowJade'
                      : 'border-ink/15 text-slate hover:border-jade/40 hover:bg-jade-light/40'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Matching preferences (tenant) ===== */}
        {user.role === 'tenant' && (
          <div className="card p-6 space-y-4">
            <div>
              <h2 className="font-display text-lg text-ink">Matching preferences</h2>
              <p className="text-xs text-slate mt-1">
                Used by our AI to compute your compatibility score with every listing.
              </p>
            </div>

            <div>
              <label className="label">Preferred location</label>
              <input
                className="input-field"
                placeholder="e.g. Rohini, Delhi"
                value={prefs.preferredLocation}
                onChange={(e) => setPrefs({ ...prefs, preferredLocation: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Min budget</label>
                <input
                  type="number"
                  className="input-field"
                  value={prefs.budgetMin}
                  onChange={(e) => setPrefs({ ...prefs, budgetMin: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Max budget</label>
                <input
                  type="number"
                  className="input-field"
                  value={prefs.budgetMax}
                  onChange={(e) => setPrefs({ ...prefs, budgetMax: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Move-in date</label>
                <input
                  type="date"
                  className="input-field"
                  value={prefs.moveInDate}
                  onChange={(e) => setPrefs({ ...prefs, moveInDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">What type of flatmate are you?</label>
              <div className="flex flex-wrap gap-2">
                {LIFESTYLE_TAGS.map((tag) => {
                  const active = prefs.lifestyleTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
                        active
                          ? 'bg-jade text-paper border-jade shadow-glowJade'
                          : 'border-ink/15 text-slate hover:border-jade/40 hover:bg-jade-light/40'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label">About you</label>
              <textarea
                rows={3}
                maxLength={500}
                className="input-field resize-none"
                placeholder="Tell owners a bit about your routine and what you're looking for..."
                value={prefs.about}
                onChange={(e) => setPrefs({ ...prefs, about: e.target.value })}
              />
            </div>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={14} /> {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
