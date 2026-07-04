import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, UploadCloud, X } from 'lucide-react';
import api from '../services/api';

const AMENITIES = ['Wifi', 'AC', 'Fridge', 'CCTV', 'Machine', 'TV', 'PowerBackup', 'Parking'];
const ROOM_TYPES = ['single', 'shared-double', 'shared-triple', '1bhk', '2bhk', '3bhk', 'pg'];

export default function PostListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    rent: '',
    securityDeposit: '',
    availableFrom: '',
    roomType: 'single',
    furnishing: 'semi-furnished',
    genderPreference: 'any',
  });
  const [amenities, setAmenities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleAmenity = (a) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('amenities', JSON.stringify(amenities));
      photos.forEach((p) => fd.append('photos', p));

      await api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing posted!');
      navigate('/owner');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeUp">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink hover:-translate-x-1 transition-all mb-6">
        <ArrowLeft size={14} /> Back
      </button>

      <span className="eyebrow">New listing</span>
      <h1 className="font-display text-3xl lg:text-4xl text-ink mt-1 mb-8">
        Post a <span className="text-gradient-jade">room</span>
      </h1>

      <form onSubmit={submit} className="card p-6 space-y-5">
        <div>
          <label className="label">Title</label>
          <input
            required
            className="input-field"
            placeholder="Spacious 1BHK near Sector 7"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            required
            rows={4}
            className="input-field resize-none"
            placeholder="Describe the room, neighbourhood and who it suits best..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Address</label>
            <input
              required
              className="input-field"
              placeholder="Sector 7, Rohini"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div>
            <label className="label">City</label>
            <input
              required
              className="input-field"
              placeholder="Delhi"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Rent (₹/mo)</label>
            <input
              type="number"
              required
              className="input-field"
              value={form.rent}
              onChange={(e) => setForm({ ...form, rent: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Deposit (₹)</label>
            <input
              type="number"
              className="input-field"
              value={form.securityDeposit}
              onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Available from</label>
            <input
              type="date"
              required
              className="input-field"
              value={form.availableFrom}
              onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Room type</label>
            <select
              className="input-field"
              value={form.roomType}
              onChange={(e) => setForm({ ...form, roomType: e.target.value })}
            >
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Furnishing</label>
            <select
              className="input-field"
              value={form.furnishing}
              onChange={(e) => setForm({ ...form, furnishing: e.target.value })}
            >
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-furnished</option>
              <option value="fully-furnished">Fully furnished</option>
            </select>
          </div>
          <div>
            <label className="label">Preference</label>
            <select
              className="input-field"
              value={form.genderPreference}
              onChange={(e) => setForm({ ...form, genderPreference: e.target.value })}
            >
              <option value="any">Any</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* Amenities toggle */}
        <div>
          <label className="label">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => {
              const active = amenities.includes(a);
              return (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${
                    active
                      ? 'bg-jade text-paper border-jade shadow-glowJade'
                      : 'border-ink/15 text-slate hover:border-jade/40 hover:bg-jade-light/40'
                  }`}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        {/* Photo upload — premium dropzone with previews */}
        <div>
          <label className="label">Photos</label>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-ink/15 rounded-xl py-8 cursor-pointer hover:border-jade/50 hover:bg-jade-light/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-jade-light flex items-center justify-center ring-1 ring-jade/20">
              <UploadCloud size={22} className="text-jade-dark" />
            </div>
            <span className="text-sm text-slate">
              {photos.length ? `${photos.length} photo(s) selected` : 'Click to upload (JPG, PNG, up to 6)'}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => setPhotos(Array.from(e.target.files).slice(0, 6))}
            />
          </label>

          {/* preview thumbnails */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
              {photos.map((p, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden ring-1 ring-ink/10 group">
                  <img src={URL.createObjectURL(p)} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink/70 text-paper flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove photo"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Posting...' : 'Post listing'}
        </button>
      </form>
    </div>
  );
}
